import { HTTP_CONFIG, LOGIN_PATH, STORAGE_KEYS } from "./http.config";
import { tokenStorage } from "./token-storage";
import {
  ApiError,
  type ApiErrorBody,
  type HttpMethod,
  type QueryParams,
  type RequestOptions,
} from "./http.types";
import { toast } from "@/components/ui/use-toast";
import i18n from "i18next";

function buildQueryString(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) search.append(key, String(item));
      }
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildUrl(path: string, params?: QueryParams): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${HTTP_CONFIG.BASE_URL}${normalized}${buildQueryString(params)}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(body: unknown, options: RequestOptions): Headers {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // For JSON bodies, set Content-Type. For FormData, let the browser set the
  // multipart boundary itself — never set it manually.
  if (body !== undefined && !isFormData(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const language = localStorage.getItem(STORAGE_KEYS.language);
  if (language && !headers.has("Accept-Language")) headers.set("Accept-Language", language);

  if (!options.skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const activeRole = localStorage.getItem(STORAGE_KEYS.activeRole);
  if (activeRole && !headers.has("X-Active-Role")) headers.set("X-Active-Role", activeRole);

  return headers;
}

/**
 * Fired on a 401. Default: clear tokens and bounce to the login page. The auth
 * store can override this (e.g. to also reset in-memory state) via
 * {@link setUnauthorizedHandler}.
 */
let onUnauthorized: () => void = () => {
  tokenStorage.clear();
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
};

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | undefined;
  let message = response.statusText || `Request failed with status ${response.status}`;
  try {
    body = (await response.json()) as ApiErrorBody;
    if (body?.message) message = body.message;
  } catch {
    // Non-JSON error body — keep the status text as the message.
  }
  return new ApiError({
    message,
    status: response.status,
    code: body?.error ?? body?.key,
    body,
  });
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = HTTP_CONFIG.TIMEOUT_MS, responseType = "json" } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers: buildHeaders(body, options),
      body: body === undefined ? undefined : isFormData(body) ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    throw new ApiError({
      message: aborted ? "Request timed out" : "Network error — please check your connection.",
      status: 0,
      code: aborted ? "TIMEOUT" : "NETWORK_ERROR",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401) {
    onUnauthorized();
    throw await parseError(response);
  }

  if (!response.ok) {
    const apiError = await parseError(response);
    // Surface the common cross-cutting failures here (the "fetch" layer), with the
    // backend's localized message — stores keep other errors in their own slice.
    if (response.status === 403) {
      toast({
        variant: "destructive",
        title: i18n.t("errors.accessDenied"),
        description: apiError.body?.message || i18n.t("errors.accessDeniedDescription"),
      });
    } else if (response.status === 429) {
      toast({
        variant: "destructive",
        title: i18n.t("errors.rateLimited"),
        description: apiError.body?.message || i18n.t("errors.rateLimitedDescription"),
      });
    }
    throw apiError;
  }

  if (responseType === "void" || response.status === 204) return undefined as T;
  if (responseType === "blob") return (await response.blob()) as T;
  if (responseType === "text") return (await response.text()) as T;

  // 2xx with an empty body (e.g. some POSTs) → undefined rather than a JSON parse error.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Reusable HTTP methods to call from `*.service.ts` files.
 *
 * @example
 * const schools = await http.get<PaginatedResponse<SchoolRow>>("/platform/schools", {
 *   params: { page: 0, size: 20, status: "ACTIVE" },
 * });
 */
export const http = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("PATCH", path, body, options),

  /** DELETE supports a body for bulk operations (e.g. `DELETE /schools` with `[ids]`). */
  delete: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>("DELETE", path, body, options),
};

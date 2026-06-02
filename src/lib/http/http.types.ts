export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type ResponseType = "json" | "blob" | "text" | "void";

/**
 * Error body the backend returns (see GlobalExceptionHandler / the security
 * filters). The error-code key is sent as `error` by some paths and `key` by
 * others, so both are optional here.
 */
export interface ApiErrorBody {
  error?: string;
  key?: string;
  message?: string;
  status?: number;
  [extra: string]: unknown;
}

export interface RequestOptions {
  /** Query-string params. Arrays become repeated keys (`?id=1&id=2`). */
  params?: QueryParams;
  /** Extra headers, merged over the defaults (and able to override them). */
  headers?: Record<string, string>;
  /** Caller-supplied abort signal; the request also aborts on timeout. */
  signal?: AbortSignal;
  /** Per-request timeout override (ms). Defaults to HTTP_CONFIG.TIMEOUT_MS. */
  timeoutMs?: number;
  /** Skip the Authorization header — for public endpoints (login, refresh). */
  skipAuth?: boolean;
  /** How to parse a successful response body. Defaults to "json". */
  responseType?: ResponseType;
}

/**
 * Thrown for every non-2xx response and for network/timeout failures.
 * `status === 0` means there was no HTTP response (network error / timeout).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: ApiErrorBody;

  constructor(args: { message: string; status: number; code?: string; body?: ApiErrorBody }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.body = args.body;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

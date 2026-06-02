/**
 * HTTP layer configuration — base URL, timeouts, and the localStorage keys the
 * client reads (auth token, active role, language). Keep this free of React /
 * store imports so it can be used from anywhere without circular deps.
 */
export const HTTP_CONFIG = {
  /** Base URL incl. the `/api/v1` prefix; trailing slash stripped so paths can start with `/`. */
  BASE_URL: (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1").replace(/\/+$/, ""),
  /** Default per-request timeout in milliseconds. */
  TIMEOUT_MS: 30_000,
} as const;

export const STORAGE_KEYS = {
  accessToken: "platform_access_token",
  refreshToken: "platform_refresh_token",
  activeRole: "platform_active_role",
  language: "platform_language",
  user: "platform_user",
} as const;

/** Where the client redirects on a 401 (unauthenticated / expired token). */
export const LOGIN_PATH = "/login";

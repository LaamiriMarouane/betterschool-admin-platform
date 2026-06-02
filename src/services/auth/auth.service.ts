import { http } from "@/lib/http";
import type { LoginRequest, LoginResponse } from "@/types/auth.types";

const BASE = "/auth";

/** Backend PasswordResetResponseDTO — a generic message + success flag. */
export interface PasswordResetResult {
  message?: string;
  success?: boolean;
}

/**
 * Auth API calls. Services are thin: build the request, return the typed
 * response, and let the store own loading/error/state. No try/catch here.
 */
export const authService = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    http.post<LoginResponse>(`${BASE}/login`, payload, { skipAuth: true }),

  logout: (): Promise<void> =>
    http.post<void>(`${BASE}/logout`, undefined, { responseType: "void" }),

  refresh: (refreshToken: string): Promise<LoginResponse> =>
    http.post<LoginResponse>(`${BASE}/refresh`, { refreshToken }, { skipAuth: true }),

  /** Effective permission keys for the current user, refreshed from the DB. */
  getPermissions: (): Promise<string[]> => http.get<string[]>(`${BASE}/permissions`),

  /** Start a forgot-password flow. Always 200 (generic) to avoid email enumeration. */
  forgotPassword: (email: string): Promise<PasswordResetResult> =>
    http.post<PasswordResetResult>(`${BASE}/password/forgot`, { email }, { skipAuth: true }),

  /** Complete a reset using the emailed token + a new password. */
  resetPasswordWithToken: (body: {
    token: string;
    newPassword: string;
    newPasswordConf: string;
  }): Promise<PasswordResetResult> =>
    http.post<PasswordResetResult>(`${BASE}/password/reset`, body, { skipAuth: true }),
};

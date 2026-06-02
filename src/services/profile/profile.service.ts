import { http } from "@/lib/http";

const BASE = "/profile";

/** Request body for the authenticated user changing their own password. */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authenticated-user profile API. Thin: build the request, return the typed
 * response; the store owns loading/error/state. No try/catch here.
 */
export const profileService = {
  changePassword: (body: ChangePasswordRequest): Promise<void> =>
    http.post<void>(`${BASE}/me/password`, body, { responseType: "void" }),
};

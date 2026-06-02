import { http } from "@/lib/http";
import type {
  CreatePlatformUserRequest,
  PlatformUserCredentialsDTO,
  PlatformUserDTO,
} from "@/types/platform-user.types";

const BASE = "/platform/users";

/**
 * Platform staff (Team) API. Thin: build the request, return the typed response;
 * the store owns loading/error/state. No try/catch here.
 */
export const teamService = {
  listUsers: (): Promise<PlatformUserDTO[]> => http.get<PlatformUserDTO[]>(BASE),

  /** The assignable platform permission catalog (source of truth = backend). */
  listPermissions: (): Promise<string[]> => http.get<string[]>(`${BASE}/permissions`),

  createUser: (body: CreatePlatformUserRequest): Promise<PlatformUserCredentialsDTO> =>
    http.post<PlatformUserCredentialsDTO>(BASE, body),

  /** Admin-reset a staffer's password; returns the new one-time temp password. */
  resetPassword: (userId: string): Promise<PlatformUserCredentialsDTO> =>
    http.post<PlatformUserCredentialsDTO>(`${BASE}/${userId}/reset-password`),

  updatePermissions: (userId: string, permissionKeys: string[]): Promise<PlatformUserDTO> =>
    http.put<PlatformUserDTO>(`${BASE}/${userId}/permissions`, { permissionKeys }),

  setEnabled: (userId: string, enabled: boolean): Promise<PlatformUserDTO> =>
    http.put<PlatformUserDTO>(`${BASE}/${userId}/status`, { enabled }),

  deleteUser: (userId: string): Promise<void> => http.delete<void>(`${BASE}/${userId}`),
};

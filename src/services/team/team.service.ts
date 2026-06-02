import { http } from "@/lib/http";
import type {
  CreatePlatformUserRequest,
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

  createUser: (body: CreatePlatformUserRequest): Promise<PlatformUserDTO> =>
    http.post<PlatformUserDTO>(BASE, body),

  updatePermissions: (userId: string, permissionKeys: string[]): Promise<PlatformUserDTO> =>
    http.put<PlatformUserDTO>(`${BASE}/${userId}/permissions`, { permissionKeys }),

  setEnabled: (userId: string, enabled: boolean): Promise<PlatformUserDTO> =>
    http.put<PlatformUserDTO>(`${BASE}/${userId}/status`, { enabled }),

  deleteUser: (userId: string): Promise<void> => http.delete<void>(`${BASE}/${userId}`),
};

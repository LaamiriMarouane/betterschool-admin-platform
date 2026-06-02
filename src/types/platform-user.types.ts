/** A platform staff member (Team page). Mirrors backend dto/platform/PlatformUserDTO. */
export interface PlatformUserDTO {
  id: string;
  fullName: string | null;
  email: string | null;
  enabled: boolean;
  /** Effective platform.* capability keys this user holds. */
  permissionKeys: string[];
  createdAt: string | null; // ISO datetime
}

/** Create-platform-user request. Mirrors backend CreatePlatformUserRequestDTO. */
export interface CreatePlatformUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  permissionKeys: string[];
}

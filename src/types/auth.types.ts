import type { AttachmentShortDTO } from "./attachment.types";

/** POST /auth/login body. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Mirrors backend dto/security/JwtAuthenticationResponse. */
export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

/** View of the backend dto/user/UserResponseDTO that the console renders. */
export interface AuthUser {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: AttachmentShortDTO | null;
}

/** POST /auth/login response (LoginResponseDTO). */
export interface LoginResponse {
  jwt: JwtTokens;
  user: AuthUser;
  /** Effective permission keys, e.g. "platform.schools.read". */
  permissions: string[];
}

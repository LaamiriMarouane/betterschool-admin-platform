import type { AuthUser } from "@/types/auth.types";

import { STORAGE_KEYS } from "./http.config";

/**
 * Single source of truth for auth tokens (and the cached current user) in
 * localStorage. The HTTP client reads tokens from here and the auth store writes
 * to it — keeping the client decoupled from the store (no circular import). The
 * cached user lets the navbar show the connected user across a page refresh.
 */
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(STORAGE_KEYS.accessToken),
  getRefreshToken: (): string | null => localStorage.getItem(STORAGE_KEYS.refreshToken),

  setTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  },

  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setUser: (user: AuthUser): void => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.activeRole);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};

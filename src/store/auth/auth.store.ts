import { create } from "zustand";
import { LOGIN_PATH, setUnauthorizedHandler, tokenStorage } from "@/lib/http";
import { authService } from "@/services/auth/auth.service";
import { getErrorMessage } from "@/lib/api-error";
import { resetAllStores } from "@/store/utils/reset-all-stores";
import type { AuthUser, LoginRequest } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (payload: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Re-fetch effective permissions for the current token (e.g. after a page refresh). */
  loadPermissions: () => Promise<void>;
  /** Permission check used to gate routes and UI actions. */
  hasPermission: (key: string) => boolean;
}

/**
 * Store-first: components dispatch `login`/`logout` and read `loading`/`error`/
 * state — they never call the service or handle errors themselves.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: tokenStorage.getUser(),
  permissions: [],
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  loading: false,
  error: null,

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(payload);
      // Drop any domain data cached from a previous session before this user's loads.
      resetAllStores();
      tokenStorage.setTokens(res.jwt.accessToken, res.jwt.refreshToken);
      tokenStorage.setUser(res.user);
      set({
        user: res.user,
        permissions: res.permissions,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({ loading: false, error: getErrorMessage(err).message, isAuthenticated: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore — we clear local state regardless of the server response.
    }
    tokenStorage.clear();
    set({ user: null, permissions: [], isAuthenticated: false });
    resetAllStores();
  },

  loadPermissions: async () => {
    if (!tokenStorage.getAccessToken()) return;
    try {
      const permissions = await authService.getPermissions();
      set({ permissions, isAuthenticated: true });
    } catch {
      // A 401 is handled by the unauthorized handler below; anything else
      // (e.g. endpoint missing) leaves permissions empty — the app still works
      // with auth-only gating.
    }
  },

  hasPermission: (key) => get().permissions.includes(key),
}));

// On any 401 the HTTP client calls this: clear tokens + in-memory auth and
// bounce to the login page (overrides the client's default token-only clear).
setUnauthorizedHandler(() => {
  tokenStorage.clear();
  useAuthStore.setState({ user: null, permissions: [], isAuthenticated: false });
  resetAllStores();
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
});

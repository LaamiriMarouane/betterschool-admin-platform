import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import { teamService } from "@/services/team/team.service";
import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import type {
  CreatePlatformUserRequest,
  PlatformUserCredentialsDTO,
  PlatformUserDTO,
} from "@/types/platform-user.types";

interface LoadingStates {
  list: boolean;
  save: boolean;
}

interface ErrorStates {
  list: StoreError | null;
}

interface TeamState {
  users: PlatformUserDTO[];
  /** Assignable platform permission keys, fetched from the backend (drift-safe). */
  permissionCatalog: string[];
  loading: LoadingStates;
  errors: ErrorStates;
}

interface TeamActions {
  fetchUsers: () => Promise<void>;
  fetchPermissionCatalog: () => Promise<void>;
  /** Resolves the one-time credentials on success (null on failure) so the caller can reveal them. */
  createUser: (request: CreatePlatformUserRequest) => Promise<PlatformUserCredentialsDTO | null>;
  /** Admin-reset a staffer's password; resolves the one-time credentials (null on failure). */
  resetPassword: (userId: string) => Promise<PlatformUserCredentialsDTO | null>;
  updatePermissions: (userId: string, permissionKeys: string[]) => Promise<boolean>;
  setUserEnabled: (userId: string, enabled: boolean) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  clearErrors: () => void;
  resetStore: () => void;
}

type TeamStore = TeamState & { actions: TeamActions };

const initialState: TeamState = {
  users: [],
  permissionCatalog: [],
  loading: { list: false, save: false },
  errors: { list: null },
};

/**
 * Store-first: pages read via the selector hooks and dispatch `actions`. Mutations
 * update `users` in place from the response (no refetch) and toast the outcome;
 * the list-fetch error is kept in `errors` (global 401/403/429 are handled by the
 * HTTP client) and never rendered as a raw string by pages.
 */
export const useTeamStore = create<TeamStore>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        fetchUsers: async () => {
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const users = await teamService.listUsers();
            set((state) => ({ users, loading: { ...state.loading, list: false } }));
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, list: false },
              errors: { ...state.errors, list: getErrorMessage(error) },
            }));
          }
        },

        fetchPermissionCatalog: async () => {
          try {
            const permissionCatalog = await teamService.listPermissions();
            set({ permissionCatalog });
          } catch {
            // Reference data — a failure here is non-blocking (the list-fetch error
            // already surfaces any auth problem); leave the catalog empty.
          }
        },

        createUser: async (request) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const credentials = await teamService.createUser(request);
            set((state) => ({
              users: [credentials.user, ...state.users],
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("team.created"), description: i18n.t("team.createdDesc") });
            return credentials;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return null;
          }
        },

        resetPassword: async (userId) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const credentials = await teamService.resetPassword(userId);
            set((state) => ({
              users: state.users.map((u) => (u.id === credentials.user.id ? credentials.user : u)),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("team.passwordReset") });
            return credentials;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return null;
          }
        },

        updatePermissions: async (userId, permissionKeys) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const updated = await teamService.updatePermissions(userId, permissionKeys);
            set((state) => ({
              users: state.users.map((u) => (u.id === updated.id ? updated : u)),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("team.permissionsUpdated") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        setUserEnabled: async (userId, enabled) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const updated = await teamService.setEnabled(userId, enabled);
            set((state) => ({
              users: state.users.map((u) => (u.id === updated.id ? updated : u)),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t(enabled ? "team.userEnabled" : "team.userDisabled") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        deleteUser: async (userId) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            await teamService.deleteUser(userId);
            set((state) => ({
              users: state.users.filter((u) => u.id !== userId),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("team.userDeleted") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        clearErrors: () => set({ errors: initialState.errors }),

        resetStore: () => set(initialState),
      },
    }),
    { name: "team-store" },
  ),
);

// ─── Selector hooks ───
export const useTeamUsers = () => useTeamStore((state) => state.users);
export const useTeamPermissionCatalog = () => useTeamStore((state) => state.permissionCatalog);
export const useTeamLoading = () => useTeamStore((state) => state.loading);
export const useTeamErrors = () => useTeamStore((state) => state.errors);
export const useTeamActions = () => useTeamStore((state) => state.actions);

export default useTeamStore;

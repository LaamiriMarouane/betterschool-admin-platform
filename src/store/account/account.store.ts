import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import { authService } from "@/services/auth/auth.service";
import { profileService } from "@/services/profile/profile.service";
import { toast } from "@/components/ui/use-toast";
import { notifyApiError } from "@/lib/notify";

interface AccountState {
  loading: { forgot: boolean; reset: boolean; change: boolean };
}

interface AccountActions {
  /** Always resolves true once the request completes (backend is intentionally generic). */
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string, newPasswordConf: string) => Promise<boolean>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  resetStore: () => void;
}

type AccountStore = AccountState & { actions: AccountActions };

const initialState: AccountState = {
  loading: { forgot: false, reset: false, change: false },
};

/**
 * Credential self-service (forgot / reset-with-token / change password). Store-first:
 * pages dispatch and read `loading`; success toasts and API-error notifications live
 * here, never in the page.
 */
export const useAccountStore = create<AccountStore>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        forgotPassword: async (email) => {
          set((state) => ({ loading: { ...state.loading, forgot: true } }));
          try {
            await authService.forgotPassword(email.trim());
            return true;
          } catch (error) {
            notifyApiError(error);
            return false;
          } finally {
            set((state) => ({ loading: { ...state.loading, forgot: false } }));
          }
        },

        resetPassword: async (token, newPassword, newPasswordConf) => {
          set((state) => ({ loading: { ...state.loading, reset: true } }));
          try {
            await authService.resetPasswordWithToken({ token, newPassword, newPasswordConf });
            toast({ title: i18n.t("account.reset.success") });
            return true;
          } catch (error) {
            notifyApiError(error);
            return false;
          } finally {
            set((state) => ({ loading: { ...state.loading, reset: false } }));
          }
        },

        changePassword: async (oldPassword, newPassword, confirmPassword) => {
          set((state) => ({ loading: { ...state.loading, change: true } }));
          try {
            await profileService.changePassword({ oldPassword, newPassword, confirmPassword });
            toast({ title: i18n.t("account.change.success") });
            return true;
          } catch (error) {
            notifyApiError(error);
            return false;
          } finally {
            set((state) => ({ loading: { ...state.loading, change: false } }));
          }
        },

        resetStore: () => set(initialState),
      },
    }),
    { name: "account-store" },
  ),
);

// ─── Selector hooks ───
export const useAccountLoading = () => useAccountStore((state) => state.loading);
export const useAccountActions = () => useAccountStore((state) => state.actions);

export default useAccountStore;

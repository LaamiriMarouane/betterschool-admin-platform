import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { dashboardService } from "@/services/dashboard/dashboard.service";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import type { PlatformDashboardDTO } from "@/types/dashboard.types";

interface DashboardState {
  data: PlatformDashboardDTO | null;
  loading: { overview: boolean };
  errors: { overview: StoreError | null };
}

interface DashboardActions {
  fetchDashboard: () => Promise<void>;
  clearErrors: () => void;
  resetStore: () => void;
}

type DashboardStore = DashboardState & { actions: DashboardActions };

const initialState: DashboardState = {
  data: null,
  loading: { overview: false },
  errors: { overview: null },
};

/**
 * Store-first: the page dispatches `fetchDashboard` and reads `data`/`loading`/
 * `error` — it never calls the service or handles errors itself.
 */
export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        fetchDashboard: async () => {
          set((state) => ({
            loading: { ...state.loading, overview: true },
            errors: { ...state.errors, overview: null },
          }));
          try {
            const data = await dashboardService.getDashboard();
            set((state) => ({ data, loading: { ...state.loading, overview: false } }));
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, overview: false },
              errors: { ...state.errors, overview: getErrorMessage(error) },
            }));
          }
        },

        clearErrors: () => set({ errors: initialState.errors }),

        resetStore: () => set(initialState),
      },
    }),
    { name: "dashboard-store" },
  ),
);

// ─── Selector hooks ───
export const useDashboardData = () => useDashboardStore((state) => state.data);
export const useDashboardLoading = () => useDashboardStore((state) => state.loading);
export const useDashboardError = () => useDashboardStore((state) => state.errors.overview);
export const useDashboardActions = () => useDashboardStore((state) => state.actions);

export default useDashboardStore;

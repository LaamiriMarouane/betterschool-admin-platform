import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { plansService } from "@/services/plans/plans.service";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import type { PlatformPlanDTO } from "@/types/plan.types";

interface PlansState {
  plans: PlatformPlanDTO[];
  loading: { list: boolean };
  errors: { list: StoreError | null };
}

interface PlansActions {
  fetchPlans: () => Promise<void>;
  clearErrors: () => void;
  resetStore: () => void;
}

type PlansStore = PlansState & { actions: PlansActions };

const initialState: PlansState = {
  plans: [],
  loading: { list: false },
  errors: { list: null },
};

export const usePlansStore = create<PlansStore>()(
  devtools(
    (set) => ({
      ...initialState,

      actions: {
        fetchPlans: async () => {
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const plans = await plansService.listPlans();
            set((state) => ({ plans, loading: { ...state.loading, list: false } }));
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, list: false },
              errors: { ...state.errors, list: getErrorMessage(error) },
            }));
          }
        },

        clearErrors: () => set({ errors: initialState.errors }),

        resetStore: () => set(initialState),
      },
    }),
    { name: "plans-store" },
  ),
);

// ─── Selector hooks ───
export const usePlans = () => usePlansStore((state) => state.plans);
export const usePlansLoading = () => usePlansStore((state) => state.loading);
export const usePlansActions = () => usePlansStore((state) => state.actions);

export default usePlansStore;

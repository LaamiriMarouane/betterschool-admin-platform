import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  schoolsService,
  type CustomContractRequest,
  type PlatformSchoolsQuery,
  type TrialExtendRequest,
} from "@/services/schools/schools.service";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import type {
  PlatformSchoolDetailDTO,
  PlatformSchoolRowDTO,
} from "@/types/school.types";
import type { PlanTier, SchoolSubscriptionStatus } from "@/types/subscription.types";

// Must be one of the DataTable's page-size options [10, 20, 50, 100, 200] or the
// page-size select renders empty (no matching item). Mirrors the product app default.
const DEFAULT_PAGE_SIZE = 10;

interface SchoolsFilters {
  search: string;
  status: SchoolSubscriptionStatus | null;
  tier: PlanTier | null;
}

interface LoadingStates {
  list: boolean;
  detail: boolean;
  save: boolean;
}

interface ErrorStates {
  list: StoreError | null;
  detail: StoreError | null;
}

interface SchoolsState {
  rows: PlatformSchoolRowDTO[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
  sort: string;
  filters: SchoolsFilters;
  detail: PlatformSchoolDetailDTO | null;
  loading: LoadingStates;
  errors: ErrorStates;
}

interface SchoolsActions {
  fetchSchools: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: SchoolSubscriptionStatus | null) => void;
  setTierFilter: (tier: PlanTier | null) => void;
  /** Apply page + size together (the DataTable / URL hook sends a full PaginationState). */
  setPagination: (page: number, size: number) => void;
  fetchSchool: (schoolId: string) => Promise<void>;
  setCustomContract: (schoolId: string, request: CustomContractRequest) => Promise<boolean>;
  extendTrial: (schoolId: string, request: TrialExtendRequest) => Promise<boolean>;
  clearDetail: () => void;
  clearErrors: () => void;
  resetStore: () => void;
}

type SchoolsStore = SchoolsState & { actions: SchoolsActions };

const initialState: SchoolsState = {
  rows: [],
  totalItems: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: "createdAt,desc",
  filters: { search: "", status: null, tier: null },
  detail: null,
  loading: { list: false, detail: false, save: false },
  errors: { list: null, detail: null },
};

/**
 * Re-derive the detail-level enrollment fields after a subscription change so the tab's
 * usage bar reflects the new cap without a refetch. `effectiveMaxEnrollments` null = unlimited.
 */
function applySubscriptionToDetail(
  detail: PlatformSchoolDetailDTO,
  subscription: PlatformSchoolDetailDTO["subscription"],
): PlatformSchoolDetailDTO {
  const limit = subscription?.effectiveMaxEnrollments ?? null;
  const count = detail.enrollmentCount;
  let status: PlatformSchoolDetailDTO["enrollmentStatus"] = "OK";
  if (limit != null && limit > 0) {
    if (count >= limit) status = "EXCEEDED";
    else if (count / limit >= 0.9) status = "WARNING";
  }
  return { ...detail, subscription, enrollmentLimit: limit, enrollmentStatus: status };
}

/**
 * Store-first: pages read state via the selector hooks below and dispatch the
 * grouped `actions`. Fetch errors are resolved with getErrorMessage and kept in
 * `errors` (global 401/403/429 are toasted by the HTTP client) — never rendered
 * as raw strings by pages.
 */
export const useSchoolsStore = create<SchoolsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        fetchSchools: async () => {
          const { page, size, sort, filters } = get();
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const query: PlatformSchoolsQuery = {
              page,
              size,
              sort,
              search: filters.search,
              status: filters.status,
              tier: filters.tier,
            };
            const res = await schoolsService.listSchools(query);
            set((state) => ({
              rows: res.data,
              totalItems: res.totalItems,
              totalPages: res.totalPages,
              page: res.currentPage,
              loading: { ...state.loading, list: false },
            }));
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, list: false },
              errors: { ...state.errors, list: getErrorMessage(error) },
            }));
          }
        },

        setSearch: (search) => {
          set((state) => ({ filters: { ...state.filters, search }, page: 0 }));
          void get().actions.fetchSchools();
        },

        setStatusFilter: (status) => {
          set((state) => ({ filters: { ...state.filters, status }, page: 0 }));
          void get().actions.fetchSchools();
        },

        setTierFilter: (tier) => {
          set((state) => ({ filters: { ...state.filters, tier }, page: 0 }));
          void get().actions.fetchSchools();
        },

        setPagination: (page, size) => {
          set({ page, size });
          void get().actions.fetchSchools();
        },

        fetchSchool: async (schoolId) => {
          set((state) => ({
            detail: null,
            loading: { ...state.loading, detail: true },
            errors: { ...state.errors, detail: null },
          }));
          try {
            const detail = await schoolsService.getSchool(schoolId);
            set((state) => ({ detail, loading: { ...state.loading, detail: false } }));
          } catch (error) {
            set((state) => ({
              loading: { ...state.loading, detail: false },
              errors: { ...state.errors, detail: getErrorMessage(error) },
            }));
          }
        },

        setCustomContract: async (schoolId, request) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const subscription = await schoolsService.setCustomContract(schoolId, request);
            set((state) => ({
              detail: state.detail
                ? applySubscriptionToDetail(state.detail, subscription)
                : state.detail,
              loading: { ...state.loading, save: false },
            }));
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        extendTrial: async (schoolId, request) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const subscription = await schoolsService.extendTrial(schoolId, request);
            set((state) => ({
              detail: state.detail
                ? applySubscriptionToDetail(state.detail, subscription)
                : state.detail,
              loading: { ...state.loading, save: false },
            }));
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        clearDetail: () =>
          set((state) => ({ detail: null, errors: { ...state.errors, detail: null } })),

        clearErrors: () => set({ errors: initialState.errors }),

        resetStore: () => set(initialState),
      },
    }),
    { name: "schools-store" },
  ),
);

// ─── Selector hooks (one per state slice; actions are grouped) ───
export const useSchoolRows = () => useSchoolsStore((state) => state.rows);
export const useSchoolsTotalItems = () => useSchoolsStore((state) => state.totalItems);
export const useSchoolsTotalPages = () => useSchoolsStore((state) => state.totalPages);
export const useSchoolsPage = () => useSchoolsStore((state) => state.page);
export const useSchoolsSize = () => useSchoolsStore((state) => state.size);
export const useSchoolsFilters = () => useSchoolsStore((state) => state.filters);
export const useSchoolsLoading = () => useSchoolsStore((state) => state.loading);
export const useSchoolsErrors = () => useSchoolsStore((state) => state.errors);
export const useSchoolDetail = () => useSchoolsStore((state) => state.detail);
export const useSchoolsActions = () => useSchoolsStore((state) => state.actions);

export default useSchoolsStore;

import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { schoolDetailService } from "@/services/schools/school-detail.service";
import { supportTicketService } from "@/services/support/support-ticket.service";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import type {
  AuditLogResponseDTO,
  AuditLogStatsDTO,
  PlatformSchoolModulesDTO,
  SubscriptionInvoiceItemDTO,
} from "@/types/school-detail.types";
import type { SupportTicketListDTO } from "@/types/support-ticket.types";

interface TabLoading {
  modules: boolean;
  billing: boolean;
  support: boolean;
  audit: boolean;
}

interface TabErrors {
  modules: StoreError | null;
  billing: StoreError | null;
  support: StoreError | null;
  audit: StoreError | null;
}

interface SchoolDetailTabsState {
  schoolId: string | null;
  modules: PlatformSchoolModulesDTO | null;
  invoices: SubscriptionInvoiceItemDTO[];
  invoicesHasMore: boolean;
  invoicesAfter: string | null;
  supportTickets: SupportTicketListDTO[];
  supportTotal: number;
  auditRows: AuditLogResponseDTO[];
  auditTotal: number;
  auditPage: number;
  auditSize: number;
  auditStats: AuditLogStatsDTO | null;
  loading: TabLoading;
  errors: TabErrors;
}

interface SchoolDetailTabsActions {
  reset: () => void;
  fetchModules: (schoolId: string) => Promise<void>;
  fetchBilling: (schoolId: string, after?: string | null) => Promise<void>;
  fetchSupport: (schoolId: string) => Promise<void>;
  fetchAudit: (schoolId: string, page?: number, size?: number) => Promise<void>;
  fetchAuditStats: (schoolId: string) => Promise<void>;
}

type SchoolDetailTabsStore = SchoolDetailTabsState & { actions: SchoolDetailTabsActions };

const initialLoading: TabLoading = {
  modules: false,
  billing: false,
  support: false,
  audit: false,
};

const initialErrors: TabErrors = {
  modules: null,
  billing: null,
  support: null,
  audit: null,
};

const initialState: SchoolDetailTabsState = {
  schoolId: null,
  modules: null,
  invoices: [],
  invoicesHasMore: false,
  invoicesAfter: null,
  supportTickets: [],
  supportTotal: 0,
  auditRows: [],
  auditTotal: 0,
  auditPage: 0,
  auditSize: 10,
  auditStats: null,
  loading: initialLoading,
  errors: initialErrors,
};

export const useSchoolDetailTabsStore = create<SchoolDetailTabsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        reset: () => set(initialState),

        fetchModules: async (schoolId) => {
          set((s) => ({
            schoolId,
            loading: { ...s.loading, modules: true },
            errors: { ...s.errors, modules: null },
          }));
          try {
            const modules = await schoolDetailService.getModules(schoolId);
            set((s) => ({ modules, loading: { ...s.loading, modules: false } }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, modules: false },
              errors: { ...s.errors, modules: getErrorMessage(error) },
            }));
          }
        },

        fetchBilling: async (schoolId, after) => {
          set((s) => ({
            schoolId,
            loading: { ...s.loading, billing: true },
            errors: { ...s.errors, billing: null },
          }));
          try {
            const res = await schoolDetailService.listInvoices(schoolId, { after });
            set((s) => ({
              invoices: after ? [...s.invoices, ...res.items] : res.items,
              invoicesHasMore: res.hasMore,
              invoicesAfter: res.after,
              loading: { ...s.loading, billing: false },
            }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, billing: false },
              errors: { ...s.errors, billing: getErrorMessage(error) },
            }));
          }
        },

        fetchSupport: async (schoolId) => {
          set((s) => ({
            schoolId,
            loading: { ...s.loading, support: true },
            errors: { ...s.errors, support: null },
          }));
          try {
            const res = await supportTicketService.list({
              page: 0,
              size: 8,
              schoolId,
              sortBy: "createdAt",
              sortDirection: "DESC",
            });
            set((s) => ({
              supportTickets: res.data,
              supportTotal: res.totalItems,
              loading: { ...s.loading, support: false },
            }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, support: false },
              errors: { ...s.errors, support: getErrorMessage(error) },
            }));
          }
        },

        fetchAudit: async (schoolId, page, size) => {
          const nextPage = page ?? get().auditPage;
          const nextSize = size ?? get().auditSize;
          set((s) => ({
            schoolId,
            auditPage: nextPage,
            auditSize: nextSize,
            loading: { ...s.loading, audit: true },
            errors: { ...s.errors, audit: null },
          }));
          try {
            const res = await schoolDetailService.searchAuditLogs(schoolId, {
              page: nextPage,
              size: nextSize,
              sortBy: "createdAt",
              sortDirection: "DESC",
            });
            set((s) => ({
              auditRows: res.data,
              auditTotal: res.totalItems,
              loading: { ...s.loading, audit: false },
            }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, audit: false },
              errors: { ...s.errors, audit: getErrorMessage(error) },
            }));
          }
        },

        fetchAuditStats: async (schoolId) => {
          try {
            const auditStats = await schoolDetailService.auditStats(schoolId);
            set({ auditStats });
          } catch {
            // stats are optional garnish — list error is enough
          }
        },
      },
    }),
    { name: "school-detail-tabs-store" },
  ),
);

export const useSchoolDetailTabsActions = () =>
  useSchoolDetailTabsStore((s) => s.actions);

export default useSchoolDetailTabsStore;

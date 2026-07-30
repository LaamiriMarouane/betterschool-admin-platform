import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/constants/support-ticket.constants";
import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import {
  supportTicketService,
  type SupportTicketsQuery,
} from "@/services/support/support-ticket.service";
import type {
  SupportTicketDetailDTO,
  SupportTicketListDTO,
  SupportTicketPlatformStatsDTO,
} from "@/types/support-ticket.types";

const DEFAULT_PAGE_SIZE = 20;

export type AssigneeFilter = "ALL" | "MINE" | "UNASSIGNED";

interface SupportTicketFilters {
  search: string;
  status: SupportTicketStatus | null;
  category: SupportTicketCategory | null;
  priority: SupportTicketPriority | null;
  schoolId: string | null;
  assignee: AssigneeFilter;
}

interface LoadingStates {
  list: boolean;
  detail: boolean;
  stats: boolean;
  save: boolean;
}

interface ErrorStates {
  list: StoreError | null;
  detail: StoreError | null;
}

interface SupportTicketState {
  rows: SupportTicketListDTO[];
  selected: SupportTicketDetailDTO | null;
  stats: SupportTicketPlatformStatsDTO | null;
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
  filters: SupportTicketFilters;
  loading: LoadingStates;
  errors: ErrorStates;
}

interface SupportTicketActions {
  fetchTickets: () => Promise<void>;
  fetchStats: () => Promise<void>;
  findById: (id: string) => Promise<void>;
  clearSelection: () => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: SupportTicketStatus | null) => void;
  setCategoryFilter: (category: SupportTicketCategory | null) => void;
  setPriorityFilter: (priority: SupportTicketPriority | null) => void;
  setSchoolIdFilter: (schoolId: string | null) => void;
  setAssigneeFilter: (assignee: AssigneeFilter) => void;
  setPagination: (page: number, size: number) => void;
  reply: (id: string, body: string) => Promise<boolean>;
  updateStatus: (id: string, status: SupportTicketStatus, note?: string) => Promise<boolean>;
  assign: (id: string, agentUserId: string, agentName: string) => Promise<boolean>;
  updatePriority: (id: string, priority: SupportTicketPriority) => Promise<boolean>;
  resetStore: () => void;
}

type SupportTicketStore = SupportTicketState & {
  actions: SupportTicketActions;
  /** Set by the page so assignee "MINE" can resolve without coupling the store to auth. */
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
};

const initialFilters: SupportTicketFilters = {
  search: "",
  status: null,
  category: null,
  priority: null,
  schoolId: null,
  assignee: "ALL",
};

const initialState: SupportTicketState = {
  rows: [],
  selected: null,
  stats: null,
  totalItems: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  filters: initialFilters,
  loading: { list: false, detail: false, stats: false, save: false },
  errors: { list: null, detail: null },
};

function patchListRow(
  rows: SupportTicketListDTO[],
  detail: SupportTicketDetailDTO,
): SupportTicketListDTO[] {
  return rows.map((row) =>
    row.id === detail.id
      ? {
          ...row,
          subject: detail.subject,
          category: detail.category,
          priority: detail.priority,
          status: detail.status,
          assignedToName: detail.assignedToName,
          messageCount: detail.messages?.length ?? row.messageCount,
          lastReplyAt: detail.lastReplyAt,
          satisfactionRating: detail.satisfactionRating,
        }
      : row,
  );
}

export const useSupportTicketStore = create<SupportTicketStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      currentUserId: null,

      setCurrentUserId: (id) => set({ currentUserId: id }),

      actions: {
        fetchTickets: async () => {
          const { page, size, filters, currentUserId } = get();
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const query: SupportTicketsQuery = {
              page,
              size,
              search: filters.search,
              statuses: filters.status ? [filters.status] : null,
              categories: filters.category ? [filters.category] : null,
              priorities: filters.priority ? [filters.priority] : null,
              schoolId: filters.schoolId,
              assignedToUserId:
                filters.assignee === "MINE" && currentUserId ? currentUserId : null,
              unassignedOnly: filters.assignee === "UNASSIGNED" ? true : null,
            };
            const res = await supportTicketService.list(query);
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

        fetchStats: async () => {
          set((state) => ({ loading: { ...state.loading, stats: true } }));
          try {
            const stats = await supportTicketService.stats();
            set((state) => ({ stats, loading: { ...state.loading, stats: false } }));
          } catch {
            set((state) => ({ loading: { ...state.loading, stats: false } }));
          }
        },

        findById: async (id) => {
          set((state) => ({
            loading: { ...state.loading, detail: true },
            errors: { ...state.errors, detail: null },
          }));
          try {
            const selected = await supportTicketService.findById(id);
            set((state) => ({
              selected,
              loading: { ...state.loading, detail: false },
            }));
          } catch (error) {
            set((state) => ({
              selected: null,
              loading: { ...state.loading, detail: false },
              errors: { ...state.errors, detail: getErrorMessage(error) },
            }));
          }
        },

        clearSelection: () => set({ selected: null }),

        setSearch: (search) => {
          set((state) => ({ filters: { ...state.filters, search }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setStatusFilter: (status) => {
          set((state) => ({ filters: { ...state.filters, status }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setCategoryFilter: (category) => {
          set((state) => ({ filters: { ...state.filters, category }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setPriorityFilter: (priority) => {
          set((state) => ({ filters: { ...state.filters, priority }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setSchoolIdFilter: (schoolId) => {
          set((state) => ({ filters: { ...state.filters, schoolId }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setAssigneeFilter: (assignee) => {
          set((state) => ({ filters: { ...state.filters, assignee }, page: 0 }));
          void get().actions.fetchTickets();
        },

        setPagination: (page, size) => {
          set({ page, size });
          void get().actions.fetchTickets();
        },

        reply: async (id, body) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await supportTicketService.reply(id, body);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("supportTickets.replySent") });
            void get().actions.fetchStats();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        updateStatus: async (id, status, note) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await supportTicketService.updateStatus(id, status, note);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("supportTickets.statusUpdated") });
            void get().actions.fetchStats();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        assign: async (id, agentUserId, agentName) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await supportTicketService.assign(id, agentUserId, agentName);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("supportTickets.assigned") });
            void get().actions.fetchStats();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        updatePriority: async (id, priority) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await supportTicketService.updatePriority(id, priority);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("supportTickets.priorityUpdated") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        resetStore: () => set({ ...initialState, currentUserId: null }),
      },
    }),
    { name: "support-ticket-store" },
  ),
);

export const useSupportTicketRows = () => useSupportTicketStore((s) => s.rows);
export const useSupportTicketSelected = () => useSupportTicketStore((s) => s.selected);
export const useSupportTicketStats = () => useSupportTicketStore((s) => s.stats);
export const useSupportTicketTotalItems = () => useSupportTicketStore((s) => s.totalItems);
export const useSupportTicketPage = () => useSupportTicketStore((s) => s.page);
export const useSupportTicketSize = () => useSupportTicketStore((s) => s.size);
export const useSupportTicketFilters = () => useSupportTicketStore((s) => s.filters);
export const useSupportTicketLoading = () => useSupportTicketStore((s) => s.loading);
export const useSupportTicketActions = () => useSupportTicketStore((s) => s.actions);

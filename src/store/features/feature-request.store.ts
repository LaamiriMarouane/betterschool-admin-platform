import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import type {
  FeatureRequestCategory,
  FeatureRequestStatus,
} from "@/constants/feature-request.constants";
import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import {
  featureRequestService,
  type FeatureRequestsQuery,
} from "@/services/features/feature-request.service";
import type {
  FeatureRequestCommentDTO,
  FeatureRequestDetailDTO,
  FeatureRequestListDTO,
  FeatureRequestPlatformStatsDTO,
} from "@/types/feature-request.types";

const DEFAULT_PAGE_SIZE = 20;

interface FeatureRequestFilters {
  search: string;
  status: FeatureRequestStatus | null;
  category: FeatureRequestCategory | null;
}

interface LoadingStates {
  list: boolean;
  detail: boolean;
  stats: boolean;
  comments: boolean;
  save: boolean;
}

interface ErrorStates {
  list: StoreError | null;
  detail: StoreError | null;
}

interface FeatureRequestState {
  rows: FeatureRequestListDTO[];
  selected: FeatureRequestDetailDTO | null;
  comments: FeatureRequestCommentDTO[];
  stats: FeatureRequestPlatformStatsDTO | null;
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
  filters: FeatureRequestFilters;
  loading: LoadingStates;
  errors: ErrorStates;
}

interface FeatureRequestActions {
  fetchRequests: () => Promise<void>;
  fetchStats: () => Promise<void>;
  findById: (id: string) => Promise<void>;
  loadComments: (id: string) => Promise<void>;
  clearSelection: () => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: FeatureRequestStatus | null) => void;
  setCategoryFilter: (category: FeatureRequestCategory | null) => void;
  setPagination: (page: number, size: number) => void;
  updateStatus: (id: string, status: FeatureRequestStatus, note?: string) => Promise<boolean>;
  updatePlatformResponse: (id: string, response: string) => Promise<boolean>;
  togglePin: (id: string) => Promise<boolean>;
  addComment: (id: string, body: string) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  resetStore: () => void;
}

type FeatureRequestStore = FeatureRequestState & { actions: FeatureRequestActions };

const initialState: FeatureRequestState = {
  rows: [],
  selected: null,
  comments: [],
  stats: null,
  totalItems: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  filters: { search: "", status: null, category: null },
  loading: { list: false, detail: false, stats: false, comments: false, save: false },
  errors: { list: null, detail: null },
};

function patchListRow(
  rows: FeatureRequestListDTO[],
  detail: FeatureRequestDetailDTO,
): FeatureRequestListDTO[] {
  return rows.map((row) =>
    row.id === detail.id
      ? {
          ...row,
          title: detail.title,
          description: detail.description,
          category: detail.category,
          status: detail.status,
          voteCount: detail.voteCount,
          commentCount: detail.commentCount,
          pinned: detail.pinned,
          platformResponse: detail.platformResponse,
          statusChangedAt: detail.statusChangedAt,
        }
      : row,
  );
}

export const useFeatureRequestStore = create<FeatureRequestStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        fetchRequests: async () => {
          const { page, size, filters } = get();
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const query: FeatureRequestsQuery = {
              page,
              size,
              search: filters.search,
              statuses: filters.status ? [filters.status] : null,
              categories: filters.category ? [filters.category] : null,
            };
            const res = await featureRequestService.list(query);
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
            const stats = await featureRequestService.stats();
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
            const selected = await featureRequestService.findById(id);
            set((state) => ({
              selected,
              loading: { ...state.loading, detail: false },
            }));
            void get().actions.loadComments(id);
          } catch (error) {
            set((state) => ({
              selected: null,
              comments: [],
              loading: { ...state.loading, detail: false },
              errors: { ...state.errors, detail: getErrorMessage(error) },
            }));
          }
        },

        loadComments: async (id) => {
          set((state) => ({ loading: { ...state.loading, comments: true } }));
          try {
            const res = await featureRequestService.listComments(id);
            set((state) => ({
              comments: res.data,
              loading: { ...state.loading, comments: false },
            }));
          } catch {
            set((state) => ({ loading: { ...state.loading, comments: false } }));
          }
        },

        clearSelection: () => set({ selected: null, comments: [] }),

        setSearch: (search) => {
          set((state) => ({ filters: { ...state.filters, search }, page: 0 }));
          void get().actions.fetchRequests();
        },

        setStatusFilter: (status) => {
          set((state) => ({ filters: { ...state.filters, status }, page: 0 }));
          void get().actions.fetchRequests();
        },

        setCategoryFilter: (category) => {
          set((state) => ({ filters: { ...state.filters, category }, page: 0 }));
          void get().actions.fetchRequests();
        },

        setPagination: (page, size) => {
          set({ page, size });
          void get().actions.fetchRequests();
        },

        updateStatus: async (id, status, note) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await featureRequestService.updateStatus(id, status, note);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("featureRequests.statusUpdated") });
            void get().actions.fetchStats();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        updatePlatformResponse: async (id, response) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await featureRequestService.updatePlatformResponse(id, response);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("featureRequests.responseSaved") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        togglePin: async (id) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const detail = await featureRequestService.togglePin(id);
            set((state) => ({
              selected: detail,
              rows: patchListRow(state.rows, detail),
              loading: { ...state.loading, save: false },
            }));
            toast({
              title: detail.pinned
                ? i18n.t("featureRequests.pinned")
                : i18n.t("featureRequests.unpinned"),
            });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        addComment: async (id, body) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const comment = await featureRequestService.addComment(id, body);
            set((state) => ({
              comments: [...state.comments, comment],
              selected: state.selected
                ? { ...state.selected, commentCount: state.selected.commentCount + 1 }
                : state.selected,
              rows: state.rows.map((row) =>
                row.id === id ? { ...row, commentCount: row.commentCount + 1 } : row,
              ),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("featureRequests.commentAdded") });
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        deleteRequest: async (id) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            await featureRequestService.delete(id);
            set((state) => ({
              rows: state.rows.filter((row) => row.id !== id),
              totalItems: Math.max(0, state.totalItems - 1),
              selected: state.selected?.id === id ? null : state.selected,
              comments: state.selected?.id === id ? [] : state.comments,
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("featureRequests.deleted") });
            void get().actions.fetchStats();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        resetStore: () => set(initialState),
      },
    }),
    { name: "feature-request-store" },
  ),
);

export const useFeatureRequestRows = () => useFeatureRequestStore((s) => s.rows);
export const useFeatureRequestSelected = () => useFeatureRequestStore((s) => s.selected);
export const useFeatureRequestComments = () => useFeatureRequestStore((s) => s.comments);
export const useFeatureRequestStats = () => useFeatureRequestStore((s) => s.stats);
export const useFeatureRequestTotalItems = () => useFeatureRequestStore((s) => s.totalItems);
export const useFeatureRequestPage = () => useFeatureRequestStore((s) => s.page);
export const useFeatureRequestSize = () => useFeatureRequestStore((s) => s.size);
export const useFeatureRequestFilters = () => useFeatureRequestStore((s) => s.filters);
export const useFeatureRequestLoading = () => useFeatureRequestStore((s) => s.loading);
export const useFeatureRequestActions = () => useFeatureRequestStore((s) => s.actions);

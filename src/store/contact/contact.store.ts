import { create } from "zustand";
import { devtools } from "zustand/middleware";
import i18n from "i18next";

import type { ContactMessageStatus } from "@/constants/contact.constants";
import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import { contactService, type ContactMessagesQuery } from "@/services/contact/contact.service";
import type { ContactMessageDTO } from "@/types/contact.types";

const DEFAULT_PAGE_SIZE = 20;

interface ContactFilters {
  search: string;
  status: ContactMessageStatus | null;
}

interface LoadingStates {
  list: boolean;
  save: boolean;
}

interface ErrorStates {
  list: StoreError | null;
}

interface ContactState {
  rows: ContactMessageDTO[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
  filters: ContactFilters;
  unreadCount: number;
  loading: LoadingStates;
  errors: ErrorStates;
}

interface ContactActions {
  fetchMessages: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: ContactMessageStatus | null) => void;
  setPagination: (page: number, size: number) => void;
  updateStatus: (id: string, status: ContactMessageStatus) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
  clearErrors: () => void;
  resetStore: () => void;
}

type ContactStore = ContactState & { actions: ContactActions };

const initialState: ContactState = {
  rows: [],
  totalItems: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  filters: { search: "", status: null },
  unreadCount: 0,
  loading: { list: false, save: false },
  errors: { list: null },
};

/**
 * Store-first inbox. Mutations update `rows` in place from the response (no refetch)
 * and refresh the NEW unread count; the list-fetch error lives in `errors`.
 */
export const useContactStore = create<ContactStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        fetchMessages: async () => {
          const { page, size, filters } = get();
          set((state) => ({
            loading: { ...state.loading, list: true },
            errors: { ...state.errors, list: null },
          }));
          try {
            const query: ContactMessagesQuery = {
              page,
              size,
              search: filters.search,
              status: filters.status,
            };
            const res = await contactService.list(query);
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

        fetchUnreadCount: async () => {
          try {
            const unreadCount = await contactService.unreadCount();
            set({ unreadCount });
          } catch {
            // Non-blocking badge data.
          }
        },

        setSearch: (search) => {
          set((state) => ({ filters: { ...state.filters, search }, page: 0 }));
          void get().actions.fetchMessages();
        },

        setStatusFilter: (status) => {
          set((state) => ({ filters: { ...state.filters, status }, page: 0 }));
          void get().actions.fetchMessages();
        },

        setPagination: (page, size) => {
          set({ page, size });
          void get().actions.fetchMessages();
        },

        updateStatus: async (id, status) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            const updated = await contactService.updateStatus(id, status);
            set((state) => ({
              rows: state.rows.map((row) => (row.id === updated.id ? updated : row)),
              loading: { ...state.loading, save: false },
            }));
            void get().actions.fetchUnreadCount();
            return true;
          } catch (error) {
            set((state) => ({ loading: { ...state.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        deleteMessage: async (id) => {
          set((state) => ({ loading: { ...state.loading, save: true } }));
          try {
            await contactService.delete(id);
            set((state) => ({
              rows: state.rows.filter((row) => row.id !== id),
              totalItems: Math.max(0, state.totalItems - 1),
              loading: { ...state.loading, save: false },
            }));
            toast({ title: i18n.t("contact.deleted") });
            void get().actions.fetchUnreadCount();
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
    { name: "contact-store" },
  ),
);

// ─── Selector hooks ───
export const useContactRows = () => useContactStore((state) => state.rows);
export const useContactTotalItems = () => useContactStore((state) => state.totalItems);
export const useContactTotalPages = () => useContactStore((state) => state.totalPages);
export const useContactPage = () => useContactStore((state) => state.page);
export const useContactSize = () => useContactStore((state) => state.size);
export const useContactFilters = () => useContactStore((state) => state.filters);
export const useContactUnreadCount = () => useContactStore((state) => state.unreadCount);
export const useContactLoading = () => useContactStore((state) => state.loading);
export const useContactErrors = () => useContactStore((state) => state.errors);
export const useContactActions = () => useContactStore((state) => state.actions);

export default useContactStore;

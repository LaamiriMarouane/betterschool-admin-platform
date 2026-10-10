import i18n from "i18next";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { toast } from "@/components/ui/use-toast";
import { getErrorMessage, type StoreError } from "@/lib/api-error";
import { notifyApiError } from "@/lib/notify";
import { legalService } from "@/services/legal/legal.service";
import type {
  LegalDocumentOverviewDTO,
  LegalDocumentType,
  LegalPreviewDTO,
  LegalVariableDTO,
  LegalVersionDetailDTO,
  LegalVersionSummaryDTO,
  PublishLegalVersionRequest,
  UpdateLegalDraftRequest,
} from "@/types/legal.types";

interface LegalState {
  overview: LegalDocumentOverviewDTO[];
  historyByType: Partial<Record<LegalDocumentType, LegalVersionSummaryDTO[]>>;
  versions: Record<string, LegalVersionDetailDTO>;
  previews: Record<string, LegalPreviewDTO>;
  variables: LegalVariableDTO[];
  loading: {
    overview: boolean;
    history: boolean;
    version: boolean;
    variables: boolean;
    preview: boolean;
    save: boolean;
    publish: boolean;
  };
  errors: { overview: StoreError | null; history: StoreError | null; version: StoreError | null };
}

interface LegalActions {
  fetchOverview: () => Promise<void>;
  fetchHistory: (type: LegalDocumentType) => Promise<void>;
  fetchVersion: (id: string) => Promise<LegalVersionDetailDTO | null>;
  fetchVariables: () => Promise<void>;
  fetchPreview: (id: string) => Promise<LegalPreviewDTO | null>;
  createDraft: (type: LegalDocumentType, cloneFromId?: string) => Promise<LegalVersionDetailDTO | null>;
  saveDraft: (id: string, request: UpdateLegalDraftRequest) => Promise<LegalVersionDetailDTO | null>;
  deleteDraft: (id: string) => Promise<boolean>;
  publish: (id: string, request: PublishLegalVersionRequest) => Promise<LegalVersionDetailDTO | null>;
  withdraw: (id: string, reason: string) => Promise<LegalVersionDetailDTO | null>;
  resetStore: () => void;
}

type LegalStore = LegalState & { actions: LegalActions };

const initialState: LegalState = {
  overview: [],
  historyByType: {},
  versions: {},
  previews: {},
  variables: [],
  loading: {
    overview: false,
    history: false,
    version: false,
    variables: false,
    preview: false,
    save: false,
    publish: false,
  },
  errors: { overview: null, history: null, version: null },
};

function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

function toSummary(d: LegalVersionDetailDTO): LegalVersionSummaryDTO {
  return {
    id: d.id,
    type: d.type,
    sequence: d.sequence,
    label: d.label,
    status: d.status,
    state: d.state,
    changeKind: d.changeKind,
    effectiveAt: d.effectiveAt,
    publishedAt: d.publishedAt,
    publishedBy: d.publishedBy,
    withdrawnAt: d.withdrawnAt,
    contentHash: d.contentHash,
    updatedAt: d.updatedAt,
  };
}

/**
 * Patch the overview card + history list of the version's type from a mutation response, so
 * nothing is refetched. A version that became CURRENT supersedes the previous current one.
 */
function patchLists(state: LegalState, detail: LegalVersionDetailDTO): Partial<LegalState> {
  const summary = toSummary(detail);
  const becameCurrent = detail.state === "CURRENT";

  const history = state.historyByType[detail.type];
  let nextHistory = history;
  if (history) {
    const exists = history.some((v) => v.id === detail.id);
    nextHistory = (exists ? history.map((v) => (v.id === detail.id ? summary : v)) : [summary, ...history]).map(
      (v) => (becameCurrent && v.id !== detail.id && v.state === "CURRENT" ? { ...v, state: "SUPERSEDED" as const } : v),
    );
  }

  const overview = state.overview.map((card) => {
    if (card.type !== detail.type) return card;
    const next = { ...card };
    const wasDraft = card.draft?.id === detail.id;
    switch (detail.state) {
      case "DRAFT":
        next.draft = summary;
        break;
      case "UPCOMING":
        next.upcoming = summary;
        break;
      case "CURRENT":
        next.current = summary;
        next.driftedKeys = detail.driftedKeys;
        next.driftMaterial = detail.driftMaterial;
        break;
      case "WITHDRAWN":
        if (card.upcoming?.id === detail.id) next.upcoming = null;
        break;
      default:
        break;
    }
    if (wasDraft && detail.state !== "DRAFT") {
      next.draft = null;
      next.publishedCount = card.publishedCount + 1;
    }
    return next;
  });

  return {
    overview,
    historyByType: nextHistory ? { ...state.historyByType, [detail.type]: nextHistory } : state.historyByType,
    versions: { ...state.versions, [detail.id]: detail },
  };
}

export const useLegalStore = create<LegalStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      actions: {
        fetchOverview: async () => {
          set((s) => ({ loading: { ...s.loading, overview: true }, errors: { ...s.errors, overview: null } }));
          try {
            const overview = await legalService.overview();
            set((s) => ({ overview, loading: { ...s.loading, overview: false } }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, overview: false },
              errors: { ...s.errors, overview: getErrorMessage(error) },
            }));
          }
        },

        fetchHistory: async (type) => {
          set((s) => ({ loading: { ...s.loading, history: true }, errors: { ...s.errors, history: null } }));
          try {
            const history = await legalService.history(type);
            set((s) => ({
              historyByType: { ...s.historyByType, [type]: history },
              loading: { ...s.loading, history: false },
            }));
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, history: false },
              errors: { ...s.errors, history: getErrorMessage(error) },
            }));
          }
        },

        fetchVersion: async (id) => {
          set((s) => ({ loading: { ...s.loading, version: true }, errors: { ...s.errors, version: null } }));
          try {
            const detail = await legalService.getVersion(id);
            set((s) => ({ versions: { ...s.versions, [id]: detail }, loading: { ...s.loading, version: false } }));
            return detail;
          } catch (error) {
            set((s) => ({
              loading: { ...s.loading, version: false },
              errors: { ...s.errors, version: getErrorMessage(error) },
            }));
            return null;
          }
        },

        fetchVariables: async () => {
          if (get().variables.length > 0) return;
          set((s) => ({ loading: { ...s.loading, variables: true } }));
          try {
            const variables = await legalService.variables();
            set((s) => ({ variables, loading: { ...s.loading, variables: false } }));
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, variables: false } }));
            notifyApiError(error);
          }
        },

        fetchPreview: async (id) => {
          set((s) => ({ loading: { ...s.loading, preview: true } }));
          try {
            const preview = await legalService.preview(id);
            set((s) => ({ previews: { ...s.previews, [id]: preview }, loading: { ...s.loading, preview: false } }));
            return preview;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, preview: false } }));
            notifyApiError(error);
            return null;
          }
        },

        createDraft: async (type, cloneFromId) => {
          set((s) => ({ loading: { ...s.loading, save: true } }));
          try {
            const detail = await legalService.createDraft(type, cloneFromId);
            set((s) => ({ ...patchLists(s, detail), loading: { ...s.loading, save: false } }));
            toast({ title: i18n.t("legal.toast.draftCreated") });
            return detail;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, save: false } }));
            notifyApiError(error);
            return null;
          }
        },

        saveDraft: async (id, request) => {
          set((s) => ({ loading: { ...s.loading, save: true } }));
          try {
            const detail = await legalService.updateDraft(id, request);
            set((s) => {
              // The saved template changed: a cached preview no longer matches it.
              return { ...patchLists(s, detail), previews: omitKey(s.previews, id), loading: { ...s.loading, save: false } };
            });
            toast({ title: i18n.t("legal.toast.draftSaved") });
            return detail;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, save: false } }));
            notifyApiError(error);
            return null;
          }
        },

        deleteDraft: async (id) => {
          const draft = get().versions[id];
          set((s) => ({ loading: { ...s.loading, save: true } }));
          try {
            await legalService.deleteDraft(id);
            set((s) => {
              const type = draft?.type;
              return {
                versions: omitKey(s.versions, id),
                overview: s.overview.map((card) => (card.draft?.id === id ? { ...card, draft: null } : card)),
                historyByType:
                  type && s.historyByType[type]
                    ? { ...s.historyByType, [type]: s.historyByType[type]!.filter((v) => v.id !== id) }
                    : s.historyByType,
                loading: { ...s.loading, save: false },
              };
            });
            toast({ title: i18n.t("legal.toast.draftDeleted") });
            return true;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, save: false } }));
            notifyApiError(error);
            return false;
          }
        },

        publish: async (id, request) => {
          set((s) => ({ loading: { ...s.loading, publish: true } }));
          try {
            const detail = await legalService.publish(id, request);
            set((s) => ({ ...patchLists(s, detail), loading: { ...s.loading, publish: false } }));
            toast({ title: i18n.t("legal.toast.published", { label: detail.label }) });
            return detail;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, publish: false } }));
            notifyApiError(error);
            return null;
          }
        },

        withdraw: async (id, reason) => {
          set((s) => ({ loading: { ...s.loading, publish: true } }));
          try {
            const detail = await legalService.withdraw(id, reason);
            set((s) => ({ ...patchLists(s, detail), loading: { ...s.loading, publish: false } }));
            toast({ title: i18n.t("legal.toast.withdrawn", { label: detail.label }) });
            return detail;
          } catch (error) {
            set((s) => ({ loading: { ...s.loading, publish: false } }));
            notifyApiError(error);
            return null;
          }
        },

        resetStore: () => set(initialState),
      },
    }),
    { name: "legal-store" },
  ),
);

// ─── Selector hooks ───
export const useLegalOverview = () => useLegalStore((s) => s.overview);
export const useLegalHistory = (type: LegalDocumentType) => useLegalStore((s) => s.historyByType[type]);
export const useLegalVersion = (id: string | undefined) => useLegalStore((s) => (id ? s.versions[id] : undefined));
export const useLegalPreview = (id: string | undefined) => useLegalStore((s) => (id ? s.previews[id] : undefined));
export const useLegalVariables = () => useLegalStore((s) => s.variables);
export const useLegalLoading = () => useLegalStore((s) => s.loading);
export const useLegalErrors = () => useLegalStore((s) => s.errors);
export const useLegalActions = () => useLegalStore((s) => s.actions);

export default useLegalStore;

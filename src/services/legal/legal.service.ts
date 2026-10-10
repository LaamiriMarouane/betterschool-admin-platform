import { http } from "@/lib/http";
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

const BASE = "/platform/legal";

/** Platform legal documents API (Terms / Privacy / Refund authoring). */
export const legalService = {
  overview: (): Promise<LegalDocumentOverviewDTO[]> => http.get(`${BASE}/documents`),

  history: (type: LegalDocumentType): Promise<LegalVersionSummaryDTO[]> =>
    http.get(`${BASE}/documents/${type}/versions`),

  variables: (): Promise<LegalVariableDTO[]> => http.get(`${BASE}/variables`),

  getVersion: (id: string): Promise<LegalVersionDetailDTO> => http.get(`${BASE}/versions/${id}`),

  preview: (id: string): Promise<LegalPreviewDTO> => http.get(`${BASE}/versions/${id}/preview`),

  createDraft: (type: LegalDocumentType, cloneFromId?: string): Promise<LegalVersionDetailDTO> =>
    http.post(`${BASE}/documents/${type}/drafts`, { cloneFromId: cloneFromId ?? null }),

  updateDraft: (id: string, request: UpdateLegalDraftRequest): Promise<LegalVersionDetailDTO> =>
    http.patch(`${BASE}/versions/${id}`, request),

  deleteDraft: (id: string): Promise<void> => http.delete(`${BASE}/versions/${id}`),

  publish: (id: string, request: PublishLegalVersionRequest): Promise<LegalVersionDetailDTO> =>
    http.post(`${BASE}/versions/${id}/publish`, request),

  withdraw: (id: string, reason: string): Promise<LegalVersionDetailDTO> =>
    http.post(`${BASE}/versions/${id}/withdraw`, { reason }),
};

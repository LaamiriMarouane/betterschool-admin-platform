/** Mirrors backend dto/legal/* (platform legal documents). */

export const LEGAL_DOCUMENT_TYPES = ["TERMS", "PRIVACY", "REFUND"] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];

export type LegalVersionStatus = "DRAFT" | "PUBLISHED" | "WITHDRAWN";
export type LegalVersionState = "DRAFT" | "UPCOMING" | "CURRENT" | "SUPERSEDED" | "WITHDRAWN";
export type LegalChangeKind = "EDITORIAL" | "MATERIAL";
export type LegalVariableKind = "TEXT" | "URL" | "EMAIL";

/** locale → value */
export type LocaleMap = Record<string, string>;

export interface LegalVersionSummaryDTO {
  id: string;
  type: LegalDocumentType;
  sequence: number | null;
  label: string | null;
  status: LegalVersionStatus;
  state: LegalVersionState;
  changeKind: LegalChangeKind | null;
  effectiveAt: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  withdrawnAt: string | null;
  contentHash: string | null;
  updatedAt: string;
}

export interface LegalVersionDetailDTO extends LegalVersionSummaryDTO {
  contentTemplate: LocaleMap;
  content: LocaleMap | null;
  changeSummary: LocaleMap;
  variablesSnapshot: Record<string, LocaleMap> | null;
  authoritativeLocale: string;
  urgentReason: string | null;
  withdrawReason: string | null;
  clonedFromId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  rowVersion: number;
  nextLabel: string | null;
  materialNoticeDays: number;
  firstPublication: boolean;
  driftedKeys: string[];
  driftMaterial: boolean;
}

export interface LegalDocumentOverviewDTO {
  type: LegalDocumentType;
  requiresAcceptance: boolean;
  current: LegalVersionSummaryDTO | null;
  upcoming: LegalVersionSummaryDTO | null;
  draft: LegalVersionSummaryDTO | null;
  publishedCount: number;
  driftedKeys: string[];
  driftMaterial: boolean;
}

export interface LegalVariableDTO {
  key: string;
  kind: LegalVariableKind;
  material: boolean;
  values: LocaleMap;
}

export interface LegalPreviewDTO {
  html: LocaleMap;
  missingKeys: Record<string, string[]>;
}

export interface UpdateLegalDraftRequest {
  rowVersion: number;
  contentTemplate?: LocaleMap;
  changeSummary?: LocaleMap;
  changeKind?: LegalChangeKind;
  effectiveAt?: string;
  clearEffectiveAt?: boolean;
  authoritativeLocale?: string;
}

export interface PublishLegalVersionRequest {
  rowVersion: number;
  confirmLabel: string;
  urgentReason?: string;
}

/** Locales every version must cover, in editor tab order. */
export const LEGAL_LOCALES = ["en", "fr", "ar"] as const;

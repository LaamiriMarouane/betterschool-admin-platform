import i18n from "i18next";

import { ApiError } from "@/lib/http";

/** Standard shape stored in a store's `errors` slice. Mirrors the product app. */
export interface StoreError {
  key?: string | null;
  message: string;
  fields?: Record<string, string> | null;
}

/**
 * Resolve an unknown caught error into a `StoreError`. The backend message is
 * already localized (Accept-Language); we use it directly and only fall back to
 * a translated generic message when the body has none — never the raw status
 * text (which isn't translated).
 */
export function getErrorMessage(error: unknown): StoreError {
  if (error instanceof ApiError) {
    const fields = error.body?.errors as Record<string, string> | undefined;
    return {
      key: error.code ?? null,
      message: error.body?.message || i18n.t("common.unexpectedError"),
      fields: fields ?? null,
    };
  }
  if (error instanceof Error) {
    return { key: null, message: error.message };
  }
  return { key: null, message: i18n.t("common.unexpectedError") };
}

/** Field-level validation errors (400), or null. */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (error instanceof ApiError) {
    return (error.body?.errors as Record<string, string> | undefined) ?? null;
  }
  return null;
}

/** Backend error-code key for client-side branching (e.g. INSUFFICIENT_PERMISSION). */
export function getErrorKey(error: unknown): string | null {
  return error instanceof ApiError ? error.code ?? null : null;
}

/** HTTP status, or null for non-API errors. */
export function getErrorStatus(error: unknown): number | null {
  return error instanceof ApiError ? error.status : null;
}

/**
 * Mirrors backend common/PaginatedResponse<T>. Note the field names: the backend
 * returns `data` (not `content`) and 0-based `currentPage`.
 */
export interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

/**
 * A trilingual JSON value (jsonb on the backend), keyed by language code
 * ("en" | "fr" | "ar"). Used by plan name/description. Resolve with the active
 * language, falling back to "en".
 */
export type LocalizedText = Record<string, string>;

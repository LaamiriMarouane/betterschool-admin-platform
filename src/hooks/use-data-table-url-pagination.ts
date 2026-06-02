import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router";

export const DATA_TABLE_ALLOWED_PAGE_SIZES = [10, 20, 50, 100, 200] as const;
export const DATA_TABLE_DEFAULT_PAGE_SIZE: (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number] =
  10;

export type DataTableUrlPaginationConfig = {
  /** When `false`, URL is not read or written. Default `true`. */
  enabled?: boolean;
  /** Query key for 1-based page number. Ignored if `paramPrefix` is set. Default `page`. */
  pageKey?: string;
  /** Query key for page size. Ignored if `paramPrefix` is set. Default `size`. */
  sizeKey?: string;
  /** If set, keys are `${paramPrefix}_page` and `${paramPrefix}_size`. */
  paramPrefix?: string;
  /** Used when `size` is missing or invalid. Must be one of the allowed sizes. Default `10`. */
  defaultPageSize?: (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number];
};

function resolveKeys(config: DataTableUrlPaginationConfig | undefined) {
  const prefix = config?.paramPrefix?.trim();
  if (prefix) {
    return { pageKey: `${prefix}_page`, sizeKey: `${prefix}_size` };
  }
  return {
    pageKey: config?.pageKey?.trim() || "page",
    sizeKey: config?.sizeKey?.trim() || "size",
  };
}

function resolveDefaultPageSize(
  config: DataTableUrlPaginationConfig | undefined,
): (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number] {
  const d = config?.defaultPageSize;
  if (
    d !== undefined &&
    DATA_TABLE_ALLOWED_PAGE_SIZES.includes(
      d as (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number],
    )
  ) {
    return d as (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number];
  }
  return DATA_TABLE_DEFAULT_PAGE_SIZE;
}

/** Parse URL page (1-based). Invalid / missing → 1. */
export function parseDataTableUrlPage(raw: string | null): number {
  if (raw === null || raw.trim() === "") return 1;
  const n = Number.parseFloat(raw.trim());
  if (!Number.isFinite(n) || n < 1) return 1;
  const int = Math.trunc(n);
  if (int !== n) return 1;
  return int;
}

/** Parse size; invalid / missing → `defaultSize`. */
export function parseDataTableUrlSize(
  raw: string | null,
  defaultSize: (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number],
): (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number] {
  if (raw === null || raw.trim() === "") return defaultSize;
  const n = Number.parseInt(raw.trim(), 10);
  if (
    !Number.isFinite(n) ||
    !DATA_TABLE_ALLOWED_PAGE_SIZES.includes(
      n as (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number],
    )
  ) {
    return defaultSize;
  }
  return n as (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number];
}

export function clampDataTablePageIndex(
  pageIndex: number,
  rowCount: number | undefined,
  pageSize: number,
): number {
  const safe = Number.isFinite(pageIndex) && pageIndex >= 0 ? Math.floor(pageIndex) : 0;
  if (rowCount === undefined || rowCount < 0) return safe;
  // Stores often initialize `totalItems` to 0 before the first API response. Treating
  // that as an empty list clamps any URL page to 0 and fights user navigation,
  // causing repeated fetches. Only upper-clamp when we know there is at least one row.
  if (rowCount === 0) return safe;
  const maxIndex = Math.max(0, Math.ceil(rowCount / pageSize) - 1);
  return Math.min(safe, maxIndex);
}

type UseArgs = {
  config: DataTableUrlPaginationConfig | undefined;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState> | undefined;
  rowCount: number | undefined;
};

/**
 * Keeps TanStack pagination in sync with URL query params (merge-safe).
 * Only reads the URL into table state when `page` / `size` keys are present,
 * so existing routes without these params keep store-driven state.
 */
export function useDataTableUrlPagination({
  config,
  pagination,
  onPaginationChange,
  rowCount,
}: UseArgs) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const enabled = config?.enabled !== false;
  const { pageKey, sizeKey } = resolveKeys(config);
  const defaultPageSize = resolveDefaultPageSize(config);

  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const onPaginationChangeRef = useRef(onPaginationChange);
  onPaginationChangeRef.current = onPaginationChange;

  const keysRef = useRef({ pageKey, sizeKey });
  keysRef.current = { pageKey, sizeKey };

  /** Tracks `location.key` across renders so we can tell a new history entry from `replace` updates. */
  const prevLocationKeyRef = useRef<string | undefined>(undefined);

  /**
   * Full `location.search` string we last produced via `setSearchParams`. When hydrate sees
   * the same string, skip — otherwise our own URL writes retrigger hydrate → `apply` →
   * store churn and rapid clicks oscillate between pages.
   */
  const lastPushedSearchStringRef = useRef<string | null>(null);
  const prevLocationKeyForClearRef = useRef<string | undefined>(undefined);

  const searchString = searchParams.toString();

  // Clear "we wrote this URL" only when `location.key` actually changes (not on mount), so
  // we do not wipe `lastPushed` in the same tick as the write effect.
  useEffect(() => {
    if (
      prevLocationKeyForClearRef.current !== undefined &&
      prevLocationKeyForClearRef.current !== location.key
    ) {
      lastPushedSearchStringRef.current = null;
    }
    prevLocationKeyForClearRef.current = location.key;
  }, [location.key]);

  // Apply URL → store synchronously before paint so the write effect sees matching state.
  useLayoutEffect(() => {
    const apply = onPaginationChangeRef.current;
    const locationKeyChanged =
      prevLocationKeyRef.current === undefined ||
      prevLocationKeyRef.current !== location.key;
    prevLocationKeyRef.current = location.key;

    if (!enabled || !apply) return;

    const fullSearch = searchParams.toString();
    if (
      lastPushedSearchStringRef.current !== null &&
      fullSearch === lastPushedSearchStringRef.current
    ) {
      return;
    }

    const { pageKey: pk, sizeKey: sk } = keysRef.current;
    const hasPageParam = searchParams.has(pk);
    const hasSizeParam = searchParams.has(sk);
    if (!hasPageParam && !hasSizeParam) return;

    const urlPage = parseDataTableUrlPage(searchParams.get(pk));
    // If `size` is omitted from the URL (omitted because it matched default), keep the
    // controlled page size — do not default to 10 and trigger a spurious store update.
    const urlSize = hasSizeParam
      ? parseDataTableUrlSize(searchParams.get(sk), defaultPageSize)
      : (DATA_TABLE_ALLOWED_PAGE_SIZES.includes(
            paginationRef.current.pageSize as (typeof DATA_TABLE_ALLOWED_PAGE_SIZES)[number],
          )
          ? paginationRef.current.pageSize
          : defaultPageSize);
    let pageIndex = urlPage - 1;
    pageIndex = clampDataTablePageIndex(pageIndex, rowCount, urlSize);

    const current = paginationRef.current;

    // Store is ahead of the URL (user went to a higher page; write has not run yet).
    if (current.pageIndex > pageIndex) {
      return;
    }

    // URL shows a higher page than the store. Only apply when this is a real navigation.
    if (current.pageIndex < pageIndex && !locationKeyChanged) {
      return;
    }

    if (pageIndex !== current.pageIndex || urlSize !== current.pageSize) {
      apply({ pageIndex, pageSize: urlSize });
    }
  }, [enabled, searchString, searchParams, rowCount, defaultPageSize, location.key]);

  // Write store → URL (merge).
  const writeRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const { pageKey: pk, sizeKey: sk } = keysRef.current;

    if (writeRafRef.current !== null) {
      cancelAnimationFrame(writeRafRef.current);
    }

    writeRafRef.current = requestAnimationFrame(() => {
      writeRafRef.current = null;

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const { pageIndex, pageSize } = paginationRef.current;

          const maxPageOneBased =
            rowCount !== undefined && rowCount >= 0
              ? Math.max(1, Math.ceil(rowCount / pageSize))
              : undefined;
          const singlePageOnly =
            maxPageOneBased !== undefined && maxPageOneBased <= 1;

          if (singlePageOnly && pageIndex === 0 && pageSize === defaultPageSize) {
            next.delete(pk);
            next.delete(sk);
          } else {
            const isFullyDefault = pageIndex === 0 && pageSize === defaultPageSize;
            if (isFullyDefault) {
              next.delete(pk);
              next.delete(sk);
            } else {
              if (pageIndex === 0) next.delete(pk);
              else next.set(pk, String(pageIndex + 1));

              if (pageSize === defaultPageSize) next.delete(sk);
              else next.set(sk, String(pageSize));
            }
          }

          if (next.toString() === prev.toString()) {
            return prev;
          }
          lastPushedSearchStringRef.current = next.toString();
          return next;
        },
        { replace: true },
      );
    });

    return () => {
      if (writeRafRef.current !== null) {
        cancelAnimationFrame(writeRafRef.current);
        writeRafRef.current = null;
      }
    };
  }, [enabled, pagination.pageIndex, pagination.pageSize, rowCount, defaultPageSize, setSearchParams]);
}

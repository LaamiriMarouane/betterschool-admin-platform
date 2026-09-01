import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATA_TABLE_ALLOWED_PAGE_SIZES } from "@/hooks/use-data-table-url-pagination";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export type TablePaginationProps = {
  /** Zero-based page index. */
  page: number;
  pageSize: number;
  totalItems: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizes?: readonly number[];
  /** Embedded panels: hide first/last and go-to-page. */
  compact?: boolean;
  className?: string;
};

export function TablePagination({
  page,
  pageSize,
  totalItems,
  loading = false,
  onPageChange,
  onPageSizeChange,
  pageSizes = DATA_TABLE_ALLOWED_PAGE_SIZES,
  compact = false,
  className,
}: TablePaginationProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrevious = page > 0;
  const canNext = page < totalPages - 1;

  if (totalItems === 0) return null;

  const showControls = totalPages > 1 || onPageSizeChange != null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t pt-3",
        compact ? "justify-between" : "justify-end",
        className,
      )}
      aria-busy={loading}
    >
      <div className="text-xs text-muted-foreground">
        {t("dataTable.rowCount", { value: totalItems })}
      </div>

      {showControls ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            {!compact && !isMobile ? (
              <PaginationButton
                label={t("dataTable.firstPage")}
                disabled={loading || !canPrevious}
                onClick={() => onPageChange(0)}
              >
                {"<<"}
              </PaginationButton>
            ) : null}

            <PaginationButton
              label={t("dataTable.previousPage")}
              disabled={loading || !canPrevious}
              compact={compact || isMobile}
              onClick={() => onPageChange(page - 1)}
            >
              {"<"}
            </PaginationButton>

            <span className="px-1 text-xs font-medium tabular-nums">
              {page + 1} {t("schoolDetail.audit.pageOfShort", { total: totalPages })}
            </span>

            <PaginationButton
              label={t("dataTable.nextPage")}
              disabled={loading || !canNext}
              compact={compact || isMobile}
              onClick={() => onPageChange(page + 1)}
            >
              {">"}
            </PaginationButton>

            {!compact && !isMobile ? (
              <PaginationButton
                label={t("dataTable.lastPage")}
                disabled={loading || !canNext}
                onClick={() => onPageChange(totalPages - 1)}
              >
                {">>"}
              </PaginationButton>
            ) : null}
          </div>

          {!compact && !isMobile ? (
            <span className="flex items-center gap-1 text-xs">
              <span>{t("dataTable.goToPage")}</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={page + 1}
                disabled={loading}
                className="h-7 w-12 rounded border px-1.5 py-0.5 text-xs"
                onChange={(e) => {
                  const next = e.target.value ? Number(e.target.value) - 1 : 0;
                  if (Number.isFinite(next) && next >= 0 && next < totalPages) {
                    onPageChange(next);
                  }
                }}
              />
            </span>
          ) : null}

          {onPageSizeChange && !isMobile ? (
            <div className="w-28">
              <Select
                value={pageSize.toString()}
                disabled={loading}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder={t("dataTable.pageSize")} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizes.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {t("dataTable.show", { value: size })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PaginationButton({
  children,
  label,
  disabled,
  compact,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded border shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:text-gray-500",
        compact
          ? "flex min-w-[32px] items-center justify-center p-[2px]"
          : "px-1.5 py-0.5 text-xs font-bold",
      )}
    >
      {children}
    </button>
  );
}

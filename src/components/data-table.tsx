import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationOptions,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  Cell,
  Header,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import SearchInput from "./search-input";
import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useDataTableUrlPagination,
  type DataTableUrlPaginationConfig,
} from "@/hooks/use-data-table-url-pagination";
import { useTranslation } from "react-i18next";

export type { DataTableUrlPaginationConfig };

const SKELETON_ROW_COUNT = 10;

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  /** Toolbar actions (filters, "New", etc.) — this is the only filter surface now. */
  actions?: React.ReactNode[];
  additionalActions?: React.ReactNode[];
  onSearchChange?: (value: string) => void;
  searchText?: string;
  searchValue?: string;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  bulkActions?: (selectedRows: T[]) => React.ReactNode;
  isLoading?: boolean;
  topBarClassName?: string;
  tableClassName?: string;
  /** When data is empty, show this instead of a table row. */
  emptyState?: {
    icon?: React.ReactNode;
    message?: string;
    action?: React.ReactNode;
  };
  /** Stable row id for selection/pagination (e.g. schoolId). */
  getRowId?: (row: T) => string;
  /** Column visibility on first render (`false` = hidden). */
  initialColumnVisibility?: VisibilityState;
  /** Sync pagination (page/size) to URL query params (`?page=&size=`). On by default. */
  urlPagination?: DataTableUrlPaginationConfig;
  /** Optional full-row click handler (e.g. open a detail view). */
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  data,
  columns,
  actions,
  additionalActions,
  pagination,
  paginationOptions,
  isLoading = false,
  onSearchChange,
  onRowSelectionChange,
  rowSelection,
  bulkActions,
  searchText,
  searchValue,
  topBarClassName,
  tableClassName,
  emptyState,
  getRowId,
  initialColumnVisibility,
  urlPagination,
  onRowClick,
}: DataTableProps<T>) {
  // TanStack Table returns fresh function refs each render, so React Compiler
  // can't optimize this component — opt it out (it renders correctly regardless).
  "use no memo";

  // Keep page/size in the URL (deep-linkable, survives refresh) — same as the product app.
  useDataTableUrlPagination({
    config: urlPagination ?? {},
    pagination,
    onPaginationChange: paginationOptions.onPaginationChange,
    rowCount: paginationOptions.rowCount,
  });

  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const outerContainerRef = React.useRef<HTMLDivElement>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      const visibility: VisibilityState = { ...initialColumnVisibility };
      if (isMobile) {
        columns.forEach((column) => {
          const id =
            column.id || (column as unknown as { accessorKey?: string }).accessorKey;
          if (
            id &&
            (column.meta as { hideOnMobile?: boolean } | undefined)?.hideOnMobile &&
            visibility[id] === undefined
          ) {
            visibility[id] = false;
          }
        });
      }
      return visibility;
    });

  // Sync column visibility when screen size changes (Desktop <-> Mobile)
  React.useEffect(() => {
    setColumnVisibility((prev) => {
      const next = { ...prev };
      let changed = false;
      columns.forEach((column) => {
        const id = column.id || (column as { accessorKey?: string }).accessorKey;
        if (id && (column.meta as { hideOnMobile?: boolean } | undefined)?.hideOnMobile) {
          const shouldBeVisible = !isMobile;
          if (next[id] !== shouldBeVisible) {
            next[id] = shouldBeVisible;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [isMobile, columns]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelection || {},
    },
    ...paginationOptions,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    ...(getRowId ? { getRowId: (row: T) => getRowId(row) } : {}),
  });

  const totalTableWidth = React.useMemo(() => {
    return table.getTotalSize();
  }, [table.getState().columnSizing]);

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const hasSelection = selectedRows.length > 0;
  const filteredTotalRowCount =
    paginationOptions.rowCount !== undefined
      ? paginationOptions.rowCount
      : table.getFilteredRowModel().rows.length;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const tableFooterRowSummary =
    selectedRowCount === 0
      ? t("dataTable.rowCount", { value: filteredTotalRowCount })
      : t("dataTable.selected", { value: selectedRowCount });

  return (
    <div className="flex w-full min-w-0 max-w-full min-h-[600px] flex-col rounded-md pb-4">
      {hasSelection && (
        <div className="my-2 p-2 bg-muted/50 border border-border rounded-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <span className="text-sm font-medium">
              {t("dataTable.selected", { value: selectedRows.length })}
            </span>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              {bulkActions && (
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                  {bulkActions(selectedRows)}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.toggleAllRowsSelected(false)}
                className="hover:bg-muted w-full sm:w-auto"
                icon={<X />}
              >
                {t("dataTable.clearSelection")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex w-full min-w-0 max-w-full flex-col items-center justify-between gap-2 py-2 md:flex-row",
          topBarClassName,
        )}
      >
        {onSearchChange && (
          <SearchInput
            placeholder={searchText || t("common.searchPlaceholder")}
            wrapperClassName="md:max-w-sm w-full"
            value={searchValue}
            onChange={(value) => onSearchChange(value)}
          />
        )}
        <div
          className={cn(
            "flex w-full gap-2 flex-col md:flex-row md:gap-1 md:w-fit",
            !onSearchChange && "md:ml-auto",
          )}
        >
          <div className="flex gap-2">
            {actions?.map((action, index) => (
              <div key={index} className="flex items-center w-full">
                {action}
              </div>
            ))}
          </div>
          {additionalActions && additionalActions.length > 0 && (
            <div className="flex items-center gap-2">
              {additionalActions.map((action, index) => (
                <div key={index} className="flex items-center">
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="min-w-0 max-w-full shadow-md">
        <div
          className={cn(
            "scrollbar-reveal-on-hover flex min-w-0 max-w-full flex-grow flex-col overflow-hidden rounded-md border",
            tableClassName,
          )}
        >
          <div
            className="min-w-0 max-w-full flex-grow overflow-x-auto overflow-y-hidden overscroll-x-contain custom-scrollbar scrollbar-thumb-on-hover tiny-scroll"
            ref={outerContainerRef}
          >
            <div
              style={{
                width: totalTableWidth > 0 ? `${totalTableWidth}px` : "100%",
                minWidth: "100%",
              }}
            >
              {/* Header Table */}
              <div className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <Table
                  style={{
                    width: totalTableWidth > 0 ? `${totalTableWidth}px` : "100%",
                    minWidth: "100%",
                    tableLayout: "fixed",
                  }}
                  className="border-none"
                  containerClassName="overflow-visible"
                >
                  <TableHeader className="bg-transparent">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="flex border-none">
                        {headerGroup.headers.map((header) => (
                          <DefaultHeader key={header.id} header={header} />
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                </Table>
              </div>

              {/* Body Table */}
              <div
                className="overflow-y-auto overflow-x-hidden custom-scrollbar scrollbar-thumb-on-hover min-h-[380px]"
                style={{ maxHeight: "calc(100vh - 260px)" }}
                ref={tableContainerRef}
                onWheel={(e) => {
                  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    e.stopPropagation();
                    if (outerContainerRef.current) {
                      outerContainerRef.current.scrollLeft += e.deltaX;
                    }
                  }
                }}
              >
                {isLoading ? (
                  <Table
                    style={{
                      width: totalTableWidth > 0 ? `${totalTableWidth}px` : "100%",
                      minWidth: "100%",
                      tableLayout: "fixed",
                    }}
                    containerClassName="overflow-visible"
                  >
                    <TableBody>
                      {Array.from({ length: SKELETON_ROW_COUNT }).map(
                        (_, rowIndex) => (
                          <TableRow
                            key={`skeleton-${rowIndex}`}
                            className="flex w-full border-b border-border/50 hover:bg-transparent"
                          >
                            {table.getVisibleLeafColumns().map((column) => {
                              const size = column.getSize();
                              const isResizable = column.getCanResize();
                              const widthPct =
                                55 + ((rowIndex + column.id.length) % 5) * 8;
                              return (
                                <TableCell
                                  key={column.id}
                                  className="px-2.5 py-2 flex items-center overflow-hidden h-12"
                                  style={{
                                    width: size,
                                    flex: isResizable ? `${size} 1 auto` : `0 0 ${size}px`,
                                  }}
                                >
                                  <div className="min-w-0 w-full">
                                    <Skeleton
                                      className="h-4 rounded-md"
                                      style={{ width: `${widthPct}%` }}
                                    />
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                ) : !virtualRows.length ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[320px] text-center text-muted-foreground">
                    {emptyState?.icon && (
                      <div className="mb-3 text-muted-foreground [&>svg]:w-10 [&>svg]:h-10">
                        {emptyState.icon}
                      </div>
                    )}
                    <p className="text-sm font-medium">
                      {emptyState?.message ?? t("common.noResults")}
                    </p>
                    {emptyState?.action && (
                      <div className="mt-4">{emptyState.action}</div>
                    )}
                  </div>
                ) : (
                  <Table
                    style={{
                      width: totalTableWidth > 0 ? `${totalTableWidth}px` : "100%",
                      minWidth: "100%",
                      tableLayout: "fixed",
                    }}
                    containerClassName="overflow-visible"
                  >
                    <TableBody
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return (
                          <TableRow
                            key={virtualRow.key}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                            className={cn(
                              "flex absolute top-0 left-0 w-full transition-colors hover:bg-muted/50",
                              onRowClick && "cursor-pointer",
                            )}
                            style={{
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <DefaultCell key={cell.id} cell={cell} />
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "py-2 border-t border-slate-200 dark:border-slate-800 rounded-b-md bg-background",
              isMobile
                ? "flex items-center justify-between gap-2 px-3"
                : "flex items-center justify-end space-x-2",
            )}
          >
            <div
              className={cn(
                "text-xs text-muted-foreground",
                isMobile ? "whitespace-nowrap min-w-0" : "flex-1",
              )}
            >
              {tableFooterRowSummary}
            </div>

            <div className="flex items-center gap-2 px-2" aria-busy={isLoading}>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button
                    className="border rounded px-1.5 py-0.5 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors hover:bg-muted text-xs shadow-sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={isLoading || !table.getCanPreviousPage()}
                    aria-label={t("dataTable.firstPage")}
                  >
                    {"<<"}
                  </button>
                )}
                <button
                  className={cn(
                    "border rounded disabled:text-gray-500 disabled:cursor-not-allowed transition-colors hover:bg-muted shadow-sm",
                    isMobile
                      ? "p-[2px] min-w-[32px] flex items-center justify-center"
                      : "px-1.5 py-0.5 text-xs font-bold",
                  )}
                  onClick={() => table.previousPage()}
                  disabled={isLoading || !table.getCanPreviousPage()}
                  aria-label={t("dataTable.previousPage")}
                >
                  {"<"}
                </button>

                <span className="flex items-center gap-1 text-xs font-medium px-1">
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>

                <button
                  className={cn(
                    "border rounded disabled:text-gray-500 disabled:cursor-not-allowed transition-colors hover:bg-muted shadow-sm",
                    isMobile
                      ? "p-[2px] min-w-[32px] flex items-center justify-center"
                      : "px-1.5 py-0.5 text-xs font-bold",
                  )}
                  onClick={() => table.nextPage()}
                  disabled={isLoading || !table.getCanNextPage()}
                  aria-label={t("dataTable.nextPage")}
                >
                  {">"}
                </button>
                {!isMobile && (
                  <button
                    className="border rounded px-1.5 py-0.5 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors hover:bg-muted text-xs shadow-sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={isLoading || !table.getCanNextPage()}
                    aria-label={t("dataTable.lastPage")}
                  >
                    {">>"}
                  </button>
                )}
              </div>

              {!isMobile && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="flex items-center gap-1">{t("dataTable.goToPage")}</span>
                  <Input
                    type="number"
                    value={table.getState().pagination.pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      table.setPageIndex(page);
                    }}
                    disabled={isLoading}
                    className="border px-1.5 py-0.5 rounded w-12 h-7 text-xs"
                  />
                </span>
              )}

              {!isMobile && (
                <div className="w-28">
                  <Select
                    value={table.getState().pagination.pageSize.toString()}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder={t("dataTable.pageSize")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100, 200].map((pageSize) => (
                        <SelectItem key={pageSize} value={pageSize.toString()}>
                          <span className="flex items-center gap-1 text-xs">
                            {t("dataTable.show", { value: pageSize })}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const size = cell.column.getSize();
  const isResizable = cell.column.getCanResize();
  const align =
    (cell.column.columnDef.meta as { align?: string } | undefined)?.align || "left";

  return (
    <TableCell
      key={cell.id}
      className={cn(
        "px-2.5 py-2 flex items-center overflow-hidden",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
      style={{
        width: size,
        flex: isResizable ? `${size} 1 auto` : `0 0 ${size}px`,
      }}
    >
      <div
        className={cn(
          "min-w-0 w-full  ",
          isResizable && "truncate",
          align === "center" && "text-center",
          align === "right" && "text-right",
        )}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </TableCell>
  );
}

function DefaultHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const isRTL = useRTL();
  const table = header.getContext().table;
  const size = header.column.getSize();
  const isResizable = header.column.getCanResize();
  const align =
    (header.column.columnDef.meta as { align?: string } | undefined)?.align || "left";

  const handleResize =
    (header: Header<TData, unknown>) =>
    (event: React.MouseEvent | React.TouchEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const startX =
        "touches" in event
          ? event.touches[0].clientX
          : (event as React.MouseEvent).clientX;
      const startWidth = header.getSize();

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX =
          "touches" in moveEvent
            ? moveEvent.touches[0].clientX
            : (moveEvent as MouseEvent).clientX;
        const delta = currentX - startX;
        const effectiveDelta = isRTL ? -delta : delta;
        table.setColumnSizing((old) => ({
          ...old,
          [header.column.id]: Math.max(20, startWidth + effectiveDelta),
        }));
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove);
      document.addEventListener("touchend", onUp);
    };

  return (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      className={cn(
        "relative font-medium px-2.5 flex items-center h-10 overflow-hidden",
        "cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors",
        "text-slate-800 dark:text-slate-200",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
      )}
      style={{
        width: size,
        flex: isResizable ? `${size} 1 auto` : `0 0 ${size}px`,
      }}
    >
      <div
        className={cn(
          "relative w-full h-full flex items-center",
          align === "center"
            ? "justify-center"
            : align === "right"
              ? "justify-end"
              : "justify-start",
        )}
      >
        <div className={cn(isResizable && "truncate pr-2", "flex items-center min-w-0")}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>

      {isResizable && (
        <div
          onDoubleClick={() => header.column.resetSize()}
          onMouseDown={handleResize(header)}
          onTouchStart={handleResize(header)}
          className={cn(
            "absolute top-0 h-full w-[4px] cursor-col-resize touch-none select-none hover:bg-primary/30 transition-colors duration-200 z-20",
            isRTL ? "left-0" : "right-0",
            header.column.getIsResizing() ? "bg-primary w-[2px]" : "",
          )}
        />
      )}
    </TableHead>
  );
}

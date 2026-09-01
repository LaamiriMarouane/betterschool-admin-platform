import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, X } from "lucide-react";
import type { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { DateDisplay } from "@/components/date-display";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AuditLogResponseDTO } from "@/types/school-detail.types";
import {
  useSchoolDetailTabsStore,
  useSchoolDetailTabsActions,
} from "@/store/schools/school-detail.store";

import { DetailAlert, DetailCard } from "./detail-ui";

const ACTION_TONE: Record<string, string> = {
  CREATE: "text-emerald-600 dark:text-emerald-400",
  DELETE: "text-red-600 dark:text-red-400",
  LOGIN_FAILED: "text-amber-600 dark:text-amber-400",
  STATUS_CHANGE: "text-violet-600 dark:text-violet-400",
};

export function SchoolAuditTab({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const rows = useSchoolDetailTabsStore((s) => s.auditRows);
  const total = useSchoolDetailTabsStore((s) => s.auditTotal);
  const page = useSchoolDetailTabsStore((s) => s.auditPage);
  const size = useSchoolDetailTabsStore((s) => s.auditSize);
  const stats = useSchoolDetailTabsStore((s) => s.auditStats);
  const loading = useSchoolDetailTabsStore((s) => s.loading.audit);
  const error = useSchoolDetailTabsStore((s) => s.errors.audit);
  const { fetchAudit, fetchAuditStats } = useSchoolDetailTabsActions();

  useEffect(() => {
    void fetchAudit(schoolId, 0);
    void fetchAuditStats(schoolId);
  }, [schoolId, fetchAudit, fetchAuditStats]);

  const columns = useMemo<ColumnDef<AuditLogResponseDTO, unknown>[]>(
    () => [
      {
        id: "when",
        header: t("schoolDetail.audit.columns.when"),
        size: 158,
        cell: ({ row }) => (
          <DateDisplay
            date={row.original.createdAt}
            showTime
            showIcon={false}
            valueClassName="text-xs text-muted-foreground"
          />
        ),
      },
      {
        id: "action",
        header: t("schoolDetail.audit.columns.action"),
        size: 96,
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-wider",
              ACTION_TONE[row.original.action] ?? "text-muted-foreground",
            )}
          >
            {row.original.action}
          </span>
        ),
      },
      {
        id: "user",
        header: t("schoolDetail.audit.columns.user"),
        size: 172,
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="truncate text-xs">{row.original.username ?? "—"}</span>
        ),
      },
      {
        id: "description",
        header: t("schoolDetail.audit.columns.description"),
        size: 280,
        cell: ({ row }) => (
          <span className="truncate text-sm">
            {row.original.description ?? row.original.descriptionKey ?? "—"}
          </span>
        ),
      },
      {
        id: "entity",
        header: t("schoolDetail.audit.columns.entity"),
        size: 220,
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const { entityType, entityName } = row.original;
          return (
            <span className="truncate text-xs text-muted-foreground">
              {entityName ? `${entityType} · ${entityName}` : entityType || "—"}
            </span>
          );
        },
      },
    ],
    [t],
  );

  const pagination: PaginationState = { pageIndex: page, pageSize: size };

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    if (next.pageSize !== size) {
      void fetchAudit(schoolId, 0, next.pageSize);
      return;
    }
    void fetchAudit(schoolId, next.pageIndex);
  };

  if (loading && rows.length === 0 && !error) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DetailAlert variant="danger" icon={<X className="size-4" />}>
        {error.message}
      </DetailAlert>
    );
  }

  return (
    <div className="space-y-4">
      {stats && stats.totalEntries > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatPill label={t("schoolDetail.audit.stats30d")} value={stats.totalEntries} />
          <StatPill label={t("schoolDetail.audit.topAction")} value={topKey(stats.byAction)} />
          <StatPill label={t("schoolDetail.audit.topCategory")} value={topKey(stats.byCategory)} />
          <StatPill label={t("schoolDetail.audit.topUser")} value={topKey(stats.byUser) ?? "—"} />
        </div>
      )}

      <DetailCard title={t("schoolDetail.audit.title")} icon={<ClipboardList className="h-3.5 w-3.5" />}>
        <DataTable
          embedded
          data={rows}
          columns={columns}
          pagination={pagination}
          paginationOptions={{ rowCount: total, onPaginationChange }}
          urlPagination={{ enabled: false }}
          isLoading={loading}
          getRowId={(row) => row.id}
          emptyState={{
            icon: <ClipboardList />,
            message: t("schoolDetail.audit.empty"),
          }}
          tableClassName="rounded-md border"
        />
      </DetailCard>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function topKey(map: Record<string, number>): string {
  const entries = Object.entries(map);
  if (entries.length === 0) return "—";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

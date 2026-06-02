import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { DateDisplay } from "@/components/date-display";
import { TextDisplay } from "@/components/text-display";
import { AppImage } from "@/components/ui/app-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  planTierOptions,
  subscriptionStatusOptions,
} from "@/constants/subscription.constants";
import { formatBytes } from "@/lib/format";
import {
  useSchoolRows,
  useSchoolsActions,
  useSchoolsFilters,
  useSchoolsLoading,
  useSchoolsPage,
  useSchoolsSize,
  useSchoolsTotalItems,
} from "@/store/schools/schools.store";
import type { PlatformSchoolRowDTO } from "@/types/school.types";
import type { PlanTier, SchoolSubscriptionStatus } from "@/types/subscription.types";

import { EnrollmentStatusBadge, SubscriptionStatusBadge } from "./components/school-badges";

const ALL = "ALL";

export function SchoolsPage() {
  const { t } = useTranslation();

  const rows = useSchoolRows();
  const totalItems = useSchoolsTotalItems();
  const page = useSchoolsPage();
  const size = useSchoolsSize();
  const filters = useSchoolsFilters();
  const loading = useSchoolsLoading();
  const {
    fetchSchools,
    setSearch,
    setStatusFilter,
    setTierFilter,
    setPagination,
  } = useSchoolsActions();

  useEffect(() => {
    void fetchSchools();
  }, [fetchSchools]);

  const columns = useMemo<ColumnDef<PlatformSchoolRowDTO, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("schools.columns.school"),
        size: 260,
        cell: ({ row }) => {
          const school = row.original;
          return (
            <Link
              to={`/schools/${school.id}`}
              className="flex min-w-0 items-center gap-2 hover:underline underline-offset-4"
            >
              <AppImage
                attachment={school.logo}
                alt={school.name}
                className="h-8 w-8 shrink-0 rounded border"
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
                    {school.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                }
              />
              <TextDisplay
                value={school.name}
                subValue={school.schoolCode}
                variant="primary"
                truncate
              />
            </Link>
          );
        },
      },
      {
        id: "owner",
        header: t("schools.columns.owner"),
        size: 220,
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <TextDisplay
            value={row.original.ownerFullName}
            subValue={row.original.ownerEmail}
            truncate
          />
        ),
      },
      {
        id: "location",
        header: t("schools.columns.location"),
        size: 150,
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const location = [row.original.city, row.original.country]
            .filter(Boolean)
            .join(", ");
          return <TextDisplay value={location || null} truncate />;
        },
      },
      {
        id: "plan",
        header: t("schools.columns.plan"),
        size: 150,
        cell: ({ row }) => {
          const { planTier, planName } = row.original;
          const tierLabel = planTier ? t(`enums.planTier.${planTier}`) : null;
          // Show the tier as a sub-line only when it differs from the plan name
          // (avoids "Standard / Standard").
          const subValue =
            planName && tierLabel && planName !== tierLabel ? tierLabel : null;
          return (
            <TextDisplay
              value={planName ?? tierLabel}
              subValue={subValue}
              emptyText={t("schools.noPlan")}
              truncate
            />
          );
        },
      },
      {
        id: "status",
        header: t("schools.columns.status"),
        size: 130,
        meta: { align: "center" },
        cell: ({ row }) => <SubscriptionStatusBadge status={row.original.subscriptionStatus} />,
      },
      {
        id: "enrollment",
        header: t("schools.columns.enrollment"),
        size: 170,
        cell: ({ row }) => {
          const { enrollmentCount, enrollmentLimit, enrollmentStatus } = row.original;
          const limitLabel = enrollmentLimit == null ? "∞" : String(enrollmentLimit);
          return (
            <div className="flex items-center gap-2">
              <span className="text-[13px] tabular-nums">
                {enrollmentCount} / {limitLabel}
              </span>
              <EnrollmentStatusBadge status={enrollmentStatus} />
            </div>
          );
        },
      },
      {
        id: "storage",
        header: t("schools.columns.storage"),
        size: 110,
        meta: { align: "right", hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-[13px] tabular-nums">
            {formatBytes(row.original.storageBytesUsed)}
          </span>
        ),
      },
      {
        id: "created",
        header: t("schools.columns.created"),
        size: 140,
        meta: { hideOnMobile: true },
        cell: ({ row }) => <DateDisplay date={row.original.createdAt} showIcon={false} />,
      },
    ],
    [t],
  );

  const pagination: PaginationState = { pageIndex: page, pageSize: size };

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    // Apply page + size together (URL hook / page-size select can change both at once).
    setPagination(next.pageIndex, next.pageSize);
  };

  const statusValue = filters.status ?? ALL;
  const tierValue = filters.tier ?? ALL;

  const actions = [
    <Select
      key="status"
      value={statusValue}
      onValueChange={(value) =>
        setStatusFilter(value === ALL ? null : (value as SchoolSubscriptionStatus))
      }
    >
      <SelectTrigger className="h-9 w-[160px]">
        <SelectValue placeholder={t("schools.filters.status")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("schools.filters.allStatuses")}</SelectItem>
        {subscriptionStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>,
    <Select
      key="tier"
      value={tierValue}
      onValueChange={(value) => setTierFilter(value === ALL ? null : (value as PlanTier))}
    >
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue placeholder={t("schools.filters.tier")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("schools.filters.allTiers")}</SelectItem>
        {planTierOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>,
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("nav.schools")}</h1>
        <p className="text-sm text-muted-foreground">{t("schools.subtitle")}</p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        pagination={pagination}
        paginationOptions={{ rowCount: totalItems, onPaginationChange }}
        isLoading={loading.list}
        onSearchChange={setSearch}
        searchValue={filters.search}
        searchText={t("schools.searchPlaceholder")}
        getRowId={(row) => row.id}
        actions={actions}
      />
    </div>
  );
}

export default SchoolsPage;

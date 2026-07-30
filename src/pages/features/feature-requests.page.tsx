import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CircleCheck,
  ClipboardList,
  Lightbulb,
  Rocket,
  Search as SearchIcon,
} from "lucide-react";

import SearchInput from "@/components/search-input";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FEATURE_REQUEST_CATEGORIES,
  FEATURE_REQUEST_STATUSES,
  type FeatureRequestCategory,
  type FeatureRequestStatus,
} from "@/constants/feature-request.constants";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/pages/dashboard/components/dashboard-ui";
import {
  useFeatureRequestActions,
  useFeatureRequestFilters,
  useFeatureRequestLoading,
  useFeatureRequestPage,
  useFeatureRequestRows,
  useFeatureRequestSelected,
  useFeatureRequestSize,
  useFeatureRequestStats,
  useFeatureRequestStore,
} from "@/store/features/feature-request.store";
import type { FeatureRequestDetailDTO } from "@/types/feature-request.types";

import { FeatureDetailPane } from "./components/feature-detail-pane";
import { FeatureListPanel } from "./components/feature-list-panel";

const ALL = "ALL";

export function FeatureRequestsPage() {
  const { t } = useTranslation();

  const rows = useFeatureRequestRows();
  const selected = useFeatureRequestSelected();
  const stats = useFeatureRequestStats();
  const filters = useFeatureRequestFilters();
  const loading = useFeatureRequestLoading();
  const page = useFeatureRequestPage();
  const size = useFeatureRequestSize();
  const totalPages = useFeatureRequestStore((s) => s.totalPages);
  const {
    fetchRequests,
    fetchStats,
    findById,
    clearSelection,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    setPagination,
    deleteRequest,
  } = useFeatureRequestActions();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<FeatureRequestDetailDTO | null>(null);

  useEffect(() => {
    void fetchRequests();
    void fetchStats();
  }, [fetchRequests, fetchStats]);

  useEffect(() => {
    if (!selectedId) {
      clearSelection();
      return;
    }
    void findById(selectedId);
  }, [selectedId, findById, clearSelection]);

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await deleteRequest(deleting.id);
    if (ok) {
      setDeleting(null);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("featureRequests.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("featureRequests.subtitle")}</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            icon={Lightbulb}
            tone="sky"
            value={stats.totalNew}
            label={t("enums.featureStatus.NEW")}
          />
          <KpiCard
            icon={SearchIcon}
            tone="violet"
            value={stats.totalUnderReview}
            label={t("enums.featureStatus.UNDER_REVIEW")}
          />
          <KpiCard
            icon={ClipboardList}
            tone="emerald"
            value={stats.totalPlanned}
            label={t("enums.featureStatus.PLANNED")}
          />
          <KpiCard
            icon={Rocket}
            tone="rose"
            value={stats.totalInProgress}
            label={t("enums.featureStatus.IN_PROGRESS")}
          />
          <KpiCard
            icon={CircleCheck}
            tone="emerald"
            value={stats.totalReleased}
            label={t("enums.featureStatus.RELEASED")}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput
          value={filters.search}
          onChange={setSearch}
          placeholder={t("featureRequests.searchPlaceholder")}
          wrapperClassName="w-full min-w-0 lg:max-w-xs"
        />

        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) =>
            setStatusFilter(value === ALL ? null : (value as FeatureRequestStatus))
          }
        >
          <SelectTrigger className="h-9 w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("featureRequests.allStatuses")}</SelectItem>
            {FEATURE_REQUEST_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`enums.featureStatus.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? ALL}
          onValueChange={(value) =>
            setCategoryFilter(value === ALL ? null : (value as FeatureRequestCategory))
          }
        >
          <SelectTrigger className="h-9 w-full lg:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("featureRequests.allCategories")}</SelectItem>
            {FEATURE_REQUEST_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {t(`enums.featureCategory.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-5 xl:col-span-4">
          <FeatureListPanel
            requests={rows}
            selectedId={selectedId}
            loading={loading.list}
            page={page}
            totalPages={totalPages}
            onSelect={setSelectedId}
            onPageChange={(nextPage) => setPagination(nextPage, size)}
          />
        </aside>

        <main className="lg:col-span-7 xl:col-span-8">
          <FeatureDetailPane request={selected} onDelete={setDeleting} />
        </main>
      </div>

      <ConfirmAlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={t("featureRequests.deleteTitle")}
        description={
          <>
            <span className="font-medium text-foreground">{deleting?.title}</span>
            {" — "}
            {t("featureRequests.deleteDesc")}
          </>
        }
        actions={
          <>
            <AlertDialogCancel disabled={loading.save}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              disabled={loading.save}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {t("featureRequests.delete")}
            </AlertDialogAction>
          </>
        }
      />
    </div>
  );
}

export default FeatureRequestsPage;

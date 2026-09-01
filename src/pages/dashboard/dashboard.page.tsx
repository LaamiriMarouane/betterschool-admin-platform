import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, CircleCheck, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/currency-display";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/lib/format";
import {
  useDashboardActions,
  useDashboardData,
  useDashboardError,
} from "@/store/dashboard/dashboard.store";
import type { PlatformDashboardDTO } from "@/types/dashboard.types";

import {
  KpiCard,
  NewSchoolsChart,
  PlanDistribution,
  StatCard,
} from "./components/dashboard-ui";

export function DashboardPage() {
  const { t } = useTranslation();
  const data = useDashboardData();
  const error = useDashboardError();
  const { fetchDashboard } = useDashboardActions();

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {error && !data ? (
        <Card className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <AlertTriangle className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={() => void fetchDashboard()}>
            {t("dashboard.retry")}
          </Button>
        </Card>
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <DashboardContent data={data} />
      )}
    </div>
  );
}

function DashboardContent({ data }: { data: PlatformDashboardDTO }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={School}
          tone="violet"
          value={data.totalSchools}
          label={t("dashboard.kpi.totalSchools")}
        />
        <KpiCard
          icon={CircleCheck}
          tone="emerald"
          value={data.activeSubscriptions}
          label={t("dashboard.kpi.activeSubscriptions")}
        />
        <KpiCard
          icon={Clock}
          tone="sky"
          value={data.trialingSubscriptions}
          label={t("dashboard.kpi.onTrial")}
        />
        <KpiCard
          icon={AlertTriangle}
          tone="rose"
          value={data.pastDueSubscriptions}
          label={t("dashboard.kpi.pastDue")}
        />
      </div>

      {/* Revenue / volume stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dashboard.mrr.label")}
          value={
            <CurrencyDisplay
              amount={data.monthlyRecurringRevenue}
              currencyCode="USD"
              className="text-2xl font-bold font-sans"
            />
          }
          hint={
            <>
              <span className="text-muted-foreground">≈ </span>
              <CurrencyDisplay
                amount={data.monthlyRecurringRevenueMAD}
                currencyCode="MAD"
                className="text-xs text-muted-foreground"
              />
              <span className="text-muted-foreground"> · {t("dashboard.mrr.exclCustom")}</span>
            </>
          }
        />
        <StatCard
          label={t("dashboard.enrollments.label")}
          value={data.totalEnrollments.toLocaleString()}
          hint={t("dashboard.enrollments.hint", { count: data.totalSchools })}
        />
        <StatCard
          label={t("dashboard.storage.label")}
          value={formatBytes(data.totalStorageBytes)}
          hint={t("dashboard.storage.hint")}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <NewSchoolsChart
          data={data.newSchoolsByMonth}
          growthPercent={data.newSchoolsGrowthPercent}
        />
        <PlanDistribution data={data.planDistribution} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

export default DashboardPage;

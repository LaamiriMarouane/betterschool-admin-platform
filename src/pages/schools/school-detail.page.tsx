import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowLeft, ChevronRight, CreditCard, Lock } from "lucide-react";

import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSchoolDetail,
  useSchoolsActions,
  useSchoolsLoading,
} from "@/store/schools/schools.store";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

import { DetailAlert } from "./components/detail-ui";
import { SubscriptionStatusBadge } from "./components/school-badges";
import { SchoolOverviewTab } from "./components/school-overview-tab";
import { SchoolStorageTab } from "./components/school-storage-tab";
import { SchoolSubscriptionTab } from "./components/school-subscription-tab";

export function SchoolDetailPage() {
  const { t, i18n } = useTranslation();
  const { schoolId } = useParams();

  const detail = useSchoolDetail();
  const loading = useSchoolsLoading();
  const { fetchSchool, clearDetail } = useSchoolsActions();

  useEffect(() => {
    if (schoolId) void fetchSchool(schoolId);
    return () => clearDetail();
  }, [schoolId, fetchSchool, clearDetail]);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/schools" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("nav.schools")}
        </Link>
        {detail && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-foreground">{detail.name}</span>
          </>
        )}
      </nav>

      {loading.detail && !detail ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : detail ? (
        <SchoolDetail detail={detail} lang={i18n.language} />
      ) : null}
    </div>
  );
}

function SchoolDetail({ detail, lang }: { detail: PlatformSchoolDetailDTO; lang: string }) {
  const { t } = useTranslation();
  const tierLabel = detail.subscription?.planTier
    ? t(`enums.planTier.${detail.subscription.planTier}`)
    : null;

  return (
    <>
      <header className="flex items-center gap-4">
        <AppImage
          attachment={detail.logo}
          alt={detail.name}
          className="h-14 w-14 shrink-0 rounded-lg border"
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
              {detail.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          }
        />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{detail.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {detail.schoolCode && (
              <span className="font-mono text-xs text-muted-foreground">{detail.schoolCode}</span>
            )}
            {detail.schoolCodeLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                {t("schoolDetail.locked")}
              </Badge>
            )}
            <SubscriptionStatusBadge status={detail.subscription?.status ?? null} />
            {tierLabel && <Badge variant="neutral">{tierLabel}</Badge>}
            {detail.subscription?.customContract && (
              <Badge variant="info" className="gap-1">
                <CreditCard className="h-3 w-3" />
                {t("schoolDetail.subscription.customContract")}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {detail.enrollmentStatus === "EXCEEDED" && (
        <DetailAlert variant="danger" icon={<AlertTriangle className="h-4 w-4" />}>
          <b>{t("schoolDetail.alert.enrollmentExceeded")}</b>{" "}
          {t("schoolDetail.alert.enrollmentExceededDesc", {
            count: detail.enrollmentCount.toLocaleString(),
            limit: detail.enrollmentLimit?.toLocaleString() ?? "—",
          })}
        </DetailAlert>
      )}
      {detail.subscription?.status === "PAST_DUE" && (
        <DetailAlert variant="warning" icon={<AlertTriangle className="h-4 w-4" />}>
          <b>{t("schoolDetail.alert.pastDue")}</b> {t("schoolDetail.alert.pastDueDesc")}
        </DetailAlert>
      )}

      <ScrollableTabs
        tabsContentClassName="pt-5"
        tabs={[
          {
            value: "overview",
            label: t("schoolDetail.tabs.overview"),
            content: <SchoolOverviewTab detail={detail} />,
          },
          {
            value: "subscription",
            label: t("schoolDetail.tabs.subscription"),
            content: <SchoolSubscriptionTab detail={detail} lang={lang} />,
          },
          {
            value: "storage",
            label: t("schoolDetail.tabs.storage"),
            content: <SchoolStorageTab detail={detail} />,
          },
        ]}
      />
    </>
  );
}

export default SchoolDetailPage;

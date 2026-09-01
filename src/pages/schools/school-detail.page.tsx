import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowLeft, ChevronRight, CreditCard, Lock } from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasPermission } from "@/hooks/use-has-permission";
import {
  useSchoolDetail,
  useSchoolsActions,
  useSchoolsLoading,
} from "@/store/schools/schools.store";
import { useSchoolDetailTabsActions } from "@/store/schools/school-detail.store";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

import { SchoolAuditTab } from "./components/school-audit-tab";
import { SchoolBillingTab } from "./components/school-billing-tab";
import { SchoolModulesTab } from "./components/school-modules-tab";
import { SchoolSupportTab } from "./components/school-support-tab";
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
  const { reset: resetTabs } = useSchoolDetailTabsActions();

  useEffect(() => {
    if (schoolId) void fetchSchool(schoolId);
    return () => {
      clearDetail();
      resetTabs();
    };
  }, [schoolId, fetchSchool, clearDetail, resetTabs]);

  return (
    <div className="space-y-6">
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
      ) : detail && schoolId ? (
        <SchoolDetail detail={detail} schoolId={schoolId} lang={i18n.language} />
      ) : null}
    </div>
  );
}

function SchoolDetail({
  detail,
  schoolId,
  lang,
}: {
  detail: PlatformSchoolDetailDTO;
  schoolId: string;
  lang: string;
}) {
  const { t } = useTranslation();
  const can = useHasPermission();

  const tierLabel = detail.subscription?.planTier
    ? t(`enums.planTier.${detail.subscription.planTier}`)
    : null;

  const tabs = useMemo(() => {
    const items = [
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
      {
        value: "modules",
        label: t("schoolDetail.tabs.modules"),
        content: <SchoolModulesTab schoolId={schoolId} />,
      },
    ];

    if (can("platform.billing.read")) {
      items.push({
        value: "billing",
        label: t("schoolDetail.tabs.billing"),
        content: <SchoolBillingTab schoolId={schoolId} />,
      });
    }

    if (can("platform.support.read")) {
      items.push({
        value: "support",
        label: t("schoolDetail.tabs.support"),
        content: <SchoolSupportTab schoolId={schoolId} />,
      });
    }

    if (can("platform.audit.read")) {
      items.push({
        value: "audit",
        label: t("schoolDetail.tabs.audit"),
        content: <SchoolAuditTab schoolId={schoolId} />,
      });
    }

    return items;
  }, [can, detail, lang, schoolId, t]);

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-5">
        <AppImage
          attachment={detail.logo}
          alt={detail.name}
          className="h-16 w-16 shrink-0 rounded-xl border"
          fallback={
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted text-xl font-semibold text-muted-foreground">
              {detail.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          }
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{detail.name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
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

      <div className="space-y-3">
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
      </div>

      <PermissionGuard permissions="platform.schools.read">
        <ScrollableTabs
          stripWrapperClassName="mt-1"
          tabsContentClassName="pt-6"
          tabs={tabs}
        />
      </PermissionGuard>
    </div>
  );
}

export default SchoolDetailPage;

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  HardDrive,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlatformSchoolUsageDTO } from "@/types/school-detail.types";
import type { EnrollmentLimitStatus } from "@/types/subscription.types";

import { DetailCard, EnrollmentUsage } from "./detail-ui";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

interface UsageTileProps {
  icon: ReactNode;
  label: string;
  value: number;
  accent?: string;
}

function UsageTile({ icon, label, value, accent }: UsageTileProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4",
        "before:absolute before:inset-y-0 before:start-0 before:w-0.5",
        accent,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-mono text-2xl font-bold tabular-nums tracking-tight">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export function SchoolUsageSummary({
  usage,
  enrollmentCount,
  enrollmentLimit,
  enrollmentStatus,
}: {
  usage: PlatformSchoolUsageDTO | null;
  enrollmentCount: number;
  enrollmentLimit: number | null;
  enrollmentStatus: EnrollmentLimitStatus;
}) {
  const { t } = useTranslation();
  const data = usage ?? {
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0,
    parentCount: 0,
    enrollmentCount,
    enrollmentLimit,
    enrollmentStatus,
    storageBytesUsed: 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <UsageTile
          icon={<Shield className="size-3.5" />}
          label={t("schoolDetail.usage.admins")}
          value={data.adminCount}
          accent="before:bg-violet-500"
        />
        <UsageTile
          icon={<Users className="size-3.5" />}
          label={t("schoolDetail.usage.teachers")}
          value={data.teacherCount}
          accent="before:bg-sky-500"
        />
        <UsageTile
          icon={<GraduationCap className="size-3.5" />}
          label={t("schoolDetail.usage.students")}
          value={data.studentCount}
          accent="before:bg-emerald-500"
        />
        <UsageTile
          icon={<UserRound className="size-3.5" />}
          label={t("schoolDetail.usage.parents")}
          value={data.parentCount}
          accent="before:bg-amber-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard title={t("schoolDetail.enrollment")} icon={<GraduationCap className="h-3.5 w-3.5" />}>
          <EnrollmentUsage
            count={data.enrollmentCount}
            limit={data.enrollmentLimit}
            status={data.enrollmentStatus}
          />
        </DetailCard>
        <DetailCard title={t("schoolDetail.usage.storageUsed")} icon={<HardDrive className="h-3.5 w-3.5" />}>
          <div className="font-mono text-2xl font-bold tabular-nums">
            {formatBytes(data.storageBytesUsed)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("schoolDetail.usage.storageHint")}</p>
        </DetailCard>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { PieChart, TrendingUp, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/types/subscription.types";
import type { MonthlySignup, PlanDistributionEntry } from "@/types/dashboard.types";

// ─── Shared palettes ───

/** Soft icon-chip tones for the headline KPI cards. */
const KPI_TONES = {
  violet: { box: "bg-violet-100 dark:bg-violet-950", icon: "text-violet-600 dark:text-violet-400" },
  emerald: { box: "bg-emerald-100 dark:bg-emerald-950", icon: "text-emerald-600 dark:text-emerald-400" },
  sky: { box: "bg-sky-100 dark:bg-sky-950", icon: "text-sky-600 dark:text-sky-400" },
  rose: { box: "bg-rose-100 dark:bg-rose-950", icon: "text-rose-600 dark:text-rose-400" },
} as const;

export type KpiTone = keyof typeof KPI_TONES;

/** Plan-tier swatch colors (match the marketing/legend convention). */
const TIER_COLORS: Record<PlanTier, string> = {
  STARTER: "bg-slate-400",
  GROWTH: "bg-sky-500",
  STANDARD: "bg-violet-600",
  ENTERPRISE: "bg-orange-500",
};

// ─── Helpers ───

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** "2026-06" → localized short month ("Jun"). */
function formatMonthShort(month: string, locale: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
}

// ─── KPI / stat cards ───

interface KpiCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: KpiTone;
}

export function KpiCard({ icon: Icon, value, label, tone }: KpiCardProps) {
  const { i18n } = useTranslation();
  const tones = KPI_TONES[tone];
  return (
    <Card className="p-5">
      <div className={cn("mb-3 flex size-10 items-center justify-center rounded-lg", tones.box)}>
        <Icon className={cn("size-5", tones.icon)} />
      </div>
      <div className="text-2xl font-bold tabular-nums">{formatNumber(value, i18n.language)}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string | null;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </Card>
  );
}

// ─── New-schools chart ───

interface NewSchoolsChartProps {
  data: MonthlySignup[];
  growthPercent: number | null;
}

export function NewSchoolsChart({ data, growthPercent }: NewSchoolsChartProps) {
  const { t, i18n } = useTranslation();
  const max = Math.max(1, ...data.map((bucket) => bucket.count));
  const lastIndex = data.length - 1;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="size-4 text-muted-foreground" />
          {t("dashboard.newSchools.title")}
        </div>
        {growthPercent != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              growthPercent >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
            )}
          >
            <TrendingUp className={cn("size-3", growthPercent < 0 && "-scale-y-100")} />
            {growthPercent > 0 ? "+" : ""}
            {growthPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex h-28 items-end gap-2">
        {data.map((bucket, index) => (
          <div
            key={bucket.month}
            className={cn(
              "w-full self-end rounded-md",
              index === lastIndex ? "bg-violet-600" : "bg-muted",
            )}
            style={{ height: `${Math.max(6, (bucket.count / max) * 100)}%` }}
            title={t("dashboard.newSchools.tooltip", { count: bucket.count })}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((bucket) => (
          <span key={bucket.month} className="flex-1 text-center text-[11px] text-muted-foreground">
            {formatMonthShort(bucket.month, i18n.language)}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ─── Plan distribution ───

interface PlanDistributionProps {
  data: PlanDistributionEntry[];
}

export function PlanDistribution({ data }: PlanDistributionProps) {
  const { t } = useTranslation();
  const total = data.reduce((sum, entry) => sum + entry.schoolCount, 0);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <PieChart className="size-4 text-muted-foreground" />
        {t("dashboard.planDistribution.title")}
      </div>

      <div className="mb-4 flex h-3.5 overflow-hidden rounded-full bg-muted">
        {total > 0
          ? data
              .filter((entry) => entry.schoolCount > 0)
              .map((entry) => (
                <span
                  key={entry.tier}
                  className={TIER_COLORS[entry.tier]}
                  style={{ width: `${(entry.schoolCount / total) * 100}%` }}
                />
              ))
          : null}
      </div>

      <div className="space-y-2.5">
        {data.map((entry) => (
          <div key={entry.tier} className="flex items-center gap-2.5 text-sm">
            <span className={cn("size-2.5 rounded-sm", TIER_COLORS[entry.tier])} />
            <span className="flex-1">{t(`enums.planTier.${entry.tier}`)}</span>
            <span className="font-semibold tabular-nums">{entry.schoolCount}</span>
            <span className="w-10 text-end text-xs tabular-nums text-muted-foreground">
              {total > 0 ? Math.round((entry.schoolCount / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

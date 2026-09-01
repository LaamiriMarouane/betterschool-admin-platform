import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnrollmentLimitStatus } from "@/types/subscription.types";

/** Card with an icon + label section header, used across the detail tabs. */
export function DetailCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-[20px]">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Key/value row — fixed 140px label column, value fills the rest and is
 * left-aligned (mirrors the prototype's `.kv` grid). Em dash when empty.
 */
export function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: ReactNode;
  mono?: boolean;
}) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-2 border-b border-border py-[11px] last:border-0">
      <div className="text-[12.5px] font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "min-w-0 break-words text-[13.5px] text-foreground",
          mono && "font-mono text-[12.5px]",
        )}
      >
        {empty ? <span className="text-muted-foreground">—</span> : value}
      </div>
    </div>
  );
}

/** Small bordered chip for links / social handles. */
export function Chip({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border bg-background px-2 py-1 text-xs text-foreground">
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Initials avatar (owner). */
export function InitialAvatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-muted font-semibold text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {initial}
    </div>
  );
}

/** "count / limit" with a usage bar (green/amber/red) + a % readout when over/near. */
export function EnrollmentUsage({
  count,
  limit,
  status,
}: {
  count: number;
  limit: number | null;
  status: EnrollmentLimitStatus;
}) {
  if (limit == null) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-base font-semibold tabular-nums">
          {count.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">· ∞</span>
      </div>
    );
  }
  const percent = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0;
  const barClass =
    status === "EXCEEDED" ? "bg-red-500" : status === "WARNING" ? "bg-amber-500" : "bg-green-500";
  const percentClass =
    status === "EXCEEDED" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-sm font-semibold tabular-nums">
          {count.toLocaleString()}
          <span className="text-muted-foreground"> / {limit.toLocaleString()}</span>
        </span>
        {status !== "OK" && (
          <span className={cn("font-mono text-[10.5px] font-bold tracking-wider", percentClass)}>
            {percent}%
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** Inline alert strip (data-driven warnings on the detail page). */
export function DetailAlert({
  variant,
  icon,
  children,
}: {
  variant: "danger" | "warning" | "info";
  icon: ReactNode;
  children: ReactNode;
}) {
  const styles = {
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  }[variant];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border p-3 text-sm [&_b]:font-semibold", styles)}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

/** Per-category storage colors (mirrors the design's palette). */
export const STORAGE_CATEGORY_COLOR: Record<string, string> = {
  DOCUMENTS: "#2563eb",
  IMAGES: "#059669",
  ACADEMIC: "#7c3aed",
  MEDIA: "#ea580c",
  ADMINISTRATIVE: "#c026d3",
  OTHER: "#64748b",
};

export function storageColor(category: string): string {
  return STORAGE_CATEGORY_COLOR[category] ?? STORAGE_CATEGORY_COLOR.OTHER;
}

/** Canonical category order — render all of these even when a school has 0 bytes in one. */
export const STORAGE_CATEGORIES = [
  "DOCUMENTS",
  "IMAGES",
  "ACADEMIC",
  "MEDIA",
  "ADMINISTRATIVE",
  "OTHER",
] as const;

/** Stacked one-line distribution of storage categories. */
export function DistributionBar({
  segments,
  total,
}: {
  segments: { category: string; bytes: number }[];
  total: number;
}) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((seg) => (
        <span
          key={seg.category}
          title={seg.category}
          style={{
            width: `${total > 0 ? (seg.bytes / total) * 100 : 0}%`,
            background: storageColor(seg.category),
          }}
        />
      ))}
    </div>
  );
}

/** Violet accent arc used by the storage donut (matches the design's `--accent`). */
const DONUT_ACCENT = "#7c3aed";

/** Donut showing used %. `percent` null = unlimited (full accent ring). */
export function StorageDonut({ percent, label }: { percent: number | null; label?: string }) {
  const arc = percent ?? 100;
  return (
    <div
      className="relative grid h-[116px] w-[116px] shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${DONUT_ACCENT} ${arc}%, hsl(var(--muted)) 0)`,
      }}
    >
      <div className="grid h-[90px] w-[90px] place-items-center rounded-full bg-card">
        <div className="text-center leading-none">
          <div className="text-[22px] font-bold leading-none">
            {percent != null ? `${percent}%` : "∞"}
          </div>
          {label && (
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import {
  Check,
  CreditCard,
  GraduationCap,
  Inbox,
  LayoutGrid,
  LifeBuoy,
  Lock,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  FLOOR_PERMISSIONS,
  GROUP_ORDER,
  humanizePermission,
  matchPreset,
  permissionGroupKey,
  PRESET_PERMISSIONS,
  PRESETS,
  type PresetKey,
} from "@/constants/permissions.constants";

const FLOOR = new Set<string>(FLOOR_PERMISSIONS);

/** Icon per display group; unknown groups fall back to a generic shield. */
const GROUP_ICON: Record<string, LucideIcon> = {
  schools: GraduationCap,
  billing: CreditCard,
  contact: Inbox,
  support: LifeBuoy,
  team: Users,
  platform: LayoutGrid,
};

interface ResourceRow {
  group: string;
  viewKey?: string;
  manageKey?: string;
}

/**
 * Permission editor as a resource × action matrix. Rows are the backend `catalog`
 * grouped by derived area (drift-safe: a new key slots into its group/column by
 * suffix). Each row exposes a VIEW (`.read`) and MANAGE (`.manage`) toggle.
 *
 * Rules:
 * - Manage implies View: granting Manage also grants View and locks it on.
 * - Floor permissions are always on + locked so a staffer can always load the console.
 */
export function PermissionPicker({
  value,
  onChange,
  catalog,
  disabled,
}: {
  value: string[];
  onChange: (keys: string[]) => void;
  catalog: string[];
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const selected = new Set(value);
  const activePreset = matchPreset(value);

  const applyPreset = (preset: PresetKey) => {
    if (disabled) return;
    onChange(PRESET_PERMISSIONS[preset].filter((key) => catalog.includes(key)));
  };

  const toggleManage = (viewKey: string | undefined, manageKey: string) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(manageKey)) {
      next.delete(manageKey);
    } else {
      next.add(manageKey);
      if (viewKey) next.add(viewKey); // manage implies view
    }
    onChange([...next]);
  };

  const toggleView = (viewKey: string) => {
    if (disabled || FLOOR.has(viewKey)) return;
    const next = new Set(selected);
    if (next.has(viewKey)) next.delete(viewKey);
    else next.add(viewKey);
    onChange([...next]);
  };

  // Bucket the catalog into display groups, in the preferred order; split each
  // group's keys into the VIEW / MANAGE columns by action suffix.
  const buckets = new Map<string, string[]>();
  for (const key of catalog) {
    const group = permissionGroupKey(key);
    buckets.set(group, [...(buckets.get(group) ?? []), key]);
  }
  const orderedGroups = [
    ...GROUP_ORDER.filter((group) => buckets.has(group)),
    ...[...buckets.keys()].filter((group) => !GROUP_ORDER.includes(group)),
  ];
  const rows: ResourceRow[] = orderedGroups.map((group) => {
    const keys = buckets.get(group) ?? [];
    return {
      group,
      viewKey: keys.find((key) => key.endsWith(".read")),
      manageKey: keys.find((key) => key.endsWith(".manage")),
    };
  });

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("permissions.presetLabel")}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const active = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && <span className="size-1.5 rounded-full bg-emerald-400" />}
                {t(`permissions.presets.${preset}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource × action matrix */}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_3.5rem_4rem] items-center gap-2 bg-muted/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t("permissions.resource")}</span>
          <span className="text-center">{t("permissions.view")}</span>
          <span className="text-center">{t("permissions.manage")}</span>
        </div>

        {rows.map((row) => {
          const Icon = GROUP_ICON[row.group] ?? Shield;
          const description = t(`permissions.groupDesc.${row.group}`, { defaultValue: "" });
          const manageOn = row.manageKey ? selected.has(row.manageKey) : false;
          const viewOn = row.viewKey ? selected.has(row.viewKey) || manageOn : false;
          const viewLocked = row.viewKey ? FLOOR.has(row.viewKey) || manageOn : false;

          return (
            <div
              key={row.group}
              className="grid grid-cols-[1fr_3.5rem_4rem] items-center gap-2 border-t px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {t(`permissions.groups.${row.group}`, { defaultValue: humanizePermission(row.group) })}
                  </div>
                  {description ? (
                    <div className="truncate text-xs text-muted-foreground">{description}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-center">
                {row.viewKey ? (
                  <MatrixToggle
                    on={viewOn}
                    locked={viewLocked}
                    disabled={disabled}
                    label={t("permissions.view")}
                    lockTitle={t(
                      manageOn && !FLOOR.has(row.viewKey)
                        ? "permissions.viewLockedByManage"
                        : "permissions.lockedHint",
                    )}
                    onClick={() => toggleView(row.viewKey as string)}
                  />
                ) : (
                  <EmptyCell />
                )}
              </div>

              <div className="flex justify-center">
                {row.manageKey ? (
                  <MatrixToggle
                    on={manageOn}
                    disabled={disabled}
                    label={t("permissions.manage")}
                    onClick={() => toggleManage(row.viewKey, row.manageKey as string)}
                  />
                ) : (
                  <EmptyCell />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        {t("permissions.lockNote")}
      </p>
    </div>
  );
}

/** One matrix checkbox. `locked` renders an on-but-non-interactive state with a lock. */
function MatrixToggle({
  on,
  locked,
  disabled,
  label,
  lockTitle,
  onClick,
}: {
  on: boolean;
  locked?: boolean;
  disabled?: boolean;
  label: string;
  lockTitle?: string;
  onClick: () => void;
}) {
  if (locked) {
    return (
      <span
        title={lockTitle}
        aria-label={label}
        className="flex size-7 items-center justify-center rounded-md border border-violet-200 bg-violet-50 text-violet-500 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-400"
      >
        <Lock className="size-3.5" />
      </span>
    );
  }
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md border transition-colors disabled:opacity-50",
        on
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-border bg-transparent text-transparent hover:border-violet-400",
      )}
    >
      <Check className="size-4" />
    </button>
  );
}

function EmptyCell() {
  return <span className="text-sm text-muted-foreground/50">—</span>;
}

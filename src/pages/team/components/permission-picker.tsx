import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import {
  FLOOR_PERMISSIONS,
  GROUP_ORDER,
  humanizePermission,
  matchPreset,
  permissionGroupKey,
  PERMISSION_LABEL_KEY,
  PRESET_PERMISSIONS,
  PRESETS,
  type PlatformPermission,
  type PresetKey,
} from "@/constants/permissions.constants";

const FLOOR = new Set<string>(FLOOR_PERMISSIONS);

/**
 * Preset quick-apply buttons + permission toggles. The toggle list is the backend
 * `catalog` (drift-safe), grouped by derived area; labels fall back to a humanized
 * key when untranslated. Floor permissions are always on + locked so a staffer can
 * never be created unable to load the console.
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

  const toggle = (key: string) => {
    if (disabled || FLOOR.has(key)) return;
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  };

  const labelFor = (key: string) => {
    const leaf = PERMISSION_LABEL_KEY[key as PlatformPermission];
    return leaf ? t(leaf, { defaultValue: humanizePermission(key) }) : humanizePermission(key);
  };

  // Bucket the backend catalog into display groups, in the preferred order.
  const buckets = new Map<string, string[]>();
  for (const key of catalog) {
    const group = permissionGroupKey(key);
    buckets.set(group, [...(buckets.get(group) ?? []), key]);
  }
  const orderedGroups = [
    ...GROUP_ORDER.filter((group) => buckets.has(group)),
    ...[...buckets.keys()].filter((group) => !GROUP_ORDER.includes(group)),
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("permissions.presetLabel")}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                activePreset === preset
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(`permissions.presets.${preset}`)}
            </button>
          ))}
          {activePreset === "CUSTOM" && (
            <span className="self-center text-xs text-muted-foreground">{t("permissions.custom")}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {orderedGroups.map((group) => (
          <div key={group}>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`permissions.groups.${group}`, { defaultValue: humanizePermission(group) })}
            </div>
            <div className="flex flex-wrap gap-2">
              {(buckets.get(group) ?? []).map((key) => {
                const isOn = selected.has(key);
                const isLocked = FLOOR.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled || isLocked}
                    onClick={() => toggle(key)}
                    title={isLocked ? t("permissions.lockedHint") : undefined}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      isOn
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                      isLocked ? "cursor-not-allowed opacity-60" : "",
                      disabled && !isLocked ? "opacity-50" : "",
                    )}
                  >
                    {labelFor(key)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Database } from "lucide-react";

import { formatBytes } from "@/lib/format";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

import {
  DetailCard,
  DistributionBar,
  STORAGE_CATEGORIES,
  StorageDonut,
  storageColor,
} from "./detail-ui";

export function SchoolStorageTab({ detail }: { detail: PlatformSchoolDetailDTO }) {
  const { t } = useTranslation();
  const storage = detail.storage;

  if (!storage) {
    return (
      <DetailCard title={t("schoolDetail.tabs.storage")} icon={<Database className="h-3.5 w-3.5" />}>
        <p className="py-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</p>
      </DetailCard>
    );
  }

  // Always render every category, even at 0, in the canonical order.
  const byCategory = new Map(storage.breakdown.map((entry) => [entry.category, entry]));
  const rows = STORAGE_CATEGORIES.map(
    (category) => byCategory.get(category) ?? { category, bytes: 0, fileCount: 0 },
  );
  const maxBytes = Math.max(1, ...rows.map((entry) => entry.bytes));
  const totalFiles = rows.reduce((sum, entry) => sum + entry.fileCount, 0);
  const percent = storage.quotaBytes
    ? Math.min(100, Math.round((storage.totalBytes / storage.quotaBytes) * 100))
    : null;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <DetailCard title={t("schoolDetail.storage.breakdown")} icon={<Database className="h-3.5 w-3.5" />}>
        <DistributionBar segments={rows} total={storage.totalBytes} />
        <div className="mt-4 space-y-3">
          {rows.map((entry) => (
            <div key={entry.category} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: storageColor(entry.category) }}
                />
                {t(`storage.category.${entry.category}`, entry.category)}
              </div>
              <div className="text-end text-xs tabular-nums text-muted-foreground">
                {formatBytes(entry.bytes)} · {t("schoolDetail.storage.files", { value: entry.fileCount })}
              </div>
              <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(entry.bytes / maxBytes) * 100}%`,
                    background: storageColor(entry.category),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </DetailCard>

      <DetailCard title={t("schoolDetail.storage.used")} icon={<Database className="h-3.5 w-3.5" />}>
        <div className="flex items-center gap-5 pt-1">
          <StorageDonut percent={percent} label={t("schoolDetail.storage.used")} />
          <div className="min-w-0">
            <div className="text-xl font-semibold">{formatBytes(storage.totalBytes)}</div>
            <div className="text-sm text-muted-foreground">
              {t("schoolDetail.storage.ofQuota", {
                value: storage.quotaBytes
                  ? formatBytes(storage.quotaBytes)
                  : t("schoolDetail.storage.unlimited"),
              })}
            </div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">
              {t("schoolDetail.storage.totalFiles", { value: totalFiles.toLocaleString() })}
            </div>
          </div>
        </div>
      </DetailCard>
    </div>
  );
}

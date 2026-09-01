import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, LayoutGrid, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SCHOOL_MODULE_KEYS, type SchoolModuleKey } from "@/types/school-detail.types";
import {
  useSchoolDetailTabsStore,
  useSchoolDetailTabsActions,
} from "@/store/schools/school-detail.store";

import { DetailAlert, DetailCard } from "./detail-ui";

export function SchoolModulesTab({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const modules = useSchoolDetailTabsStore((s) => s.modules);
  const loading = useSchoolDetailTabsStore((s) => s.loading.modules);
  const error = useSchoolDetailTabsStore((s) => s.errors.modules);
  const { fetchModules } = useSchoolDetailTabsActions();

  useEffect(() => {
    void fetchModules(schoolId);
  }, [schoolId, fetchModules]);

  if (loading && !modules) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DetailAlert variant="danger" icon={<X className="size-4" />}>
        {error.message}
      </DetailAlert>
    );
  }

  const enabled = new Set(modules?.enabledModules ?? []);

  return (
    <DetailCard title={t("schoolDetail.modules.title")} icon={<LayoutGrid className="h-3.5 w-3.5" />}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOOL_MODULE_KEYS.map((key) => (
            <ModuleChip key={key} moduleKey={key} enabled={enabled.has(key)} />
          ))}
        </div>
      </DetailCard>
  );
}

function ModuleChip({ moduleKey, enabled }: { moduleKey: SchoolModuleKey; enabled: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
        enabled
          ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
          : "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full",
          enabled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted",
        )}
      >
        {enabled ? <Check className="size-3" /> : <X className="size-3" />}
      </span>
      <span className="font-medium">{t(`schoolDetail.modules.items.${moduleKey}`)}</span>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchoolsActions, useSchoolsLoading } from "@/store/schools/schools.store";
import type { PlatformSubscriptionDTO } from "@/types/subscription.types";

/**
 * Extend a school's trial by N days while a sales conversation is in progress, so the purge
 * scheduler does not delete its data mid-negotiation. Clears the scheduled-purge / warning markers
 * server-side. Only meaningful for TRIALING / EXPIRED subscriptions.
 */
export function ExtendTrialDialog({
  open,
  onOpenChange,
  schoolId,
  subscription,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  subscription: PlatformSubscriptionDTO;
}) {
  const { t } = useTranslation();
  const { extendTrial } = useSchoolsActions();
  const loading = useSchoolsLoading();

  const [days, setDays] = useState("14");

  useEffect(() => {
    if (open) setDays("14");
  }, [open]);

  const daysNum = Number(days);
  const canSubmit = daysNum >= 1 && daysNum <= 365 && !loading.save;

  const submit = async () => {
    const ok = await extendTrial(schoolId, { days: daysNum });
    if (ok) onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("extendTrial.title")}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading.save}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Check className="size-4" />
            {t("extendTrial.confirm")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-2 sm:w-[26rem] sm:px-0">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("extendTrial.description")}
        </p>
        {subscription.trialEndsAt && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t("extendTrial.currentEnd")}: </span>
            <DateDisplay date={subscription.trialEndsAt} showIcon={false} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="trial-days" required>
            {t("extendTrial.days")}
          </Label>
          <Input
            id="trial-days"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("extendTrial.daysHint")}</p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

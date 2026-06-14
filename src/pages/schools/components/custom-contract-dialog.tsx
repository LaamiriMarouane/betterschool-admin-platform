import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchoolsActions, useSchoolsLoading } from "@/store/schools/schools.store";
import type { PlatformSubscriptionDTO } from "@/types/subscription.types";

/** How the enrollment cap is expressed in the form (kept out of the wire's sentinel encoding). */
type CapMode = "PLAN" | "CUSTOM" | "UNLIMITED";

/**
 * Grant or edit a negotiated custom contract on a school's subscription. The cap is chosen as
 * Plan default / a specific number / Unlimited — mapped to the wire value (null / N / -1) on submit.
 * No Paddle call happens here; the admin records deal terms and (optionally) the custom price id
 * the school will check out against.
 */
export function CustomContractDialog({
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
  const { setCustomContract } = useSchoolsActions();
  const loading = useSchoolsLoading();

  const [enabled, setEnabled] = useState(false);
  const [capMode, setCapMode] = useState<CapMode>("PLAN");
  const [capValue, setCapValue] = useState("");
  const [priceMad, setPriceMad] = useState("");
  const [paddlePriceId, setPaddlePriceId] = useState("");

  useEffect(() => {
    if (!open) return;
    setEnabled(subscription.customContract);
    const cap = subscription.customMaxEnrollments;
    if (cap == null) {
      setCapMode("PLAN");
      setCapValue("");
    } else if (cap <= 0) {
      setCapMode("UNLIMITED");
      setCapValue("");
    } else {
      setCapMode("CUSTOM");
      setCapValue(String(cap));
    }
    setPriceMad(subscription.customPriceMAD != null ? String(subscription.customPriceMAD) : "");
    setPaddlePriceId(subscription.customPaddlePriceId ?? "");
  }, [open, subscription]);

  // A specific cap requires a positive number; everything else is always valid.
  const capValid = !enabled || capMode !== "CUSTOM" || Number(capValue) > 0;
  const canSubmit = capValid && !loading.save;

  const submit = async () => {
    const customMaxEnrollments =
      !enabled || capMode === "PLAN"
        ? null
        : capMode === "UNLIMITED"
          ? -1
          : Number(capValue);

    const ok = await setCustomContract(schoolId, {
      customContract: enabled,
      customMaxEnrollments,
      customPriceMAD: enabled && priceMad.trim() ? Number(priceMad) : null,
      customPaddlePriceId: enabled && paddlePriceId.trim() ? paddlePriceId.trim() : null,
    });
    if (ok) onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("customContract.title")}
      description={t("customContract.description")}
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
            {t("common.save")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-2 sm:w-[28rem] sm:px-0">
        <div className="space-y-1.5">
          <Label htmlFor="cc-enabled">{t("customContract.enabled")}</Label>
          <Select
            value={enabled ? "ON" : "OFF"}
            onValueChange={(value) => setEnabled(value === "ON")}
          >
            <SelectTrigger id="cc-enabled" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OFF">{t("customContract.disabled")}</SelectItem>
              <SelectItem value="ON">{t("customContract.enabledOption")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("customContract.enabledHint")}</p>
        </div>

        {enabled && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="cc-cap-mode">{t("customContract.cap")}</Label>
              <Select value={capMode} onValueChange={(value) => setCapMode(value as CapMode)}>
                <SelectTrigger id="cc-cap-mode" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAN">{t("customContract.capPlan")}</SelectItem>
                  <SelectItem value="CUSTOM">{t("customContract.capCustom")}</SelectItem>
                  <SelectItem value="UNLIMITED">{t("customContract.capUnlimited")}</SelectItem>
                </SelectContent>
              </Select>
              {capMode === "CUSTOM" && (
                <Input
                  type="number"
                  min={1}
                  value={capValue}
                  onChange={(e) => setCapValue(e.target.value)}
                  placeholder={t("customContract.capPlaceholder")}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cc-price">{t("customContract.priceMad")}</Label>
              <Input
                id="cc-price"
                type="number"
                min={0}
                value={priceMad}
                onChange={(e) => setPriceMad(e.target.value)}
                placeholder={t("customContract.pricePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("customContract.priceHint")}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cc-paddle">{t("customContract.paddlePriceId")}</Label>
              <Input
                id="cc-paddle"
                value={paddlePriceId}
                onChange={(e) => setPaddlePriceId(e.target.value)}
                placeholder="pri_…"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">{t("customContract.paddleHint")}</p>
            </div>
          </>
        )}
      </div>
    </ResponsiveDialog>
  );
}

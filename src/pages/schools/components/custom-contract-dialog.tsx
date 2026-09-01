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

/** How a numeric cap is expressed in the form (kept out of the wire's sentinel encoding). */
type CapMode = "PLAN" | "CUSTOM" | "UNLIMITED";

function modeFromCap(cap: number | null | undefined): { mode: CapMode; value: string } {
  if (cap == null) return { mode: "PLAN", value: "" };
  if (cap <= 0) return { mode: "UNLIMITED", value: "" };
  return { mode: "CUSTOM", value: String(cap) };
}

function wireCap(enabled: boolean, mode: CapMode, value: string): number | null {
  if (!enabled || mode === "PLAN") return null;
  if (mode === "UNLIMITED") return -1;
  return Number(value);
}

/**
 * Grant or edit a negotiated custom contract on a school's subscription. Caps are chosen as
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
  const [schoolsCapMode, setSchoolsCapMode] = useState<CapMode>("PLAN");
  const [schoolsCapValue, setSchoolsCapValue] = useState("");
  const [priceMad, setPriceMad] = useState("");
  const [paddlePriceId, setPaddlePriceId] = useState("");

  useEffect(() => {
    if (!open) return;
    setEnabled(subscription.customContract);
    const enrollment = modeFromCap(subscription.customMaxEnrollments);
    setCapMode(enrollment.mode);
    setCapValue(enrollment.value);
    const schools = modeFromCap(subscription.customMaxSchools);
    setSchoolsCapMode(schools.mode);
    setSchoolsCapValue(schools.value);
    setPriceMad(subscription.customPriceMAD != null ? String(subscription.customPriceMAD) : "");
    setPaddlePriceId(subscription.customPaddlePriceId ?? "");
  }, [open, subscription]);

  const enrollmentCapValid =
    !enabled || capMode !== "CUSTOM" || Number(capValue) > 0;
  const schoolsCapValid =
    !enabled || schoolsCapMode !== "CUSTOM" || Number(schoolsCapValue) > 0;
  const canSubmit = enrollmentCapValid && schoolsCapValid && !loading.save;

  const submit = async () => {
    const ok = await setCustomContract(schoolId, {
      customContract: enabled,
      customMaxEnrollments: wireCap(enabled, capMode, capValue),
      customMaxSchools: wireCap(enabled, schoolsCapMode, schoolsCapValue),
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
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("customContract.description")}
        </p>
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
              <Label htmlFor="cc-schools-cap-mode">{t("customContract.schoolsCap")}</Label>
              <Select
                value={schoolsCapMode}
                onValueChange={(value) => setSchoolsCapMode(value as CapMode)}
              >
                <SelectTrigger id="cc-schools-cap-mode" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLAN">{t("customContract.capPlan")}</SelectItem>
                  <SelectItem value="CUSTOM">{t("customContract.capCustom")}</SelectItem>
                  <SelectItem value="UNLIMITED">{t("customContract.capUnlimited")}</SelectItem>
                </SelectContent>
              </Select>
              {schoolsCapMode === "CUSTOM" && (
                <Input
                  type="number"
                  min={1}
                  value={schoolsCapValue}
                  onChange={(e) => setSchoolsCapValue(e.target.value)}
                  placeholder={t("customContract.schoolsCapPlaceholder")}
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                {t("customContract.schoolsCapHint")}
              </p>
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

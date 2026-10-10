import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLegalActions, useLegalLoading, useLegalPreview } from "@/store/legal/legal.store";
import { LEGAL_LOCALES, type LegalVersionDetailDTO } from "@/types/legal.types";

import { LegalKindBadge } from "./legal-badges";

interface LegalPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: LegalVersionDetailDTO;
  /** Unsaved edits block publishing: the server publishes what is saved. */
  dirty: boolean;
  onPublished: (published: LegalVersionDetailDTO) => void;
}

function hasText(html: string | undefined): boolean {
  if (!html) return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").trim().length > 0;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Publishing freezes the draft for every customer, so the dialog runs the same checks the server
 * will (all languages, summary, notice period, configured values) and asks to type the label.
 */
export function LegalPublishDialog({ open, onOpenChange, draft, dirty, onPublished }: LegalPublishDialogProps) {
  const { t } = useTranslation();
  const loading = useLegalLoading();
  const preview = useLegalPreview(draft.id);
  const { fetchPreview, publish } = useLegalActions();
  const [confirmLabel, setConfirmLabel] = useState("");
  const [urgentReason, setUrgentReason] = useState("");

  useEffect(() => {
    if (open && !dirty) void fetchPreview(draft.id);
  }, [open, dirty, draft.id, draft.rowVersion, fetchPreview]);

  const isMaterial = draft.changeKind === "MATERIAL";
  const needsNotice = isMaterial && !draft.firstPublication;
  // Evaluated when the dialog opens; the server re-checks against its own clock.
  const [openedAt] = useState(() => Date.now());
  const effectiveMs = draft.effectiveAt ? new Date(draft.effectiveAt).getTime() : openedAt;
  const insideNotice = needsNotice && effectiveMs < openedAt + draft.materialNoticeDays * DAY_MS - DAY_MS;

  const missingKeys = useMemo(
    () => Array.from(new Set(Object.values(preview?.missingKeys ?? {}).flat())),
    [preview],
  );

  const checks = [
    { ok: !dirty, label: t("legal.publish.checkSaved") },
    { ok: draft.changeKind != null, label: t("legal.publish.checkKind") },
    {
      ok: !draft.firstPublication || isMaterial,
      label: t("legal.publish.checkFirstMaterial"),
      hidden: !draft.firstPublication,
    },
    ...LEGAL_LOCALES.map((locale) => ({
      ok: hasText(draft.contentTemplate[locale]),
      label: t("legal.publish.checkText", { language: t(`legal.locales.${locale}`) }),
    })),
    ...(needsNotice
      ? LEGAL_LOCALES.map((locale) => ({
          ok: (draft.changeSummary[locale] ?? "").trim().length > 0,
          label: t("legal.publish.checkSummary", { language: t(`legal.locales.${locale}`) }),
        }))
      : []),
    {
      ok: preview != null && missingKeys.length === 0,
      label:
        missingKeys.length > 0
          ? t("legal.publish.checkValuesMissing", {
              keys: missingKeys.map((k) => t(`legal.variables.${k}`, { defaultValue: k })).join(", "),
            })
          : t("legal.publish.checkValues"),
    },
  ].filter((c) => !("hidden" in c && c.hidden));

  const ready =
    checks.every((c) => c.ok) &&
    confirmLabel.trim() === draft.nextLabel &&
    (!insideNotice || urgentReason.trim().length > 0);

  const submit = async () => {
    const published = await publish(draft.id, {
      rowVersion: draft.rowVersion,
      confirmLabel: confirmLabel.trim(),
      urgentReason: insideNotice ? urgentReason.trim() : undefined,
    });
    if (published) {
      onOpenChange(false);
      onPublished(published);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("legal.publish.title", { type: t(`legal.type.${draft.type}`), label: draft.nextLabel })}
      description={t("legal.publish.description")}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!ready || loading.publish}>
            {t("legal.publish.confirm")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <LegalKindBadge kind={draft.changeKind} />
          <span className="text-muted-foreground">
            {t("legal.effective")}{" "}
            {draft.effectiveAt && effectiveMs > openedAt ? (
              <DateDisplay date={draft.effectiveAt} showIcon={false} className="inline-flex" />
            ) : (
              t("legal.effectiveImmediately")
            )}
          </span>
        </div>

        <p className="text-muted-foreground">
          {draft.firstPublication
            ? t("legal.publish.firstHint")
            : isMaterial
              ? t("legal.publish.materialHint", { days: draft.materialNoticeDays })
              : t("legal.publish.editorialHint")}
        </p>

        <ul className="space-y-1.5">
          {checks.map((check) => (
            <li key={check.label} className={cn("flex items-start gap-2", !check.ok && "text-destructive")}>
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
              )}
              <span>{check.label}</span>
            </li>
          ))}
        </ul>

        {insideNotice && (
          <div className="space-y-1.5">
            <Label htmlFor="urgent-reason">{t("legal.publish.urgentReason")}</Label>
            <Textarea
              id="urgent-reason"
              value={urgentReason}
              onChange={(e) => setUrgentReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {t("legal.publish.urgentHint", { days: draft.materialNoticeDays })}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="confirm-label">{t("legal.publish.typeLabel", { label: draft.nextLabel })}</Label>
          <Input
            id="confirm-label"
            value={confirmLabel}
            onChange={(e) => setConfirmLabel(e.target.value)}
            placeholder={draft.nextLabel ?? ""}
            dir="ltr"
            autoComplete="off"
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}

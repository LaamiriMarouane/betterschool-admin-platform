import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Eye, GitCompare, PencilLine, Save, Send, Trash2 } from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useLegalActions,
  useLegalLoading,
  useLegalPreview,
  useLegalVariables,
  useLegalVersion,
} from "@/store/legal/legal.store";
import { LEGAL_LOCALES, type LegalChangeKind, type LegalVersionDetailDTO, type LocaleMap } from "@/types/legal.types";

import { LegalContent } from "./legal-content";
import { LegalDiff } from "./legal-diff";
import { LegalEditor } from "./legal-editor";
import { LegalPublishDialog } from "./legal-publish-dialog";

type Mode = "edit" | "preview" | "changes";

const sameMap = (a: LocaleMap, b: LocaleMap) =>
  LEGAL_LOCALES.every((l) => (a[l] ?? "") === (b[l] ?? ""));

/** Midnight UTC of the chosen calendar day, so the effective date never shifts with the author's timezone. */
function toUtcMidnight(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

function fromIso(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function LegalDraftEditor({ draft }: { draft: LegalVersionDetailDTO }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loading = useLegalLoading();
  const variables = useLegalVariables();
  const preview = useLegalPreview(draft.id);
  const source = useLegalVersion(draft.clonedFromId ?? undefined);
  const { fetchVariables, fetchPreview, fetchVersion, saveDraft, deleteDraft } = useLegalActions();

  const [templates, setTemplates] = useState<LocaleMap>(draft.contentTemplate);
  const [summaries, setSummaries] = useState<LocaleMap>(draft.changeSummary);
  const [changeKind, setChangeKind] = useState<LegalChangeKind | null>(draft.changeKind);
  const [effectiveAt, setEffectiveAt] = useState<string | null>(draft.effectiveAt);
  const [authoritativeLocale, setAuthoritativeLocale] = useState(draft.authoritativeLocale);
  const [locale, setLocale] = useState<string>(LEGAL_LOCALES[0]);
  const [mode, setMode] = useState<Mode>("edit");
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    void fetchVariables();
  }, [fetchVariables]);

  useEffect(() => {
    if (draft.clonedFromId && !source) void fetchVersion(draft.clonedFromId);
  }, [draft.clonedFromId, source, fetchVersion]);

  const dirty =
    !sameMap(templates, draft.contentTemplate) ||
    !sameMap(summaries, draft.changeSummary) ||
    changeKind !== draft.changeKind ||
    effectiveAt !== draft.effectiveAt ||
    authoritativeLocale !== draft.authoritativeLocale;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (mode !== "edit" && !dirty && !preview) void fetchPreview(draft.id);
  }, [mode, dirty, preview, draft.id, fetchPreview]);

  const save = async () => {
    const saved = await saveDraft(draft.id, {
      rowVersion: draft.rowVersion,
      contentTemplate: templates,
      changeSummary: summaries,
      changeKind: changeKind ?? undefined,
      effectiveAt: effectiveAt ?? undefined,
      clearEffectiveAt: effectiveAt == null,
      authoritativeLocale,
    });
    // Adopt the server-sanitized template so "dirty" compares against what is stored.
    if (saved) {
      setTemplates(saved.contentTemplate);
      setSummaries(saved.changeSummary);
    }
  };

  const remove = async () => {
    if (await deleteDraft(draft.id)) navigate(`/legal/${draft.type}`, { replace: true });
  };

  const needsSummary = changeKind === "MATERIAL" && !draft.firstPublication;
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (changeKind === "MATERIAL" && !draft.firstPublication ? draft.materialNoticeDays : 0));
    return d;
  }, [changeKind, draft.firstPublication, draft.materialNoticeDays]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {dirty && <span className="me-auto text-xs text-amber-600">{t("legal.editor.unsaved")}</span>}
        <PermissionGuard permissions="platform.legal.manage">
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            {t("legal.deleteDraft")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={save} disabled={!dirty || loading.save}>
            <Save className="size-4" />
            {t("common.save")}
          </Button>
        </PermissionGuard>
        <PermissionGuard permissions="platform.legal.publish">
          <Button size="sm" className="gap-1.5" onClick={() => setPublishOpen(true)}>
            <Send className="size-4" />
            {t("legal.publish.open", { label: draft.nextLabel })}
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("legal.fields.changeKind")}</Label>
            <Select value={changeKind ?? ""} onValueChange={(v) => setChangeKind(v as LegalChangeKind)}>
              <SelectTrigger>
                <SelectValue placeholder={t("legal.fields.changeKindPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITORIAL">{t("legal.kind.EDITORIAL")}</SelectItem>
                <SelectItem value="MATERIAL">{t("legal.kind.MATERIAL")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {changeKind ? t(`legal.kindHint.${changeKind}`) : t("legal.kindHint.choose")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("legal.fields.effectiveAt")}</Label>
            <Select
              value={effectiveAt ? "DATE" : "ASAP"}
              onValueChange={(v) => setEffectiveAt(v === "ASAP" ? null : toUtcMidnight(minDate))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASAP">{t("legal.effectiveImmediately")}</SelectItem>
                <SelectItem value="DATE">{t("legal.fields.onDate")}</SelectItem>
              </SelectContent>
            </Select>
            {effectiveAt && (
              <DatePicker
                value={fromIso(effectiveAt)}
                onSelect={(d) => d && setEffectiveAt(toUtcMidnight(d))}
                buttonClassName="w-full"
              />
            )}
            {needsSummary && (
              <p className="text-xs text-muted-foreground">
                {t("legal.fields.noticeHint", { days: draft.materialNoticeDays })}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t("legal.fields.authoritativeLocale")}</Label>
            <Select value={authoritativeLocale} onValueChange={setAuthoritativeLocale}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEGAL_LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {t(`legal.locales.${l}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("legal.fields.authoritativeHint")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={locale} onValueChange={setLocale}>
          <TabsList>
            {LEGAL_LOCALES.map((l) => (
              <TabsTrigger key={l} value={l}>
                {t(`legal.locales.${l}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="edit" className="gap-1.5">
              <PencilLine className="size-3.5" />
              {t("legal.mode.edit")}
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1.5">
              <Eye className="size-3.5" />
              {t("legal.mode.preview")}
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-1.5">
              <GitCompare className="size-3.5" />
              {t("legal.mode.changes")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode !== "edit" && dirty && (
        <Alert>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {t("legal.editor.previewStale")}
            <Button size="sm" variant="outline" onClick={save} disabled={loading.save}>
              {t("common.save")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {mode === "edit" &&
        (variables.length === 0 && loading.variables ? (
          <Skeleton className="h-[460px] w-full rounded-md" />
        ) : (
          // One editor instance per locale (keyed): each keeps its own undo history.
          <LegalEditor
            key={locale}
            locale={locale}
            value={templates[locale] ?? ""}
            onChange={(html) => setTemplates((prev) => ({ ...prev, [locale]: html }))}
            variables={variables}
          />
        ))}

      {mode === "preview" && (
        <div className={cn("rounded-md border bg-background px-6 py-5", !preview && "min-h-[200px]")}>
          {preview ? (
            <>
              {(preview.missingKeys[locale]?.length ?? 0) > 0 && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">
                    {t("legal.editor.missingValues", {
                      keys: preview.missingKeys[locale]
                        .map((k) => t(`legal.variables.${k}`, { defaultValue: k }))
                        .join(", "),
                    })}
                  </AlertDescription>
                </Alert>
              )}
              <LegalContent html={preview.html[locale] ?? ""} locale={locale} />
            </>
          ) : (
            <Skeleton className="h-40 w-full" />
          )}
        </div>
      )}

      {mode === "changes" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {source?.label
              ? t("legal.diff.comparedTo", { label: source.label })
              : t("legal.diff.noPrevious")}
          </p>
          {preview && <LegalDiff before={source?.content?.[locale]} after={preview.html[locale] ?? ""} locale={locale} />}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="change-summary">
          {t("legal.fields.changeSummary", { language: t(`legal.locales.${locale}`) })}
          {needsSummary && <span className="text-destructive"> *</span>}
        </Label>
        <Textarea
          id="change-summary"
          dir={locale === "ar" ? "rtl" : "ltr"}
          value={summaries[locale] ?? ""}
          onChange={(e) => setSummaries((prev) => ({ ...prev, [locale]: e.target.value }))}
          rows={4}
          placeholder={t("legal.fields.changeSummaryPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("legal.fields.changeSummaryHint")}</p>
      </div>

      {publishOpen && (
        <LegalPublishDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          draft={draft}
          dirty={dirty}
          onPublished={() => setMode("edit")}
        />
      )}

      <ConfirmAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("legal.deleteDraftTitle")}
        description={t("legal.deleteDraftDescription")}
        actions={
          <>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <Button variant="destructive" onClick={remove} disabled={loading.save}>
              {t("legal.deleteDraft")}
            </Button>
          </>
        }
      />
    </div>
  );
}

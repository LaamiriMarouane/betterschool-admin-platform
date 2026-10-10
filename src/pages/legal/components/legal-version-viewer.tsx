import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Copy, CopyPlus, Eye, GitCompare, Undo2 } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { PermissionGuard } from "@/components/permission-guard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopy } from "@/hooks/use-copy";
import { useLegalActions, useLegalHistory, useLegalLoading, useLegalVersion } from "@/store/legal/legal.store";
import { LEGAL_LOCALES, type LegalVersionDetailDTO } from "@/types/legal.types";

import { LegalContent } from "./legal-content";
import { LegalDiff } from "./legal-diff";
import { LegalWithdrawDialog } from "./legal-withdraw-dialog";

type Mode = "read" | "changes";

/** Read-only view of a published or withdrawn version: frozen text, hash, frozen values, diff. */
export function LegalVersionViewer({ version }: { version: LegalVersionDetailDTO }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { copy } = useCopy();
  const loading = useLegalLoading();
  const history = useLegalHistory(version.type);
  const { fetchHistory, fetchVersion, createDraft } = useLegalActions();
  const [locale, setLocale] = useState<string>(LEGAL_LOCALES[0]);
  const [mode, setMode] = useState<Mode>("read");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!history) void fetchHistory(version.type);
  }, [history, version.type, fetchHistory]);

  // Previous = the highest published sequence below this one (withdrawn versions included: they were public).
  const previousSummary = history
    ?.filter((v) => v.sequence != null && version.sequence != null && v.sequence < version.sequence)
    .sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0))[0];
  const previous = useLegalVersion(previousSummary?.id);

  useEffect(() => {
    if (mode === "changes" && previousSummary && !previous) void fetchVersion(previousSummary.id);
  }, [mode, previousSummary, previous, fetchVersion]);

  const hasDraft = history?.some((v) => v.status === "DRAFT") ?? false;

  const startDraftFromHere = async () => {
    const draft = await createDraft(version.type, version.id);
    if (draft) navigate(`/legal/versions/${draft.id}`);
  };

  const snapshotKeys = Object.keys(version.variablesSnapshot ?? {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        {version.state === "UPCOMING" && (
          <PermissionGuard permissions="platform.legal.publish">
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setWithdrawOpen(true)}>
              <Undo2 className="size-4" />
              {t("legal.withdraw.open")}
            </Button>
          </PermissionGuard>
        )}
        {!hasDraft && (
          <PermissionGuard permissions="platform.legal.manage">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={startDraftFromHere} disabled={loading.save}>
              <CopyPlus className="size-4" />
              {t("legal.draftFromThis")}
            </Button>
          </PermissionGuard>
        )}
      </div>

      {version.driftedKeys.length > 0 && (
        <Alert variant={version.driftMaterial ? "destructive" : "default"}>
          <AlertTriangle className="size-4" />
          <AlertDescription className="space-y-1 text-xs">
            <p>
              {t("legal.drift.title", {
                label: version.label ?? "",
                keys: version.driftedKeys.map((k) => t(`legal.variables.${k}`, { defaultValue: k })).join(", "),
              })}
            </p>
            <p>{version.driftMaterial ? t("legal.drift.material") : t("legal.drift.editorial")}</p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-x-6 gap-y-3 pt-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta label={t("legal.effective")}>
            <DateDisplay date={version.effectiveAt} showIcon={false} showTime />
          </Meta>
          <Meta label={t("legal.columns.published")}>
            <DateDisplay date={version.publishedAt} showIcon={false} showTime />
          </Meta>
          <Meta label={t("legal.fields.authoritativeLocale")}>{t(`legal.locales.${version.authoritativeLocale}`)}</Meta>
          <Meta label={t("legal.hash")}>
            <button
              type="button"
              className="inline-flex max-w-full items-center gap-1 font-mono text-xs hover:underline"
              onClick={() => void copy(version.contentHash ?? "")}
              title={version.contentHash ?? ""}
              dir="ltr"
            >
              <span className="truncate">{version.contentHash?.slice(0, 16)}…</span>
              <Copy className="size-3 shrink-0" />
            </button>
          </Meta>
          {version.urgentReason && (
            <Meta label={t("legal.publish.urgentReason")} wide>
              {version.urgentReason}
            </Meta>
          )}
          {version.withdrawReason && (
            <Meta label={t("legal.withdraw.reason")} wide>
              {version.withdrawReason}
            </Meta>
          )}
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
            <TabsTrigger value="read" className="gap-1.5">
              <Eye className="size-3.5" />
              {t("legal.mode.read")}
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-1.5">
              <GitCompare className="size-3.5" />
              {t("legal.mode.changes")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {version.changeSummary[locale] && (
        <div className="rounded-md border bg-muted/40 p-4 text-sm">
          <p className="mb-1 font-medium">{t("legal.fields.changeSummaryTitle")}</p>
          <p className="whitespace-pre-wrap text-muted-foreground" dir={locale === "ar" ? "rtl" : "ltr"}>
            {version.changeSummary[locale]}
          </p>
        </div>
      )}

      {mode === "read" ? (
        <div className="rounded-md border bg-background px-6 py-5">
          <LegalContent html={version.content?.[locale] ?? ""} locale={locale} />
        </div>
      ) : (
        <div className="space-y-2">
          {previousSummary && (
            <p className="text-xs text-muted-foreground">
              {t("legal.diff.comparedTo", { label: previousSummary.label })}
            </p>
          )}
          <LegalDiff before={previous?.content?.[locale]} after={version.content?.[locale] ?? ""} locale={locale} />
        </div>
      )}

      {snapshotKeys.length > 0 && (
        <details className="rounded-md border p-4 text-sm">
          <summary className="cursor-pointer font-medium">{t("legal.frozenValues")}</summary>
          <dl className="mt-3 space-y-2">
            {snapshotKeys.map((key) => (
              <div key={key} className="grid gap-1 sm:grid-cols-[12rem_1fr]">
                <dt className="text-muted-foreground">{t(`legal.variables.${key}`, { defaultValue: key })}</dt>
                <dd className="break-all" dir="ltr">
                  {Array.from(new Set(Object.values(version.variablesSnapshot?.[key] ?? {}))).join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {withdrawOpen && <LegalWithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} version={version} />}
    </div>
  );
}

function Meta({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-4" : undefined}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

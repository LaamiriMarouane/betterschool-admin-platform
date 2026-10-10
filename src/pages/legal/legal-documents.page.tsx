import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertTriangle, FilePlus2, History, PencilLine } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { PermissionGuard } from "@/components/permission-guard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLegalActions, useLegalLoading, useLegalOverview } from "@/store/legal/legal.store";
import type { LegalDocumentOverviewDTO, LegalVersionSummaryDTO } from "@/types/legal.types";

import { LegalKindBadge } from "./components/legal-badges";

/** Platform landing for Terms / Privacy / Refund: what's live, what's scheduled, what's being drafted. */
export function LegalDocumentsPage() {
  const { t } = useTranslation();
  const overview = useLegalOverview();
  const loading = useLegalLoading();
  const { fetchOverview } = useLegalActions();

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("nav.legal")}</h1>
        <p className="text-sm text-muted-foreground">{t("legal.subtitle")}</p>
      </div>

      {loading.overview && overview.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {overview.map((doc) => (
            <DocumentCard key={doc.type} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc }: { doc: LegalDocumentOverviewDTO }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loading = useLegalLoading();
  const { createDraft } = useLegalActions();

  const startDraft = async () => {
    const draft = await createDraft(doc.type);
    if (draft) navigate(`/legal/versions/${draft.id}`);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{t(`legal.type.${doc.type}`)}</CardTitle>
          <Badge variant={doc.requiresAcceptance ? "info" : "neutral"}>
            {doc.requiresAcceptance ? t("legal.ownerAccepts") : t("legal.displayOnly")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <dl className="space-y-3">
          <VersionRow label={t("legal.state.CURRENT")} version={doc.current} emptyText={t("legal.notPublished")} />
          {doc.upcoming && <VersionRow label={t("legal.state.UPCOMING")} version={doc.upcoming} />}
          {doc.draft && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("legal.state.DRAFT")}</dt>
              <dd className="text-end">
                <span className="text-xs text-muted-foreground">{t("legal.lastEdited")} </span>
                <DateDisplay date={doc.draft.updatedAt} showIcon={false} showTime />
              </dd>
            </div>
          )}
        </dl>

        {doc.driftedKeys.length > 0 && (
          <Alert variant={doc.driftMaterial ? "destructive" : "default"}>
            <AlertTriangle className="size-4" />
            <AlertDescription className="space-y-1 text-xs">
              <p>
                {t("legal.drift.title", {
                  label: doc.current?.label ?? "",
                  keys: doc.driftedKeys.map((k) => t(`legal.variables.${k}`, { defaultValue: k })).join(", "),
                })}
              </p>
              <p>{doc.driftMaterial ? t("legal.drift.material") : t("legal.drift.editorial")}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/legal/${doc.type}`}>
              <History className="size-4" />
              {t("legal.history", { count: doc.publishedCount })}
            </Link>
          </Button>
          {doc.draft ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link to={`/legal/versions/${doc.draft.id}`}>
                <PencilLine className="size-4" />
                {t("legal.continueDraft")}
              </Link>
            </Button>
          ) : (
            <PermissionGuard permissions="platform.legal.manage">
              <Button size="sm" className="gap-1.5" onClick={startDraft} disabled={loading.save}>
                <FilePlus2 className="size-4" />
                {doc.current ? t("legal.newVersion") : t("legal.newDocument")}
              </Button>
            </PermissionGuard>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function VersionRow({
  label,
  version,
  emptyText,
}: {
  label: string;
  version: LegalVersionSummaryDTO | null;
  emptyText?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end">
        {version ? (
          <Link to={`/legal/versions/${version.id}`} className="space-y-1 hover:underline">
            <div className="flex items-center justify-end gap-2">
              <span className="font-medium tabular-nums">{version.label}</span>
              <LegalKindBadge kind={version.changeKind} />
            </div>
            <div className="text-xs text-muted-foreground">
              {t("legal.effective")} <DateDisplay date={version.effectiveAt} showIcon={false} className="inline-flex" />
            </div>
          </Link>
        ) : (
          <span className="text-muted-foreground">{emptyText}</span>
        )}
      </dd>
    </div>
  );
}

export default LegalDocumentsPage;

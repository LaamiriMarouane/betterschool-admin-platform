import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FilePlus2 } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { EmptyState } from "@/components/empty-state";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLegalActions, useLegalHistory, useLegalLoading } from "@/store/legal/legal.store";
import { LEGAL_DOCUMENT_TYPES, type LegalDocumentType } from "@/types/legal.types";

import { LegalKindBadge, LegalStateBadge } from "./components/legal-badges";

/** Every version of one document type, draft first. */
export function LegalHistoryPage() {
  const { type: rawType } = useParams();
  const type = (LEGAL_DOCUMENT_TYPES as readonly string[]).includes(rawType ?? "")
    ? (rawType as LegalDocumentType)
    : null;

  if (!type) return <Navigate to="/legal" replace />;
  return <LegalHistory type={type} />;
}

function LegalHistory({ type }: { type: LegalDocumentType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const history = useLegalHistory(type);
  const loading = useLegalLoading();
  const { fetchHistory, createDraft } = useLegalActions();

  useEffect(() => {
    void fetchHistory(type);
  }, [fetchHistory, type]);

  const draft = history?.find((v) => v.status === "DRAFT");

  const startDraft = async () => {
    const created = await createDraft(type);
    if (created) navigate(`/legal/versions/${created.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-muted-foreground">
            <Link to="/legal">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("nav.legal")}
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{t(`legal.type.${type}`)}</h1>
          <p className="text-sm text-muted-foreground">{t("legal.historySubtitle")}</p>
        </div>
        {draft ? (
          <Button asChild size="sm">
            <Link to={`/legal/versions/${draft.id}`}>{t("legal.continueDraft")}</Link>
          </Button>
        ) : (
          <PermissionGuard permissions="platform.legal.manage">
            <Button size="sm" className="gap-1.5" onClick={startDraft} disabled={loading.save}>
              <FilePlus2 className="size-4" />
              {t("legal.newVersion")}
            </Button>
          </PermissionGuard>
        )}
      </div>

      {!history && loading.history ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : !history || history.length === 0 ? (
        <EmptyState message={t("legal.noVersions")} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("legal.columns.version")}</TableHead>
                <TableHead>{t("legal.columns.state")}</TableHead>
                <TableHead>{t("legal.columns.kind")}</TableHead>
                <TableHead>{t("legal.columns.effective")}</TableHead>
                <TableHead>{t("legal.columns.published")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((v) => (
                <TableRow
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/legal/versions/${v.id}`)}
                >
                  <TableCell className="font-medium tabular-nums">{v.label ?? t("legal.state.DRAFT")}</TableCell>
                  <TableCell>
                    <LegalStateBadge state={v.state} />
                  </TableCell>
                  <TableCell>
                    <LegalKindBadge kind={v.changeKind} />
                  </TableCell>
                  <TableCell>
                    <DateDisplay date={v.effectiveAt} showIcon={false} emptyText="—" />
                  </TableCell>
                  <TableCell>
                    <DateDisplay date={v.publishedAt} showIcon={false} showTime emptyText="—" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default LegalHistoryPage;

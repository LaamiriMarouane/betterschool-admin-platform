import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLegalActions, useLegalErrors, useLegalVersion } from "@/store/legal/legal.store";

import { LegalKindBadge, LegalStateBadge } from "./components/legal-badges";
import { LegalDraftEditor } from "./components/legal-draft-editor";
import { LegalVersionViewer } from "./components/legal-version-viewer";

/** One version: the editor while it is a draft, the frozen read-only view once published. */
export function LegalVersionPage() {
  const { t } = useTranslation();
  const { versionId } = useParams();
  const version = useLegalVersion(versionId);
  const errors = useLegalErrors();
  const { fetchVersion } = useLegalActions();

  useEffect(() => {
    if (versionId) void fetchVersion(versionId);
  }, [versionId, fetchVersion]);

  if (!version) {
    return errors.version ? (
      <EmptyState message={errors.version.message} />
    ) : (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[460px] w-full" />
      </div>
    );
  }

  const isDraft = version.status === "DRAFT";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-muted-foreground">
          <Link to={`/legal/${version.type}`}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t(`legal.type.${version.type}`)}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold">
            {isDraft
              ? t("legal.draftTitle", { label: version.nextLabel })
              : t("legal.versionTitle", { label: version.label })}
          </h1>
          <LegalStateBadge state={version.state} />
          <LegalKindBadge kind={version.changeKind} />
        </div>
      </div>

      {/* Keyed by id + status so publishing swaps the editor for the viewer with fresh state. */}
      {isDraft ? (
        <LegalDraftEditor key={`${version.id}-draft`} draft={version} />
      ) : (
        <LegalVersionViewer key={`${version.id}-${version.status}`} version={version} />
      )}
    </div>
  );
}

export default LegalVersionPage;

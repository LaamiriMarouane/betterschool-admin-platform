import { useTranslation } from "react-i18next";
import { Inbox, MessageSquare, Pin, ThumbsUp } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FeatureRequestListDTO } from "@/types/feature-request.types";

import { FeatureStatusBadge } from "./feature-status-badge";

interface FeatureListPanelProps {
  requests: FeatureRequestListDTO[];
  selectedId: string | null;
  loading: boolean;
  page: number;
  totalPages: number;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function FeatureListPanel({
  requests,
  selectedId,
  loading,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: FeatureListPanelProps) {
  const { t } = useTranslation();

  if (loading && requests.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <Inbox className="size-7 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("featureRequests.empty")}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex max-h-[calc(100vh-22rem)] flex-col gap-2 overflow-y-auto pe-1">
        {requests.map((request) => {
          const selected = request.id === selectedId;
          return (
            <button
              key={request.id}
              type="button"
              onClick={() => onSelect(request.id)}
              className={cn(
                "w-full rounded-lg border bg-card p-3 text-start transition-colors",
                "hover:bg-muted/40",
                selected ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <FeatureStatusBadge status={request.status} />
                {request.pinned ? (
                  <Pin className="size-3.5 shrink-0 text-primary" />
                ) : null}
              </div>

              <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
                {request.title}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                {request.submittedBySchoolName || "—"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5" />
                  <span className="tabular-nums">{request.voteCount}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  <span className="tabular-nums">{request.commentCount}</span>
                </span>
                <span>{t(`enums.featureCategory.${request.category}`)}</span>
              </div>

              <div className="mt-2">
                <DateDisplay
                  date={request.createdAt}
                  showIcon={false}
                  valueClassName="text-xs text-muted-foreground"
                />
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 0 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            {t("dataTable.previousPage")}
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            {t("dataTable.nextPage")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

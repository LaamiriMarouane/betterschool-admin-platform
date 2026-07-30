import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pin, Send, Trash2 } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  FEATURE_REQUEST_STATUSES,
  type FeatureRequestStatus,
} from "@/constants/feature-request.constants";
import { cn } from "@/lib/utils";
import {
  useFeatureRequestActions,
  useFeatureRequestComments,
  useFeatureRequestLoading,
} from "@/store/features/feature-request.store";
import type { FeatureRequestDetailDTO } from "@/types/feature-request.types";

import { FeatureStatusBadge } from "./feature-status-badge";

interface FeatureDetailPaneProps {
  request: FeatureRequestDetailDTO | null;
  onDelete: (request: FeatureRequestDetailDTO) => void;
}

export function FeatureDetailPane({ request, onDelete }: FeatureDetailPaneProps) {
  const { t } = useTranslation();
  const comments = useFeatureRequestComments();
  const loading = useFeatureRequestLoading();
  const { updateStatus, updatePlatformResponse, togglePin, addComment } =
    useFeatureRequestActions();

  const [statusNote, setStatusNote] = useState("");
  const [platformResponse, setPlatformResponse] = useState("");
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    setStatusNote("");
    setPlatformResponse(request?.platformResponse ?? "");
    setCommentBody("");
  }, [request?.id, request?.platformResponse]);

  if (loading.detail && !request) {
    return (
      <Card className="space-y-3 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="flex min-h-[280px] items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">{t("featureRequests.noSelection")}</p>
      </Card>
    );
  }

  const onStatusChange = (status: FeatureRequestStatus) => {
    void updateStatus(request.id, status, statusNote.trim() || undefined);
  };

  const onSaveResponse = async () => {
    await updatePlatformResponse(request.id, platformResponse.trim());
  };

  const onComment = async () => {
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    const ok = await addComment(request.id, trimmed);
    if (ok) setCommentBody("");
  };

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4 border-b px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <FeatureStatusBadge status={request.status} />
          <span className="text-sm text-muted-foreground">
            {t(`enums.featureCategory.${request.category}`)}
          </span>
          {request.pinned ? <Pin className="size-3.5 text-primary" /> : null}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug">{request.title}</h2>
          <div className="shrink-0 rounded-md border px-2.5 py-1 text-center">
            <div className="text-base font-semibold tabular-nums">{request.voteCount}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("featureRequests.votes")}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{t("featureRequests.submittedBy")}</p>
          <p className="mt-0.5 text-sm font-medium">{request.submittedBySchoolName || "—"}</p>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {request.description}
        </p>

        {request.statusNote ? (
          <p className="text-sm text-muted-foreground">{request.statusNote}</p>
        ) : null}

        <PermissionGuard
          permissions="platform.features.manage"
          fallback={
            request.platformResponse ? (
              <div className="rounded-md border border-primary/15 border-s-2 border-s-primary bg-primary/5 px-3 py-2.5">
                <p className="text-xs font-medium text-primary">
                  {t("featureRequests.platformResponse")}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{request.platformResponse}</p>
              </div>
            ) : null
          }
        >
          <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[160px] flex-1">
                <Select
                  value={request.status}
                  onValueChange={(value) => onStatusChange(value as FeatureRequestStatus)}
                  disabled={loading.save}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_REQUEST_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`enums.featureStatus.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                disabled={loading.save}
                onClick={() => void togglePin(request.id)}
              >
                <Pin className="size-4" />
                {request.pinned ? t("featureRequests.unpin") : t("featureRequests.pin")}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-destructive hover:text-destructive"
                disabled={loading.save}
                onClick={() => onDelete(request)}
              >
                <Trash2 className="size-4" />
                {t("featureRequests.delete")}
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("featureRequests.statusNote")}
              </label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
                placeholder={t("featureRequests.statusNotePlaceholder")}
                className="resize-y text-start"
                disabled={loading.save}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("featureRequests.platformResponse")}
              </label>
              <Textarea
                value={platformResponse}
                onChange={(e) => setPlatformResponse(e.target.value)}
                rows={3}
                placeholder={t("featureRequests.platformResponsePlaceholder")}
                className="resize-y border-s-2 border-s-primary text-start"
                disabled={loading.save}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={loading.save}
                  onClick={() => void onSaveResponse()}
                >
                  {t("featureRequests.saveResponse")}
                </Button>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      <div className="space-y-3 px-5 py-5">
        <p className="text-sm font-semibold">{t("featureRequests.comments")}</p>

        {loading.comments && comments.length === 0 ? (
          <Skeleton className="h-16 w-full" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "rounded-md border px-3 py-2.5 text-start",
                comment.platformReply
                  ? "border-primary/15 border-s-2 border-s-primary bg-primary/5"
                  : "bg-muted/40",
              )}
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <DateDisplay
                  date={comment.createdAt}
                  showIcon={false}
                  showTime
                  valueClassName="text-xs text-muted-foreground"
                />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
            </div>
          ))
        )}
      </div>

      <PermissionGuard permissions="platform.features.manage">
        <div className="border-t px-5 py-4">
          <div className="flex flex-col gap-2">
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              placeholder={t("featureRequests.commentPlaceholder")}
              className="min-h-[80px] resize-y text-start"
              disabled={loading.save}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={loading.save || !commentBody.trim()}
                onClick={() => void onComment()}
              >
                <Send className="size-4" />
                {t("featureRequests.addComment")}
              </Button>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </Card>
  );
}

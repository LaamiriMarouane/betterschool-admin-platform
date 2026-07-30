import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Send, UserPlus } from "lucide-react";

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
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/constants/support-ticket.constants";
import { cn } from "@/lib/utils";
import {
  useSupportTicketActions,
  useSupportTicketLoading,
} from "@/store/support/support-ticket.store";
import type { SupportTicketDetailDTO } from "@/types/support-ticket.types";

import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketStatusBadge } from "./ticket-status-badge";

interface TicketDetailPaneProps {
  ticket: SupportTicketDetailDTO | null;
  currentUserId: string | null;
  currentUserName: string;
}

export function TicketDetailPane({
  ticket,
  currentUserId,
  currentUserName,
}: TicketDetailPaneProps) {
  const { t } = useTranslation();
  const loading = useSupportTicketLoading();
  const { reply, updateStatus, assign, updatePriority } = useSupportTicketActions();

  const [body, setBody] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    setBody("");
    setResolutionNote("");
    setActivityOpen(false);
  }, [ticket?.id]);

  if (loading.detail && !ticket) {
    return (
      <Card className="space-y-3 p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card className="flex min-h-[280px] items-center justify-center px-4 py-12">
        <p className="text-sm text-muted-foreground">{t("supportTickets.noSelection")}</p>
      </Card>
    );
  }

  const isClosed = ticket.status === "CLOSED";

  const onReply = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const ok = await reply(ticket.id, trimmed);
    if (ok) setBody("");
  };

  const onStatusChange = (status: SupportTicketStatus) => {
    const note =
      status === "RESOLVED" && resolutionNote.trim()
        ? resolutionNote.trim()
        : undefined;
    void updateStatus(ticket.id, status, note);
  };

  const onAssignToMe = () => {
    if (!currentUserId) return;
    void assign(ticket.id, currentUserId, currentUserName);
  };

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4 border-b px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</span>
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>

        <h2 className="text-lg font-semibold leading-snug">{ticket.subject}</h2>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">{t("supportTickets.school")}</dt>
            <dd className="mt-0.5 font-medium">{ticket.schoolName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("supportTickets.category")}</dt>
            <dd className="mt-0.5">{t(`enums.ticketCategory.${ticket.category}`)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("supportTickets.submittedBy")}</dt>
            <dd className="mt-0.5">{ticket.submittedByName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("supportTickets.plan")}</dt>
            <dd className="mt-0.5">{ticket.subscriptionPlanName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("supportTickets.assignee")}</dt>
            <dd className="mt-0.5">{ticket.assignedToName || "—"}</dd>
          </div>
        </dl>

        {ticket.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {ticket.description}
          </p>
        ) : null}

        {ticket.resolutionNote ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {t("supportTickets.resolutionNote")}
            </p>
            <p className="mt-1 text-sm">{ticket.resolutionNote}</p>
          </div>
        ) : null}

        <PermissionGuard permissions="platform.support.manage">
          <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[140px] flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("supportTickets.status")}
                </label>
                <Select
                  value={ticket.status}
                  onValueChange={(value) => onStatusChange(value as SupportTicketStatus)}
                  disabled={loading.save}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_TICKET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`enums.ticketStatus.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[140px] flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("supportTickets.priority")}
                </label>
                <Select
                  value={ticket.priority}
                  onValueChange={(value) =>
                    void updatePriority(ticket.id, value as SupportTicketPriority)
                  }
                  disabled={loading.save}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_TICKET_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {t(`enums.ticketPriority.${priority}`)}
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
                disabled={loading.save || !currentUserId}
                onClick={onAssignToMe}
              >
                <UserPlus className="size-4" />
                {t("supportTickets.assignToMe")}
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("supportTickets.resolutionNote")}
              </label>
              <Textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={2}
                placeholder={t("supportTickets.resolutionNotePlaceholder")}
                className="resize-y text-start"
                disabled={loading.save}
              />
            </div>
          </div>
        </PermissionGuard>
      </div>

      <div className="space-y-3 px-5 py-5">
        {(ticket.messages ?? []).map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "rounded-md px-3 py-2.5 text-start",
              msg.systemMessage
                ? "border border-dashed bg-muted/30 text-sm text-muted-foreground"
                : msg.platformReply
                  ? "border border-primary/15 border-s-2 border-s-primary bg-primary/5"
                  : "border bg-muted/40",
            )}
          >
            {!msg.systemMessage ? (
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{msg.senderName}</span>
                <DateDisplay
                  date={msg.createdAt}
                  showIcon={false}
                  showTime
                  valueClassName="text-xs text-muted-foreground"
                />
              </div>
            ) : null}
            <p
              className={cn(
                "whitespace-pre-wrap text-sm leading-relaxed",
                msg.systemMessage && "text-center",
              )}
            >
              {msg.body}
            </p>
          </div>
        ))}
      </div>

      <PermissionGuard permissions="platform.support.manage">
        <div className="border-t px-5 py-4">
          <div className="flex flex-col gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={t("supportTickets.replyPlaceholder")}
              className="min-h-[88px] resize-y text-start"
              disabled={isClosed || loading.save}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={isClosed || loading.save || !body.trim()}
                onClick={() => void onReply()}
              >
                <Send className="size-4" />
                {t("supportTickets.sendReply")}
              </Button>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {(ticket.activityLog?.length ?? 0) > 0 ? (
        <div className="border-t px-5 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-sm font-medium"
            onClick={() => setActivityOpen((open) => !open)}
          >
            {t("supportTickets.activity")}
            <ChevronDown
              className={cn("size-4 text-muted-foreground transition-transform", activityOpen && "rotate-180")}
            />
          </button>
          {activityOpen ? (
            <ol className="mt-3 space-y-2 border-s border-border ps-3">
              {ticket.activityLog.map((entry, index) => (
                <li key={`${entry.createdAt}-${index}`} className="space-y-0.5 text-sm">
                  <p>
                    {t(`enums.ticketActivity.${entry.activityType}`)}
                    {entry.actorName ? ` · ${entry.actorName}` : ""}
                  </p>
                  {(entry.oldValue || entry.newValue) && (
                    <p className="text-xs text-muted-foreground">
                      {[entry.oldValue, entry.newValue].filter(Boolean).join(" → ")}
                    </p>
                  )}
                  {entry.note ? (
                    <p className="text-xs text-muted-foreground">{entry.note}</p>
                  ) : null}
                  <DateDisplay
                    date={entry.createdAt}
                    showIcon={false}
                    showTime
                    valueClassName="text-xs text-muted-foreground"
                  />
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

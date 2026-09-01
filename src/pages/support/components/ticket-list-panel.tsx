import { useTranslation } from "react-i18next";
import { Inbox, MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { DateDisplay } from "@/components/date-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SupportTicketListDTO } from "@/types/support-ticket.types";

import { TicketPriorityBadge } from "./ticket-priority-badge";
import { TicketStatusBadge } from "./ticket-status-badge";

interface TicketListPanelProps {
  tickets: SupportTicketListDTO[];
  selectedId: string | null;
  loading: boolean;
  page: number;
  totalPages: number;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function TicketListPanel({
  tickets,
  selectedId,
  loading,
  page,
  totalPages,
  onSelect,
  onPageChange,
}: TicketListPanelProps) {
  const { t } = useTranslation();

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox />}
        message={t("supportTickets.empty")}
        className="rounded-lg border bg-card"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex max-h-[calc(100vh-22rem)] flex-col gap-2 overflow-y-auto pe-1">
        {tickets.map((ticket) => {
          const selected = ticket.id === selectedId;
          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
              className={cn(
                "w-full rounded-lg border bg-card p-3 text-start transition-colors",
                "hover:bg-muted/40",
                selected ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {ticket.ticketNumber}
                </span>
                <TicketStatusBadge status={ticket.status} />
              </div>

              <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
                {ticket.subject}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">{ticket.schoolName}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TicketPriorityBadge priority={ticket.priority} />
                {ticket.assignedToName ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {ticket.assignedToName}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-muted-foreground">
                <DateDisplay
                  date={ticket.lastReplyAt ?? ticket.createdAt}
                  showIcon={false}
                  showTime
                  valueClassName="text-xs text-muted-foreground"
                />
                <span className="inline-flex items-center gap-1 text-xs">
                  <MessageSquare className="size-3.5" />
                  <span className="tabular-nums">{ticket.messageCount}</span>
                </span>
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

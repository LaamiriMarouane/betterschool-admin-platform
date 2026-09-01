import { useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, LifeBuoy, X } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { DateDisplay } from "@/components/date-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSchoolDetailTabsStore,
  useSchoolDetailTabsActions,
} from "@/store/schools/school-detail.store";

import { TicketPriorityBadge } from "@/pages/support/components/ticket-priority-badge";
import { TicketStatusBadge } from "@/pages/support/components/ticket-status-badge";

import { DetailAlert, DetailCard } from "./detail-ui";

export function SchoolSupportTab({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const tickets = useSchoolDetailTabsStore((s) => s.supportTickets);
  const loading = useSchoolDetailTabsStore((s) => s.loading.support);
  const error = useSchoolDetailTabsStore((s) => s.errors.support);
  const { fetchSupport } = useSchoolDetailTabsActions();

  useEffect(() => {
    void fetchSupport(schoolId);
  }, [schoolId, fetchSupport]);

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DetailAlert variant="danger" icon={<X className="size-4" />}>
        {error.message}
      </DetailAlert>
    );
  }

  return (
    <DetailCard title={t("schoolDetail.support.title")} icon={<LifeBuoy className="h-3.5 w-3.5" />}>
      {tickets.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<LifeBuoy />}
          message={t("schoolDetail.support.empty")}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/support-tickets?schoolId=${schoolId}`}>
                {t("schoolDetail.support.viewAll")}
                <ArrowUpRight className="ms-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/support-tickets?schoolId=${schoolId}&selected=${ticket.id}`}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{ticket.ticketNumber}</span>
                    <TicketStatusBadge status={ticket.status} />
                    <TicketPriorityBadge priority={ticket.priority} />
                  </div>
                  <div className="mt-1 truncate font-medium">{ticket.subject}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <DateDisplay date={ticket.createdAt} showTime />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </DetailCard>
  );
}

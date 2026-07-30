import { useTranslation } from "react-i18next";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { SupportTicketStatus } from "@/constants/support-ticket.constants";

const VARIANT: Record<SupportTicketStatus, BadgeProps["variant"]> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  WAITING_ON_CUSTOMER: "neutral",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export function TicketStatusBadge({ status }: { status: SupportTicketStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status]}>{t(`enums.ticketStatus.${status}`)}</Badge>
  );
}

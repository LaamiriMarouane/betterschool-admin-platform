import { useTranslation } from "react-i18next";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { SupportTicketPriority } from "@/constants/support-ticket.constants";

const VARIANT: Record<SupportTicketPriority, BadgeProps["variant"]> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
};

export function TicketPriorityBadge({ priority }: { priority: SupportTicketPriority }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[priority]}>{t(`enums.ticketPriority.${priority}`)}</Badge>
  );
}

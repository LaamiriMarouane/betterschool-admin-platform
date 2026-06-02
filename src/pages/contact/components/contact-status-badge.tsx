import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { ContactMessageStatus } from "@/constants/contact.constants";

const VARIANT: Record<ContactMessageStatus, "info" | "neutral" | "success"> = {
  NEW: "info",
  READ: "neutral",
  REPLIED: "success",
  ARCHIVED: "neutral",
};

export function ContactStatusBadge({ status }: { status: ContactMessageStatus }) {
  const { t } = useTranslation();
  return <Badge variant={VARIANT[status]}>{t(`enums.contactStatus.${status}`)}</Badge>;
}

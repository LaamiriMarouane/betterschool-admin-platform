import { useTranslation } from "react-i18next";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type {
  EnrollmentLimitStatus,
  SchoolSubscriptionStatus,
} from "@/types/subscription.types";

const STATUS_VARIANT: Record<SchoolSubscriptionStatus, BadgeProps["variant"]> = {
  ACTIVE: "success",
  TRIALING: "info",
  EXPIRED: "danger",
  PAST_DUE: "danger",
  PAUSED: "warning",
  CANCELLED: "neutral",
};

export function SubscriptionStatusBadge({
  status,
}: {
  status: SchoolSubscriptionStatus | null;
}) {
  const { t } = useTranslation();
  if (!status) {
    return <Badge variant="neutral">{t("schools.noSubscription")}</Badge>;
  }
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {t(`enums.subscriptionStatus.${status}`)}
    </Badge>
  );
}

const ENROLLMENT_VARIANT: Record<EnrollmentLimitStatus, BadgeProps["variant"]> = {
  OK: "success",
  WARNING: "warning",
  EXCEEDED: "danger",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentLimitStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={ENROLLMENT_VARIANT[status]}>
      {t(`enums.enrollmentStatus.${status}`)}
    </Badge>
  );
}

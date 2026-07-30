import { useTranslation } from "react-i18next";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { FeatureRequestStatus } from "@/constants/feature-request.constants";

const VARIANT: Record<FeatureRequestStatus, BadgeProps["variant"]> = {
  NEW: "info",
  UNDER_REVIEW: "warning",
  PLANNED: "neutral",
  IN_PROGRESS: "warning",
  RELEASED: "success",
  DECLINED: "neutral",
};

export function FeatureStatusBadge({ status }: { status: FeatureRequestStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status]}>{t(`enums.featureStatus.${status}`)}</Badge>
  );
}

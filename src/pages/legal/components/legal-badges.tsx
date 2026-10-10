import { useTranslation } from "react-i18next";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { LegalChangeKind, LegalVersionState } from "@/types/legal.types";

const STATE_VARIANT: Record<LegalVersionState, BadgeProps["variant"]> = {
  DRAFT: "neutral",
  UPCOMING: "info",
  CURRENT: "success",
  SUPERSEDED: "outline",
  WITHDRAWN: "danger",
};

export function LegalStateBadge({ state }: { state: LegalVersionState }) {
  const { t } = useTranslation();
  return <Badge variant={STATE_VARIANT[state]}>{t(`legal.state.${state}`)}</Badge>;
}

export function LegalKindBadge({ kind }: { kind: LegalChangeKind | null }) {
  const { t } = useTranslation();
  if (!kind) return null;
  return <Badge variant={kind === "MATERIAL" ? "warning" : "secondary"}>{t(`legal.kind.${kind}`)}</Badge>;
}

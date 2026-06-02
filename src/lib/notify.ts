import i18n from "i18next";

import { toast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/api-error";

/**
 * Optional helper to surface an error as a destructive toast for ad-hoc cases.
 * Domain stores keep errors in their `errors` slice instead; global 401/403/429
 * are handled by the HTTP client. Uses the resolver so the message is the
 * localized backend message (not the raw status text).
 */
export function notifyApiError(err: unknown): void {
  const { message } = getErrorMessage(err);
  toast({ variant: "destructive", title: i18n.t("common.error"), description: message });
}

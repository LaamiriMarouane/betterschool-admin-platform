import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/use-toast";

/**
 * Single source of truth for copy-to-clipboard with toast feedback (mirrors the main
 * frontend's `useCopy`). Use this everywhere instead of hand-rolling
 * `navigator.clipboard.writeText` — keeps the success/failure UX consistent.
 *
 * @returns `copy(text)` — copies trimmed text, toasts success/failure, resolves the result.
 */
export function useCopy() {
  const { t } = useTranslation();

  const copy = useCallback(
    async (text: string | null | undefined): Promise<boolean> => {
      const value = text?.trim();
      if (!value) return false;
      try {
        await navigator.clipboard.writeText(value);
        toast({ title: t("common.copied") });
        return true;
      } catch {
        toast({ variant: "destructive", title: t("common.copyFailed") });
        return false;
      }
    },
    [t],
  );

  return { copy };
}

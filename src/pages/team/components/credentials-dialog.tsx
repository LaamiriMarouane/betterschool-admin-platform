import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Copy, KeyRound, Mail } from "lucide-react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import type { PlatformUserCredentialsDTO } from "@/types/platform-user.types";

/**
 * One-time reveal of a staffer's generated credentials (after create or admin reset).
 * The temp password is shown only here — it's also emailed and never re-fetchable.
 */
export function CredentialsDialog({
  open,
  onOpenChange,
  credentials,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: PlatformUserCredentialsDTO | null;
  mode: "create" | "reset";
}) {
  const { t } = useTranslation();

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? t("team.credentials.createdTitle") : t("team.credentials.resetTitle")}
      description={t("team.credentials.desc")}
      footer={
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>{t("common.close")}</Button>
        </div>
      }
    >
      <div className="space-y-3 px-4 pb-2 sm:w-[26rem] sm:px-0">
        <CopyField
          icon={<Mail className="size-4 text-muted-foreground" />}
          label={t("team.credentials.username")}
          value={credentials?.user.email ?? ""}
        />
        <CopyField
          icon={<KeyRound className="size-4 text-muted-foreground" />}
          label={t("team.credentials.password")}
          value={credentials?.temporaryPassword ?? ""}
          mono
        />
        <p className="text-xs text-muted-foreground">{t("team.credentials.note")}</p>
      </div>
    </ResponsiveDialog>
  );
}

function CopyField({
  icon,
  label,
  value,
  mono,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  const { t } = useTranslation();
  const { copy } = useCopy();

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        {icon}
        <span className={cn("flex-1 truncate text-sm", mono && "font-mono")}>{value}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          title={t("common.copy")}
          onClick={() => void copy(value)}
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLegalActions, useLegalLoading } from "@/store/legal/legal.store";
import type { LegalVersionDetailDTO } from "@/types/legal.types";

interface LegalWithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: LegalVersionDetailDTO;
}

/** Pull back a scheduled version before it takes effect. Its label is never reused. */
export function LegalWithdrawDialog({ open, onOpenChange, version }: LegalWithdrawDialogProps) {
  const { t } = useTranslation();
  const loading = useLegalLoading();
  const { withdraw } = useLegalActions();
  const [reason, setReason] = useState("");

  const submit = async () => {
    const result = await withdraw(version.id, reason.trim());
    if (result) onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("legal.withdraw.title", { label: version.label })}
      description={t("legal.withdraw.description")}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!reason.trim() || loading.publish}>
            {t("legal.withdraw.confirm")}
          </Button>
        </div>
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="withdraw-reason">{t("legal.withdraw.reason")}</Label>
        <Textarea id="withdraw-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
      </div>
    </ResponsiveDialog>
  );
}

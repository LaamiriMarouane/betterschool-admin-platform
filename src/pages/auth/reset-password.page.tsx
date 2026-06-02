import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isStrongPassword } from "@/lib/password-validation";
import { useAccountActions, useAccountLoading } from "@/store/account/account.store";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { resetPassword } = useAccountActions();
  const loading = useAccountLoading();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const canSubmit = useMemo(
    () => isStrongPassword(newPassword) && newPassword === confirm,
    [newPassword, confirm],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await resetPassword(token, newPassword, confirm);
    if (ok) navigate("/login", { replace: true });
  };

  if (!token) {
    return (
      <AuthShell>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">{t("account.reset.invalidTitle")}</CardTitle>
          <CardDescription>{t("account.reset.invalidDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("account.reset.requestNew")}
          </Link>
        </CardContent>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{t("account.reset.title")}</CardTitle>
        <CardDescription>{t("account.reset.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" required>
              {t("account.newPassword")}
            </Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              autoFocus
              required
              showStrength
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" required>
              {t("account.confirmPassword")}
            </Label>
            <PasswordInput
              id="confirm-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
            {mismatch && <p className="text-xs text-destructive">{t("account.mismatch")}</p>}
          </div>
          <Button type="submit" className="w-full" loading={loading.reset} disabled={!canSubmit}>
            {t("account.reset.submit")}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("account.backToLogin")}
          </Link>
        </form>
      </CardContent>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">{children}</Card>
    </div>
  );
}

export default ResetPasswordPage;

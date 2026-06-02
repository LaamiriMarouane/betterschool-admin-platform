import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

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
import { UserAvatar } from "@/components/user-avatar";
import { isStrongPassword } from "@/lib/password-validation";
import { useAccountActions, useAccountLoading } from "@/store/account/account.store";
import { useAuthStore } from "@/store/auth/auth.store";

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { changePassword } = useAccountActions();
  const loading = useAccountLoading();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || user?.username || "";

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const canSubmit = useMemo(
    () => oldPassword.length > 0 && isStrongPassword(newPassword) && newPassword === confirm,
    [oldPassword, newPassword, confirm],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await changePassword(oldPassword, newPassword, confirm);
    if (ok) {
      // Changing your own password invalidates this session — sign out and re-login.
      await logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{t("account.profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("account.profile.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <UserAvatar
            firstName={user?.firstName || user?.username || "?"}
            lastName={user?.lastName ?? ""}
            colorKey={user?.id ?? user?.username}
            profileImage={user?.profileImage}
            size="lg"
          />
          <div className="min-w-0">
            <div className="truncate font-medium">{displayName}</div>
            {user?.email ? (
              <div className="truncate text-sm text-muted-foreground">{user.email}</div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("account.change.title")}</CardTitle>
          <CardDescription>{t("account.change.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="old-password" required>
                {t("account.currentPassword")}
              </Label>
              <PasswordInput
                id="old-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" required>
                {t("account.newPassword")}
              </Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
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
            <div className="flex justify-end">
              <Button type="submit" loading={loading.change} disabled={!canSubmit}>
                {t("account.change.submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;

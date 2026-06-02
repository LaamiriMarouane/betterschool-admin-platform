import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FLOOR_PERMISSIONS, PRESET_PERMISSIONS } from "@/constants/permissions.constants";
import {
  useTeamActions,
  useTeamLoading,
  useTeamPermissionCatalog,
} from "@/store/team/team.store";
import type {
  PlatformUserCredentialsDTO,
  PlatformUserDTO,
} from "@/types/platform-user.types";

import { PermissionPicker } from "./permission-picker";

type Mode = "create" | "edit";

/** Create a new platform staff member, or edit an existing one's permissions. */
export function StaffDialog({
  open,
  onOpenChange,
  mode,
  user,
  onCredentials,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  user?: PlatformUserDTO | null;
  /** Called with the one-time credentials after a successful create, to reveal them. */
  onCredentials?: (credentials: PlatformUserCredentialsDTO) => void;
}) {
  const { t } = useTranslation();
  const { createUser, updatePermissions } = useTeamActions();
  const loading = useTeamLoading();
  const catalog = useTeamPermissionCatalog();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [permissionKeys, setPermissionKeys] = useState<string[]>([...PRESET_PERMISSIONS.SUPPORT]);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && user) {
      setPermissionKeys([...new Set([...user.permissionKeys, ...FLOOR_PERMISSIONS])]);
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPermissionKeys([...PRESET_PERMISSIONS.SUPPORT]);
    }
  }, [open, mode, user]);

  const canSubmit =
    mode === "edit"
      ? true
      : Boolean(firstName.trim() && lastName.trim() && email.trim());

  const grantedCount = useMemo(
    () => permissionKeys.filter((key) => catalog.includes(key)).length,
    [permissionKeys, catalog],
  );

  const submit = async () => {
    if (mode === "create") {
      const credentials = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        permissionKeys,
      });
      if (credentials) {
        onCredentials?.(credentials);
        onOpenChange(false);
      }
    } else if (user) {
      const ok = await updatePermissions(user.id, permissionKeys);
      if (ok) onOpenChange(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? t("team.addStaff") : t("team.editPermissions")}
      description={
        mode === "create"
          ? t("team.addStaffDesc")
          : user?.fullName || user?.email || undefined
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          {catalog.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{grantedCount}</span>{" "}
              {t("permissions.grantedCount", { total: catalog.length })}
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading.save}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit || loading.save}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              <Check className="size-4" />
              {mode === "create" ? t("team.create") : t("team.saveChanges")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-2 sm:w-[34rem] sm:px-0">
        {mode === "create" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff-first" required>
                  {t("team.firstName")}
                </Label>
                <Input
                  id="staff-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-last" required>
                  {t("team.lastName")}
                </Label>
                <Input
                  id="staff-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email" required>
                {t("team.email")}
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("team.emailHint")}</p>
            </div>
          </>
        )}
        <PermissionPicker
          value={permissionKeys}
          onChange={setPermissionKeys}
          catalog={catalog}
          disabled={loading.save}
        />
      </div>
    </ResponsiveDialog>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
import type { PlatformUserDTO } from "@/types/platform-user.types";

import { PermissionPicker } from "./permission-picker";

type Mode = "create" | "edit";

/** Create a new platform staff member, or edit an existing one's permissions. */
export function StaffDialog({
  open,
  onOpenChange,
  mode,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  user?: PlatformUserDTO | null;
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

  const submit = async () => {
    let ok = false;
    if (mode === "create") {
      ok = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        permissionKeys,
      });
    } else if (user) {
      ok = await updatePermissions(user.id, permissionKeys);
    }
    if (ok) onOpenChange(false);
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading.save}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!canSubmit || loading.save}>
            {mode === "create" ? t("team.create") : t("common.save")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-2 sm:w-[30rem] sm:px-0">
        {mode === "create" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff-first">{t("team.firstName")}</Label>
                <Input
                  id="staff-first"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-last">{t("team.lastName")}</Label>
                <Input
                  id="staff-last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">{t("team.email")}</Label>
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

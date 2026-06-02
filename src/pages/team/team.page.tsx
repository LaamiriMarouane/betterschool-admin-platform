import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Power, Settings2, Trash2, Users } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchPreset } from "@/constants/permissions.constants";
import { useAuthStore } from "@/store/auth/auth.store";
import { useTeamActions, useTeamLoading, useTeamUsers } from "@/store/team/team.store";
import type { PlatformUserDTO } from "@/types/platform-user.types";

import { StaffDialog } from "./components/staff-dialog";

export function TeamPage() {
  const { t } = useTranslation();
  const users = useTeamUsers();
  const loading = useTeamLoading();
  const { fetchUsers, fetchPermissionCatalog, setUserEnabled, deleteUser } = useTeamActions();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUserDTO | null>(null);
  const [deleting, setDeleting] = useState<PlatformUserDTO | null>(null);

  useEffect(() => {
    void fetchUsers();
    void fetchPermissionCatalog();
  }, [fetchUsers, fetchPermissionCatalog]);

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await deleteUser(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t("team.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("team.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="me-1.5 h-4 w-4" />
          {t("team.addStaff")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading.list && users.length === 0 ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("team.empty")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("team.member")}</TableHead>
                  <TableHead>{t("team.access")}</TableHead>
                  <TableHead>{t("team.createdAt")}</TableHead>
                  <TableHead className="text-end">{t("team.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const preset = matchPreset(user.permissionKeys);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.fullName ?? "—"}</span>
                          {!user.enabled && <Badge variant="neutral">{t("team.disabled")}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={preset === "SUPER_ADMIN" ? "info" : "neutral"}>
                            {preset === "CUSTOM"
                              ? t("permissions.custom")
                              : t(`permissions.presets.${preset}`)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {t("team.permissionCount", { count: user.permissionKeys.length })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DateDisplay date={user.createdAt} showIcon={false} />
                      </TableCell>
                      <TableCell className="text-end">
                        {user.id === currentUserId ? (
                          <span className="text-xs text-muted-foreground">{t("team.you")}</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("team.editPermissions")}
                              disabled={loading.save}
                              onClick={() => setEditing(user)}
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={user.enabled ? t("team.disable") : t("team.enable")}
                              disabled={loading.save}
                              onClick={() => void setUserEnabled(user.id, !user.enabled)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("team.delete")}
                              className="text-destructive hover:text-destructive"
                              disabled={loading.save}
                              onClick={() => setDeleting(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StaffDialog open={createOpen} onOpenChange={setCreateOpen} mode="create" />
      <StaffDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        mode="edit"
        user={editing}
      />

      <ConfirmAlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={t("team.deleteTitle")}
        description={
          <>
            <span className="font-medium text-foreground">
              {deleting?.fullName || deleting?.email}
            </span>
            {" — "}
            {t("team.deleteDesc")}
          </>
        }
        actions={
          <>
            <AlertDialogCancel disabled={loading.save}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              disabled={loading.save}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {t("team.delete")}
            </AlertDialogAction>
          </>
        }
      />
    </div>
  );
}

export default TeamPage;

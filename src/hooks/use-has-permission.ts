import { useAuthStore } from "@/store/auth/auth.store";

/**
 * Returns a checker for the current user's effective permission keys.
 * Use for conditional logic (disabling actions); pair with `<PermissionGuard>`
 * for show/hide. Backend `@RequiresPermission` is always the real gate.
 *
 * @example
 * const can = useHasPermission();
 * const editable = can("platform.schools.manage");
 */
export function useHasPermission() {
  const userPermissions = useAuthStore((s) => s.permissions);

  return (permissions: string[] | string, requireAll = false): boolean => {
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    if (perms.length === 0) return true;
    return requireAll
      ? perms.every((p) => userPermissions.includes(p))
      : perms.some((p) => userPermissions.includes(p));
  };
}

import { type ReactNode } from "react";

import { useHasPermission } from "@/hooks/use-has-permission";

interface PermissionGuardProps {
  /** Permission key(s) to check against the user's effective permissions. */
  permissions: string[] | string;
  /** Require ALL listed permissions (true) or ANY (false, default). */
  requireAll?: boolean;
  /** Rendered when the user has the permission(s). */
  children: ReactNode;
  /** Rendered when the user lacks them (e.g. a disabled button). Defaults to null. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the user's permissions — for hiding
 * action buttons/links the user can't use. Cosmetic only; the server enforces.
 */
export function PermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = useHasPermission();
  return <>{hasPermission(permissions, requireAll) ? children : fallback}</>;
}

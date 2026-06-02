import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth/auth.store";

/**
 * Route-level permission gate (defense in depth — the backend `@RequiresPermission`
 * is the real gate). Waits until the effective permissions are loaded, then renders
 * the page if the user holds {@link permission}, otherwise redirects to the dashboard
 * (the floor route every staffer can reach).
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const permissions = useAuthStore((state) => state.permissions);
  const permissionsLoaded = useAuthStore((state) => state.permissionsLoaded);

  if (!permissionsLoaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!permissions.includes(permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default RequirePermission;

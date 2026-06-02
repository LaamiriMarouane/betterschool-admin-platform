import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthStore } from "@/store/auth/auth.store";

/**
 * Gates the protected app behind authentication. Unauthenticated users are sent
 * to /login (preserving where they were headed). On first mount with a valid
 * token it rehydrates permissions (lost on a hard refresh) so permission-gated
 * UI works again. The backend `@RequiresPermission` is the real gate; this is
 * defense in depth.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadPermissions = useAuthStore((s) => s.loadPermissions);
  const location = useLocation();
  const didLoad = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !didLoad.current) {
      didLoad.current = true;
      void loadPermissions();
    }
  }, [isAuthenticated, loadPermissions]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

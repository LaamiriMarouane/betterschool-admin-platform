import { useState } from "react";
import { Outlet } from "react-router";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";

const COLLAPSE_KEY = "platform_sidebar_collapsed";

/**
 * Protected app shell: collapsible fixed sidebar on desktop, a Sheet drawer on
 * mobile, with the topbar + routed content (`<Outlet />`). Wrap this in a
 * ProtectedRoute once login lands.
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
  );

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar — collapses to an icon rail */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-e bg-card transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <AppSidebar collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar (always expanded) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar
          onMenuClick={() => setMobileOpen(true)}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

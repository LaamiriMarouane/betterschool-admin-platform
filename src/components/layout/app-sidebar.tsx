import { useEffect } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  School,
  CreditCard,
  Receipt,
  Users,
  Inbox,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useContactActions, useContactUnreadCount } from "@/store/contact/contact.store";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  /** Permission required to see this item (wired once login/ProtectedRoute lands). */
  permission?: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, permission: "platform.stats.read", end: true },
  { to: "/schools", labelKey: "nav.schools", icon: School, permission: "platform.schools.read" },
  { to: "/plans", labelKey: "nav.plans", icon: CreditCard, permission: "platform.billing.read" },
  { to: "/subscriptions", labelKey: "nav.subscriptions", icon: Receipt, permission: "platform.billing.read" },
  { to: "/team", labelKey: "nav.team", icon: Users, permission: "platform.users.read" },
  { to: "/contact-messages", labelKey: "nav.contact", icon: Inbox, permission: "platform.contact.read" },
];

interface AppSidebarProps {
  /** Icon-only rail (desktop). Mobile drawer always renders expanded. */
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Fixed-width (w-64) content clipped by the parent `<aside>`'s `overflow-hidden`.
 * The icon keeps a constant left position (no jump); each item's width animates
 * to `w-10` when collapsed so the active highlight becomes an icon-sized square,
 * and labels fade out — all in sync with the rail's width transition.
 */
export function AppSidebar({ collapsed = false, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();
  const unreadCount = useContactUnreadCount();
  const { fetchUnreadCount } = useContactActions();

  useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <div className="flex h-full w-64 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          BS
        </div>
        <span
          className={cn(
            "whitespace-nowrap text-sm font-semibold transition-opacity duration-200",
            collapsed && "opacity-0",
          )}
        >
          {t("common.platform")}
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {/* TODO: gate each item with useHasPermission(item.permission) once login is wired. */}
        {NAV_ITEMS.map((item) => {
          const label = t(item.labelKey);
          const badge =
            item.to === "/contact-messages" && unreadCount > 0 ? unreadCount : null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  collapsed ? "w-10" : "w-full",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  collapsed && "opacity-0",
                )}
              >
                {label}
              </span>
              {badge !== null && !collapsed && (
                <span className="ms-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

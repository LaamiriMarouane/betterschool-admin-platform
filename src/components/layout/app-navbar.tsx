import { LogOut, Menu, PanelLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme/theme-toggle.component";
import { LanguageSelect } from "@/components/language-select.component";
import { UserAvatar } from "@/components/user-avatar";
import { useAuthStore } from "@/store/auth/auth.store";

interface AppNavbarProps {
  /** Opens the mobile sidebar drawer. */
  onMenuClick: () => void;
  /** Collapses/expands the desktop sidebar. */
  onToggleSidebar: () => void;
}

export function AppNavbar({ onMenuClick, onToggleSidebar }: AppNavbarProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || user?.username || t("common.guest");

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3 md:px-4">
      {/* Mobile: open drawer */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label={t("nav.openNavigation")}
        icon={<Menu />}
      />
      {/* Desktop: collapse/expand the sidebar rail */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={onToggleSidebar}
        aria-label={t("nav.toggleSidebar")}
        icon={<PanelLeft />}
      />
      <div className="flex-1" />
      <LanguageSelect />
      <ThemeToggle />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={t("nav.accountMenu")}
          >
            <UserAvatar
              firstName={user?.firstName || user?.username || "?"}
              lastName={user?.lastName ?? ""}
              colorKey={user?.id ?? user?.username}
              profileImage={user?.profileImage}
              size="sm"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2">
          <div className="px-2 py-1.5">
            <div className="truncate text-sm font-medium">{displayName}</div>
            {user?.email && (
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            )}
          </div>
          <div className="my-1 h-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => void logout()}
            icon={<LogOut />}
          >
            {t("common.logout")}
          </Button>
        </PopoverContent>
      </Popover>
    </header>
  );
}

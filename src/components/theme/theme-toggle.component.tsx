import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme.provider";

/**
 * Quick light/dark flip. Always sets an explicit theme based on what's currently
 * shown (so it overrides "system"). The "System" option lives in profile settings.
 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

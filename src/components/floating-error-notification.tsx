import { useEffect } from "react";
import {
  AlertCircle,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationVariant = "error" | "warning" | "success" | "info";

export interface FloatingErrorNotificationProps {
  /** The message to display. When null, nothing renders. */
  message: string | null;
  /** Optional title. Defaults per variant. */
  title?: string | null;
  /** Notification variant. Defaults to "error". */
  variant?: NotificationVariant;
  /** Called when dismissed (manual or auto). */
  onDismiss: () => void;
  /** Auto-hide delay (ms). 0 disables auto-hide. Defaults to 5000. */
  autoHideDuration?: number;
  className?: string;
}

/**
 * Floating top-center notification for errors / warnings / success / info.
 * Auto-hides after a duration or on manual dismiss. Driven by props (pair it
 * with a store's `error` slice + a clear action).
 */
export const FloatingErrorNotification = ({
  message,
  title,
  variant = "error",
  onDismiss,
  autoHideDuration = 5000,
  className,
}: FloatingErrorNotificationProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!message || autoHideDuration === 0) return;
    const timer = setTimeout(() => onDismiss(), autoHideDuration);
    return () => clearTimeout(timer);
  }, [message, autoHideDuration, onDismiss]);

  if (!message) return null;

  const variantConfig = {
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-900 dark:text-red-200",
      messageColor: "text-red-800 dark:text-red-300",
      buttonHover:
        "hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30",
      defaultTitle: t("common.error"),
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-500",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-200",
      messageColor: "text-yellow-800 dark:text-yellow-300",
      buttonHover:
        "hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
      defaultTitle: t("common.warning"),
    },
    success: {
      icon: CheckCircle2,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-200",
      messageColor: "text-green-800 dark:text-green-300",
      buttonHover:
        "hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30",
      defaultTitle: t("common.success"),
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-200",
      messageColor: "text-blue-800 dark:text-blue-300",
      buttonHover:
        "hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30",
      defaultTitle: t("common.info"),
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in-0",
        "max-w-md w-full mx-4",
        className,
      )}
    >
      <div
        className={cn(
          "border-2 rounded-lg shadow-lg p-4 flex items-start gap-3",
          config.bgColor,
          config.borderColor,
        )}
      >
        <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          {displayTitle && (
            <h4 className={cn("font-semibold text-sm mb-1", config.titleColor)}>
              {displayTitle}
            </h4>
          )}
          <p className={cn("text-sm", config.messageColor)}>{message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 shrink-0", config.iconColor, config.buttonHover)}
          onClick={onDismiss}
          aria-label={t("common.dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Date Display Component
 * Shows a formatted date with validation and a fallback for empty/invalid values.
 */

import { Calendar, Clock } from "lucide-react";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date?: string | Date | null;
  className?: string;
  /** Classes for the formatted date text (defaults to text-xs text-muted-foreground). */
  valueClassName?: string;
  showIcon?: boolean;
  showTime?: boolean;
  emptyText?: string;
  iconClassName?: string;
}

export function DateDisplay({
  date,
  className = "",
  valueClassName,
  showIcon = true,
  showTime = false,
  emptyText,
  iconClassName = "",
}: DateDisplayProps) {
  const { t } = useTranslation();

  if (!date) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-muted-foreground text-xs">{emptyText || "-"}</span>
      </div>
    );
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (!isValid(dateObj)) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-muted-foreground text-xs">
          {t("dateDisplay.invalid")}
        </span>
      </div>
    );
  }

  // "PP" → Jun 2, 2026 · "PP p" → Jun 2, 2026 3:30 PM
  const formatted = format(dateObj, showTime ? "PP p" : "PP");
  const finalIconClassName = iconClassName || "w-3.5 h-3.5 text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && showTime && <Clock className={finalIconClassName} />}
      {showIcon && !showTime && <Calendar className={finalIconClassName} />}
      <span
        className={cn(
          valueClassName == null && "text-xs text-muted-foreground",
          valueClassName,
        )}
      >
        {formatted}
      </span>
    </div>
  );
}

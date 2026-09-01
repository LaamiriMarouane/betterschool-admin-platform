import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon node — pass `<Inbox className="size-5" />` or similar. */
  icon?: ReactNode;
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
  /** `sm` fits inside cards/panels; `md` is the default standalone block. */
  size?: "sm" | "md";
}

/**
 * Shared empty placeholder for lists, tabs, and panels across the platform console.
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "min-h-[220px] py-14 px-6",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "mb-3 grid place-items-center rounded-full bg-muted text-muted-foreground",
            compact ? "size-10 [&>svg]:size-4" : "size-12 [&>svg]:size-5",
          )}
        >
          {icon}
        </div>
      ) : null}
      {title ? (
        <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>{title}</p>
      ) : null}
      <p
        className={cn(
          "max-w-sm text-muted-foreground",
          compact ? "text-sm" : "text-sm",
          title && "mt-1",
        )}
      >
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;

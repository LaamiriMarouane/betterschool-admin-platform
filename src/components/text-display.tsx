import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/use-copy";

const textDisplayShellVariants = cva("relative flex items-center group gap-2", {
  variants: {
    truncate: {
      true: "min-w-0 flex-1 truncate",
      false: "",
    },
  },
  defaultVariants: {
    truncate: false,
  },
});

const textDisplayValueVariants = cva("", {
  variants: {
    variant: {
      default: "text-[13px] text-foreground",
      primary: "text-[13px] font-medium text-foreground",
      subtle: "text-xs text-muted-foreground",
      link: "text-[13px] font-medium text-primary underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TextDisplayProps
  extends VariantProps<typeof textDisplayValueVariants> {
  /** Clip overflowing text (ellipsis). */
  truncate?: boolean;
  /** Primary text value. */
  value?: string | null;
  /** Secondary muted text below the primary value. */
  subValue?: string | null;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Fallback when value is null/empty. Defaults to "-". */
  emptyText?: string;
  /** Show a copy-to-clipboard button on hover. */
  copyable?: boolean;
  className?: string;
  innerClassName?: string;
}

export function TextDisplay({
  value,
  subValue,
  icon,
  emptyText = "-",
  copyable = false,
  variant,
  truncate,
  className,
  innerClassName,
}: TextDisplayProps) {
  const { copy } = useCopy();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    void copy(value);
  };

  const valueClassName = cn(
    textDisplayValueVariants({ variant }),
    truncate && "truncate min-w-0",
    innerClassName,
  );

  if (!value) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-muted-foreground text-xs">{emptyText}</span>
      </div>
    );
  }

  return (
    <div className={cn(textDisplayShellVariants({ truncate }), className)}>
      {icon && (
        <span className="shrink-0 flex items-center justify-center w-4 h-4 text-muted-foreground">
          {icon}
        </span>
      )}

      <div className={cn("flex flex-col", truncate && "min-w-0 flex-1")}>
        <span className={valueClassName}>{value}</span>
        {subValue && (
          <span className="text-[11px] text-muted-foreground truncate opacity-80">
            {subValue}
          </span>
        )}
      </div>

      {copyable && (
        <div className="absolute end-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ps-4 pe-1 py-1 flex items-center justify-end z-10 pointer-events-none group-hover:pointer-events-auto">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-5 w-5 shrink-0 rounded-md shadow-sm border bg-background/50 backdrop-blur-sm"
            onClick={handleCopy}
            aria-label="Copy"
          >
            <Copy className="h-2 w-2 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}

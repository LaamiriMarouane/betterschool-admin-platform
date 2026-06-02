import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Tinted status tags — mirror the product app's COLOR scale
        // (light: 50 bg / 600 text / 200 border · dark: 500/10 · 400 · 500/20).
        success:
          "border-green-200 bg-green-50 text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400",
        warning:
          "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
        info: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
        danger:
          "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
        neutral:
          "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

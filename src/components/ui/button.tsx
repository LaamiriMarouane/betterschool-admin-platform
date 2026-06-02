import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-transparent hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 rounded-md px-2.5",
        lg: "h-10 rounded-md px-5",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows the shared spinner and disables the button. One loading style app-wide. */
  loading?: boolean;
  /** Leading icon — pass a lucide icon directly. Replaced by the spinner while loading. */
  icon?: React.ReactNode;
  /** Trailing icon. Logical placement, so it flips correctly in RTL. */
  iconEnd?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      iconEnd,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // Radix Slot requires a single child, so icon/spinner injection is skipped
    // when `asChild` is used (the caller composes their own content).
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        {children}
        {iconEnd}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

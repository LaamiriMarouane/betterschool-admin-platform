import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Asterisk } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block w-full text-start",
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /** Appends a required indicator (icon). */
  required?: boolean;
  /** Appends "(Optional)" in muted text. */
  optional?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, optional, children, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    >
      {children}
      {required && (
        <Asterisk
          className="inline-block w-3 h-3 text-destructive ml-0.5 relative -top-1"
          aria-hidden
        />
      )}
      {optional && (
        <span className="text-muted-foreground font-normal ml-1">
          ({t("common.optional")})
        </span>
      )}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

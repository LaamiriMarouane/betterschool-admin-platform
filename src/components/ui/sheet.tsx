import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:pointer-events-none",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=closed]:pointer-events-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideCloseButton?: boolean;
  /** When provided, renders a sticky header with the title inline with the close button. Only the body scrolls. */
  title?: string;
  /** Optional description shown below the title in the sticky header. */
  description?: string;
  /** Optional footer rendered at the bottom of the sheet, outside the scrollable area. */
  footer?: React.ReactNode;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    { side = "right", className, children, hideCloseButton, title, description, footer, ...props },
    ref,
  ) => {
    const isRTL = useRTL();

    // When title is provided, use structured layout with sticky header + scrollable body
    if (title) {
      return (
        <SheetPortal>
          <SheetOverlay />
          <SheetPrimitive.Content
            ref={ref}
            className={cn(sheetVariants({ side }), "flex flex-col overflow-hidden !p-0 !gap-0", className)}
            {...props}
          >
            {/* Sticky header: title + close button inline */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-3 shrink-0 border-b">
              <div className="flex flex-col space-y-1.5 min-w-0">
                <SheetPrimitive.Title className="text-lg font-semibold leading-tight text-foreground text-start line-clamp-2">
                  {title}
                </SheetPrimitive.Title>
                {description && (
                  <SheetPrimitive.Description className="text-sm text-muted-foreground text-start">
                    {description}
                  </SheetPrimitive.Description>
                )}
              </div>
              <SheetPrimitive.Close
                className={cn(
                  "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0 mt-0.5",
                )}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 scrollbar-thumb-on-hover min-h-0">
              {children}
            </div>

            {/* Sticky footer */}
            {footer && (
              <div className="px-6 pb-6 pt-4 shrink-0 border-t">{footer}</div>
            )}
          </SheetPrimitive.Content>
        </SheetPortal>
      );
    }

    // Default: original layout (no structured header)
    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <SheetPrimitive.Close
              className={cn(
                "absolute  top-5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
                isRTL ? "left-4" : "right-4",
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  },
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Radix outside events use CustomEvent with detail.originalEvent — use that target for portaled popovers. */
function isOutsideEventOnDetachedLayer(e: {
  target?: EventTarget | null;
  detail?: { originalEvent?: { target?: EventTarget | null } };
}): boolean {
  const el =
    (e.detail?.originalEvent?.target ?? e.target) instanceof Element
      ? ((e.detail?.originalEvent?.target ?? e.target) as Element)
      : null;
  if (!el) return false;
  return Boolean(
    el.closest?.("[data-date-picker-popover]") ||
      el.closest?.("[data-search-popover]") ||
      el.closest?.("[data-radix-popper-content-wrapper]") ||
      el.closest?.("[data-radix-select-content]"),
  );
}

export type ResponsiveDialogProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Optional footer content rendered at the bottom of the dialog, outside the scrollable area. */
  footer?: React.ReactNode;
  /** When true, do not render header/title; only close control and children. */
  hideHeader?: boolean;
  /** When true, dialog is modal. When false, it's non-modal (interact with content behind). */
  modal?: boolean;
} & (
  | {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      isOpen?: never;
      setIsOpen?: never;
    }
  | {
      isOpen: boolean;
      setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
      open?: never;
      onOpenChange?: never;
    }
);

export function ResponsiveDialog({
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  isOpen: isOpenProp,
  setIsOpen: setIsOpenProp,
  title = "",
  description,
  footer,
  hideHeader = false,
  modal = true,
}: ResponsiveDialogProps) {
  const open = openProp ?? isOpenProp ?? false;
  const onOpenChange =
    onOpenChangeProp ??
    (setIsOpenProp ? (value: boolean) => setIsOpenProp(value) : () => {});

  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
        <DialogContent
          className="w-fit max-h-[90vh] flex flex-col overflow-hidden p-0 h-auto"
          hideCloseButton
          onPointerDownOutside={(e) => {
            if (isOutsideEventOnDetachedLayer(e)) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isOutsideEventOnDetachedLayer(e)) e.preventDefault();
          }}
          onFocusOutside={(e) => {
            if (isOutsideEventOnDetachedLayer(e)) e.preventDefault();
          }}
        >
          {/* Sticky header */}
          {!hideHeader && (
            <div
              className={cn(
                "flex justify-between gap-4 px-6 pt-3 pb-3 shrink-0 border-b border-border",
                description ? "items-start" : "items-center",
              )}
            >
              <div className="flex flex-col space-y-1.5 min-w-0">
                <DialogTitle className="text-start">{title}</DialogTitle>
                {description && (
                  <DialogDescription className="text-start">
                    {description}
                  </DialogDescription>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className={cn("shrink-0", description && "mt-0.5")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}

          {/* If header is hidden, still show a close button */}
          {hideHeader && (
            <div className="flex justify-end px-6 pt-3 pb-3 shrink-0 border-b border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          )}

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 pt-1 scrollbar-thumb-on-hover min-h-0">
            {children}
          </div>

          {/* Sticky footer */}
          {footer && <div className="px-6 pb-6 pt-4 shrink-0">{footer}</div>}
          {!footer && <div className="pb-1 shrink-0" />}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {!hideHeader && (
          <DrawerHeader className="text-start">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DrawerHeader>
        )}

        <div className="overflow-y-auto max-h-[80vh] scrollbar-thumb-on-hover">
          {children}
        </div>

        {footer && <div className="px-4 pb-4 pt-2 shrink-0">{footer}</div>}
      </DrawerContent>
    </Drawer>
  );
}

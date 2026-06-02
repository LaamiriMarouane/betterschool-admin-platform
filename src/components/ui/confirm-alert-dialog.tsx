import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConfirmAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  /** Footer controls — e.g. <AlertDialogCancel/> + a destructive <AlertDialogAction/>. */
  actions: ReactNode;
};

/** Reusable confirmation built on the Radix AlertDialog (role="alertdialog"). */
export function ConfirmAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: ConfirmAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>{actions}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Inline spinner (Loader2). Pass `className` for size/color, e.g. `size-8 text-muted-foreground`. */
export const Spinner = ({ className }: { className?: string }) => (
  <Loader2
    className={cn("size-4 shrink-0 animate-spin text-primary", className)}
  />
);

interface LoadingSpinnerProps {
  /** Wrapper class (e.g. py-12, min-h-[200px]). Default fills width and height. */
  className?: string;
}

/** Full-width/height loading spinner (no text). Use for page or section loading states. */
export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => (
  <div className={cn("flex h-full w-full items-center justify-center", className)}>
    <Spinner className="size-10" />
  </div>
);

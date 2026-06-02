import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

/**
 * Password field with a show/hide toggle. RTL-aware (toggle flips to the start
 * side). The product app's strength-meter was dropped — add it back later if a
 * "set password" screen needs it.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, disabled, placeholder = "••••••••", autoComplete, dir, ...props },
    ref,
  ) => {
    const { t } = useTranslation();
    const isRTL = useRTL();
    const [show, setShow] = React.useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isRTL ? "text-right ps-10" : "text-left pe-10",
            className,
          )}
          {...props}
          type={show ? "text" : "password"}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete ?? "current-password"}
          dir={dir ?? (isRTL ? "rtl" : "ltr")}
        />
        <button
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50",
            isRTL ? "start-0 ms-1" : "end-0 me-1",
          )}
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          disabled={disabled}
          aria-label={show ? t("password.hide") : t("password.show")}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

import * as React from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";
import {
  getPasswordRequirements,
  getPasswordStrength,
  type PasswordStrength,
} from "@/lib/password-validation";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** When true, shows a strength bar + requirement checklist below the input. */
  showStrength?: boolean;
}

const strengthStyles: Record<PasswordStrength, { bar: string; label: string }> = {
  weak: { bar: "bg-destructive", label: "text-destructive" },
  fair: { bar: "bg-orange-500", label: "text-orange-500 dark:text-orange-400" },
  good: { bar: "bg-blue-500", label: "text-blue-500 dark:text-blue-400" },
  strong: { bar: "bg-emerald-500", label: "text-emerald-600 dark:text-emerald-400" },
};

/**
 * Password field with a show/hide toggle. RTL-aware (toggle flips to the start side).
 * Pass {@link showStrength} on "set a new password" screens to render the live
 * strength meter + requirement checklist (mirrors the main frontend).
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      disabled,
      placeholder = "••••••••",
      autoComplete,
      dir,
      showStrength = false,
      value,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const isRTL = useRTL();
    const [show, setShow] = React.useState(false);

    const text = value == null ? "" : String(value);
    const strength = showStrength ? getPasswordStrength(text) : null;
    const requirements = showStrength ? getPasswordRequirements(text) : [];
    const score = requirements.filter((req) => req.met).length;
    const style = strength ? strengthStyles[strength] : null;

    return (
      <div className="w-full space-y-1.5">
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
            value={value ?? ""}
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

        {showStrength && (
          <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-200", style?.bar)}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
              {text.length > 0 && strength && (
                <div className="flex">
                  <span className={cn("ms-auto text-xs font-semibold", style?.label)}>
                    {t(`password.strength.${strength}`)}
                  </span>
                </div>
              )}
            </div>
            <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
              {requirements.map((req) => (
                <li key={req.labelKey} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                      req.met
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground/60",
                    )}
                  >
                    {req.met ? (
                      <Check className="size-3" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span
                    className={cn(
                      req.met
                        ? "font-medium text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {t(req.labelKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

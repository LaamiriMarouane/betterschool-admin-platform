/**
 * RTL-aware currency display for platform admin (USD, MAD, and Paddle invoice codes).
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatCurrencyAmount, getCurrencyConfig } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | null | undefined;
  currencyCode: string;
  className?: string;
  emptyText?: string;
}

export function CurrencyDisplay({
  amount,
  currencyCode,
  className = "",
  emptyText,
}: CurrencyDisplayProps) {
  const { t, i18n } = useTranslation();
  const currencyConfig = getCurrencyConfig(currencyCode);
  const isLanguageRTL = i18n.dir() === "rtl";
  const isRTL = isLanguageRTL && currencyConfig.isRTL;
  const hasAmount = amount != null && Number.isFinite(amount);

  const formattedValue = useMemo(() => {
    if (!hasAmount) return null;
    return formatCurrencyAmount(amount as number, currencyCode, i18n.language, t);
  }, [amount, currencyCode, hasAmount, i18n.language, t]);

  if (!hasAmount) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {emptyText ?? t("currencyDisplay.empty")}
      </span>
    );
  }

  const isNegative = (amount as number) < 0;
  const currencyName = t(`Currency.${currencyConfig.code}.name`, {
    defaultValue: currencyConfig.code,
  });
  const ariaLabel = `${formattedValue} ${currencyName}`;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono tabular-nums",
        isRTL && "flex-row-reverse font-sans",
        isNegative && "text-red-600 dark:text-red-400",
        className,
      )}
      dir={isRTL ? "rtl" : "ltr"}
      role="text"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {formattedValue}
    </span>
  );
}

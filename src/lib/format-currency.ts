import type { TFunction } from "i18next";

interface CurrencyConfig {
  code: string;
  decimalPlaces: number;
  isRTL: boolean;
  translatable: boolean;
}

const KNOWN_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: "USD", decimalPlaces: 2, isRTL: false, translatable: true },
  MAD: { code: "MAD", decimalPlaces: 2, isRTL: true, translatable: true },
};

function resolveIntlLocale(languageTag: string): string {
  const tag = languageTag?.trim() || "en";
  try {
    void new Intl.NumberFormat(tag).format(0);
    return tag;
  } catch {
    const primary = tag.split("-")[0];
    if (primary && primary !== tag) {
      try {
        void new Intl.NumberFormat(primary).format(0);
        return primary;
      } catch {
        /* fall through */
      }
    }
    return "en";
  }
}

export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  const code = (currencyCode ?? "USD").toUpperCase();
  return (
    KNOWN_CURRENCIES[code] ?? {
      code,
      decimalPlaces: 2,
      isRTL: false,
      translatable: false,
    }
  );
}

function resolveCurrencySuffix(
  currencyConfig: CurrencyConfig,
  uiLanguageTag: string,
  t: TFunction,
): string {
  const primary = (uiLanguageTag?.split("-")[0] ?? "en").toLowerCase();

  if (primary === "ar" && currencyConfig.translatable) {
    const translationKey = `Currency.${currencyConfig.code}.symbol`;
    const translated = t(translationKey, { defaultValue: "" });
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  return currencyConfig.code;
}

/** Amount + suffix (e.g. `799 MAD`, `79.00 USD`). Unknown ISO codes use Intl currency when supported. */
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  uiLanguageTag: string,
  t: TFunction,
): string {
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numeric)) {
    return t("currencyDisplay.empty");
  }

  const normalized = (currencyCode ?? "USD").toUpperCase();
  const config = getCurrencyConfig(normalized);
  const locale = resolveIntlLocale(uiLanguageTag);

  if (!KNOWN_CURRENCIES[normalized]) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: normalized,
      }).format(numeric);
    } catch {
      const formattedNumber = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric);
      return `${formattedNumber}\u00A0${normalized}`;
    }
  }

  const numberFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
    useGrouping: true,
  });

  const formattedNumber = numberFormatter.format(Math.abs(numeric));
  const suffix = resolveCurrencySuffix(config, uiLanguageTag, t);
  const core = `${formattedNumber}\u00A0${suffix}`;

  return numeric < 0 ? `-${core}` : core;
}

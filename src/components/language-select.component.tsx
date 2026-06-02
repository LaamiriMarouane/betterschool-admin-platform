import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

/** Native language labels (always shown in their own language, not translated). */
const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/**
 * Language switcher for the navbar. Changing it calls i18n.changeLanguage, which
 * (in @/lib/i18n) persists `platform_language` and flips `<html dir>` for RTL.
 */
export function LanguageSelect() {
  const { t, i18n } = useTranslation();
  const supported = SUPPORTED_LANGUAGES as readonly string[];
  const current = supported.includes(i18n.resolvedLanguage ?? "")
    ? (i18n.resolvedLanguage as string)
    : "en";

  return (
    <Select value={current} onValueChange={(lng) => void i18n.changeLanguage(lng)}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-none px-2 shadow-none focus:ring-0"
        aria-label={t("nav.language")}
      >
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <SelectItem key={lng} value={lng}>
            {LANGUAGE_LABELS[lng] ?? lng}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

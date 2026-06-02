import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import { STORAGE_KEYS } from "@/lib/http";

export const SUPPORTED_LANGUAGES = ["en", "fr", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const RTL_LANGUAGES = new Set<AppLanguage>(["ar"]);

function isSupported(lng: string): lng is AppLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lng);
}

/** Sync <html lang> + dir so `useRTL` (which watches `dir`) and CSS react to the language. */
function applyHtmlAttributes(lng: string) {
  const language = isSupported(lng) ? lng : "en";
  document.documentElement.lang = language;
  document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  // Keep the key the HTTP client reads for the Accept-Language header in sync.
  localStorage.setItem(STORAGE_KEYS.language, language);
}

const stored = localStorage.getItem(STORAGE_KEYS.language);
const initialLanguage = stored && isSupported(stored) ? stored : "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

applyHtmlAttributes(i18n.language);
i18n.on("languageChanged", applyHtmlAttributes);

export default i18n;

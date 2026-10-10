import { useMemo } from "react";
import DOMPurify from "dompurify";

import { cn } from "@/lib/utils";

import { LEGAL_PROSE_CLASS } from "./legal-prose";

interface LegalContentProps {
  html: string;
  /** Rendered `dir`; Arabic documents are RTL. */
  locale: string;
  className?: string;
}

/**
 * Read-only render of a legal document. The backend already sanitized it with the strict
 * LEGAL_DOCUMENT profile; DOMPurify here is defense in depth.
 */
export function LegalContent({ html, locale, className }: LegalContentProps) {
  const safe = useMemo(() => DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }), [html]);
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      className={cn(LEGAL_PROSE_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

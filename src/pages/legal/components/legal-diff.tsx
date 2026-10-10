import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { diffWords } from "diff";

import { cn } from "@/lib/utils";

/** Plain text of an HTML fragment, one line per block, so a word diff follows the document's structure. */
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = doc.body.querySelectorAll("h2, h3, p, li, blockquote, th, td");
  if (blocks.length === 0) return doc.body.textContent ?? "";
  return Array.from(blocks)
    .filter((el) => !el.querySelector("p, li"))
    .map((el) => (el.textContent ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

interface LegalDiffProps {
  before: string | null | undefined;
  after: string;
  locale: string;
}

/** Word-level diff of two versions of one locale (removed struck through, added highlighted). */
export function LegalDiff({ before, after, locale }: LegalDiffProps) {
  const { t } = useTranslation();
  const parts = useMemo(() => diffWords(htmlToText(before ?? ""), htmlToText(after)), [before, after]);
  const changed = parts.some((p) => p.added || p.removed);

  if (!before) {
    return <p className="text-sm text-muted-foreground">{t("legal.diff.noPrevious")}</p>;
  }
  if (!changed) {
    return <p className="text-sm text-muted-foreground">{t("legal.diff.noChanges")}</p>;
  }
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      className="whitespace-pre-wrap rounded-md border bg-background p-4 text-sm leading-relaxed text-muted-foreground"
    >
      {parts.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            part.removed && "rounded-sm bg-destructive/10 text-destructive line-through",
          )}
        >
          {part.value}
        </span>
      ))}
    </div>
  );
}

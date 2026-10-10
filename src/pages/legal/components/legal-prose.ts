import { cn } from "@/lib/utils";

/**
 * Typography for legal documents, kept identical to the marketing site's terms page
 * (TermsPageClient.tsx) so authors see what readers will see. The same string is copied
 * into the marketing app and the web app — see TERMS_AND_PRIVACY_VERSIONING.md §5.3.
 * Used both on the read-only render and on the TipTap editing surface.
 */
export const LEGAL_PROSE_CLASS = cn(
  "max-w-none text-start text-sm leading-relaxed",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2:first-child]:mt-0",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight",
  "[&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-6",
  "[&_li]:my-1 [&_li]:text-muted-foreground [&_li>p]:my-0",
  "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary",
  "[&_blockquote]:my-4 [&_blockquote]:border-s-2 [&_blockquote]:ps-4 [&_blockquote]:italic",
  "[&_hr]:my-8 [&_hr]:border-border",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
  "[&_th]:border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold",
  "[&_td]:border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-muted-foreground",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
);

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Loader2, Receipt, X } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { CurrencyDisplay } from "@/components/currency-display";
import { DateDisplay } from "@/components/date-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBlobDownload } from "@/hooks/use-blob-download";
import { triggerSignedUrlDownload } from "@/lib/download-blob";
import { schoolDetailService } from "@/services/schools/school-detail.service";
import type { SubscriptionInvoiceItemDTO } from "@/types/school-detail.types";
import {
  useSchoolDetailTabsStore,
  useSchoolDetailTabsActions,
} from "@/store/schools/school-detail.store";

import { DetailAlert, DetailCard } from "./detail-ui";

const PAGE_SIZE = 10;

export function SchoolBillingTab({ schoolId }: { schoolId: string }) {
  const { t } = useTranslation();
  const invoices = useSchoolDetailTabsStore((s) => s.invoices);
  const hasMore = useSchoolDetailTabsStore((s) => s.invoicesHasMore);
  const after = useSchoolDetailTabsStore((s) => s.invoicesAfter);
  const loading = useSchoolDetailTabsStore((s) => s.loading.billing);
  const error = useSchoolDetailTabsStore((s) => s.errors.billing);
  const { fetchBilling } = useSchoolDetailTabsActions();
  const { downloadingKey, run } = useBlobDownload();

  const [page, setPage] = useState(0);

  useEffect(() => {
    void fetchBilling(schoolId);
    setPage(0);
  }, [schoolId, fetchBilling]);

  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = useMemo(
    () => invoices.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [invoices, safePage],
  );

  const handleDownload = (inv: SubscriptionInvoiceItemDTO) => {
    void run(inv.transactionId, async () => {
      const res = await schoolDetailService.getInvoiceDownloadUrl(
        schoolId,
        inv.transactionId,
        "attachment",
      );
      if (!res.url?.trim()) {
        throw new Error("Missing invoice download URL");
      }
      triggerSignedUrlDownload(res.url);
    });
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DetailAlert variant="danger" icon={<X className="size-4" />}>
        {error.message}
      </DetailAlert>
    );
  }

  return (
    <DetailCard title={t("schoolDetail.billing.title")} icon={<Receipt className="h-3.5 w-3.5" />}>
      {invoices.length === 0 ? (
        <EmptyState size="sm" icon={<Receipt />} message={t("schoolDetail.billing.empty")} />
      ) : (
        <>
          <Table containerClassName="overflow-x-auto">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">{t("schoolDetail.billing.columns.invoice")}</TableHead>
                <TableHead className="w-[120px]">{t("schoolDetail.billing.columns.date")}</TableHead>
                <TableHead className="text-end">{t("schoolDetail.billing.columns.amount")}</TableHead>
                <TableHead className="w-[110px]">{t("schoolDetail.billing.columns.status")}</TableHead>
                <TableHead className="w-[72px] text-end">{t("schoolDetail.billing.columns.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((inv) => {
                const busy = downloadingKey === inv.transactionId;
                return (
                <TableRow key={inv.transactionId}>
                  <TableCell className="font-mono text-xs">{formatInvoiceLabel(inv)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.billedAt ? <DateDisplay date={inv.billedAt} showTime={false} /> : "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    {inv.amount != null && inv.currencyCode ? (
                      <CurrencyDisplay
                        amount={inv.amount}
                        currencyCode={inv.currencyCode}
                        className="justify-end"
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-end">
                    {inv.downloadable ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={busy}
                        title={t("schoolDetail.billing.download")}
                        onClick={() => handleDownload(inv)}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {t("schoolDetail.billing.pageOf", {
                page: safePage + 1,
                total: totalPages,
                count: invoices.length,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                {t("schoolDetail.billing.prev")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                {t("schoolDetail.billing.next")}
              </Button>
              {hasMore && after ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => void fetchBilling(schoolId, after)}
                >
                  {loading ? t("common.loading") : t("schoolDetail.billing.loadMore")}
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </DetailCard>
  );
}

function formatInvoiceLabel(inv: SubscriptionInvoiceItemDTO): string {
  if (inv.invoiceNumber?.trim()) return inv.invoiceNumber.trim();
  const id = inv.transactionId ?? "";
  return id.length > 10 ? `#${id.slice(-8)}` : id || "—";
}

function InvoiceStatusBadge({ status }: { status: string | null }) {
  const { t } = useTranslation();
  if (!status) return <span className="text-muted-foreground">—</span>;

  const normalized = status.toLowerCase();
  const variant =
    normalized === "completed" || normalized === "paid" || normalized === "billed"
      ? "success"
      : normalized === "past_due" || normalized === "failed"
        ? "destructive"
        : "neutral";

  return (
    <Badge variant={variant} className="font-mono text-[10px] uppercase">
      {t(`schoolDetail.billing.status.${normalized}`, { defaultValue: status })}
    </Badge>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CalendarClock, CalendarPlus, Clock, CreditCard, GraduationCap, Pencil, RefreshCw } from "lucide-react";

import { CurrencyDisplay } from "@/components/currency-display";
import { DateDisplay } from "@/components/date-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeToNow } from "@/lib/format";
import { useSchoolsActions, useSchoolsLoading } from "@/store/schools/schools.store";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

import { CustomContractDialog } from "./custom-contract-dialog";
import { ExtendTrialDialog } from "./extend-trial-dialog";
import { SubscriptionStatusBadge } from "./school-badges";
import { DetailAlert, DetailCard, EnrollmentUsage, Field } from "./detail-ui";

export function SchoolSubscriptionTab({
  detail,
  lang,
}: {
  detail: PlatformSchoolDetailDTO;
  lang: string;
}) {
  const { t } = useTranslation();
  const sub = detail.subscription;
  const { pullFromPaddle } = useSchoolsActions();
  const { save: saving } = useSchoolsLoading();
  const [customOpen, setCustomOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  if (!sub) {
    return (
      <DetailCard title={t("schoolDetail.subscription.plan")} icon={<CreditCard className="h-3.5 w-3.5" />}>
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("schools.noSubscription")}
        </p>
      </DetailCard>
    );
  }

  const planName = sub.planName?.[lang] ?? sub.planName?.en ?? null;
  const planDescription = sub.planDescription?.[lang] ?? sub.planDescription?.en ?? null;
  const tierLabel = sub.planTier ? t(`enums.planTier.${sub.planTier}`) : null;

  const yearly = sub.billingCycle === "YEARLY";
  const listPrice = yearly ? sub.yearlyPrice : sub.monthlyPrice;
  const listPriceMad = yearly ? sub.yearlyPriceMAD : sub.monthlyPriceMAD;
  const renews = formatRelativeToNow(sub.currentPeriodEnd);

  const formatCap = (value: number | null) =>
    value == null ? null : value <= 0 || value >= 999_999 ? "∞" : value.toLocaleString();

  const planCapValue = formatCap(sub.maxEnrollments);
  const effectiveCapValue = formatCap(sub.effectiveMaxEnrollments);
  const planSchoolsCapValue = formatCap(sub.maxSchools);
  const effectiveSchoolsCapValue = formatCap(sub.effectiveMaxSchools);
  const trialEligible = sub.status === "TRIALING" || sub.status === "EXPIRED";

  const capacityNote =
    detail.enrollmentStatus === "EXCEEDED"
      ? t("schoolDetail.capacityExceeded")
      : detail.enrollmentStatus === "WARNING"
        ? t("schoolDetail.capacityWarning")
        : t("schoolDetail.capacityOk");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {trialEligible && (
          <Button variant="outline" size="sm" onClick={() => setTrialOpen(true)}>
            <CalendarPlus className="size-4" />
            {t("extendTrial.action")}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={saving || !sub.paddleSubscriptionId}
          onClick={() => void pullFromPaddle(detail.id)}
        >
          <RefreshCw className="size-4" />
          {t("pullFromPaddle.action")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCustomOpen(true)}>
          <Pencil className="size-4" />
          {t("customContract.action")}
        </Button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <DetailCard title={t("schoolDetail.subscription.plan")} icon={<CreditCard className="h-3.5 w-3.5" />}>
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3.5 pt-2">
            <div className="min-w-0">
              <div className="text-[22px] font-semibold leading-tight">
                {planName ?? tierLabel ?? "—"}
              </div>
              {planDescription && (
                <div className="mt-0.5 text-[13px] text-muted-foreground">{planDescription}</div>
              )}
            </div>
            <SubscriptionStatusBadge status={sub.status} />
          </div>
          <div className="pt-2.5">
            <Field
              label={t("schoolDetail.subscription.billingCycle")}
              value={sub.billingCycle ? t(`enums.billingCycle.${sub.billingCycle}`) : null}
            />
            <Field
              label={t("schoolDetail.subscription.price")}
              value={
                sub.customContract ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{t("schoolDetail.subscription.customContract")}</Badge>
                    {sub.customPriceMAD != null && (
                      <CurrencyDisplay
                        amount={sub.customPriceMAD}
                        currencyCode="MAD"
                        className="text-xs text-muted-foreground"
                      />
                    )}
                  </span>
                ) : listPrice != null ? (
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <CurrencyDisplay amount={listPrice} currencyCode="USD" />
                    {listPriceMad != null && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <CurrencyDisplay
                          amount={listPriceMad}
                          currencyCode="MAD"
                          className="text-xs text-muted-foreground"
                        />
                      </>
                    )}
                  </span>
                ) : null
              }
            />
            <Field
              label={t("schoolDetail.subscription.maxEnrollments")}
              value={sub.customContract ? effectiveCapValue : planCapValue}
              mono
            />
            <Field
              label={t("schoolDetail.subscription.maxSchools")}
              value={sub.customContract ? effectiveSchoolsCapValue : planSchoolsCapValue}
              mono
            />
            {sub.customContract && (
              <>
                <Field label={t("schoolDetail.subscription.planCap")} value={planCapValue} mono />
                <Field
                  label={t("schoolDetail.subscription.planSchoolsCap")}
                  value={planSchoolsCapValue}
                  mono
                />
                {sub.customPaddlePriceId && (
                  <Field
                    label={t("customContract.paddlePriceId")}
                    value={sub.customPaddlePriceId}
                    mono
                  />
                )}
              </>
            )}
          </div>
        </DetailCard>

        <DetailCard title={t("schoolDetail.period")} icon={<Clock className="h-3.5 w-3.5" />}>
          <Field
            label={t("schoolDetail.subscription.periodStart")}
            value={<DateDisplay date={sub.currentPeriodStart} showIcon={false} />}
          />
          <Field
            label={t("schoolDetail.subscription.periodEnd")}
            value={
              sub.currentPeriodEnd ? (
                <span>
                  <DateDisplay date={sub.currentPeriodEnd} showIcon={false} />
                  {renews && (
                    <span className="ms-1 text-muted-foreground">
                      · {t("schoolDetail.subscription.renews")} {renews}
                    </span>
                  )}
                </span>
              ) : null
            }
          />
          {sub.trialEndsAt && (
            <Field
              label={t("schoolDetail.subscription.trialEnds")}
              value={<DateDisplay date={sub.trialEndsAt} showIcon={false} />}
            />
          )}
          {sub.cancelledAt && (
            <Field
              label={t("schoolDetail.subscription.cancelledAt")}
              value={<DateDisplay date={sub.cancelledAt} showIcon={false} showTime />}
            />
          )}
          {sub.graceDeadline && (
            <Field
              label={t("schoolDetail.subscription.graceDeadline")}
              value={
                <DateDisplay
                  date={sub.graceDeadline}
                  showIcon={false}
                  valueClassName="text-[13.5px] font-semibold text-destructive"
                />
              }
            />
          )}
          {sub.paddleSubscriptionId && (
            <Field
              label={t("schoolDetail.subscription.paddleSubscriptionId")}
              value={sub.paddleSubscriptionId}
              mono
            />
          )}
          {sub.lastReconciledAt && (
            <Field
              label={t("schoolDetail.subscription.lastReconciledAt")}
              value={<DateDisplay date={sub.lastReconciledAt} showIcon={false} showTime />}
            />
          )}
        </DetailCard>
      </div>

      <div className="flex flex-col gap-5">
        {sub.scheduledChangeAction && (
          <DetailAlert variant="info" icon={<CalendarClock className="h-4 w-4" />}>
            <b className="capitalize">{sub.scheduledChangeAction}</b>{" "}
            {t("schoolDetail.subscription.scheduledChange").toLowerCase()}
            {sub.scheduledChangeEffectiveAt && (
              <>
                {" · "}
                <DateDisplay
                  date={sub.scheduledChangeEffectiveAt}
                  showIcon={false}
                  valueClassName="text-sm text-inherit"
                />
              </>
            )}
          </DetailAlert>
        )}

        {sub.billingReviewRequired && (
          <DetailAlert variant="danger" icon={<AlertTriangle className="h-4 w-4" />}>
            {t("schoolDetail.subscription.billingReviewRequired")}
          </DetailAlert>
        )}
        {sub.lastReconcileDrift && (
          <DetailAlert variant="warning" icon={<AlertTriangle className="h-4 w-4" />}>
            {t("schoolDetail.subscription.reconcileDrift")}
          </DetailAlert>
        )}

        <DetailCard title={t("schoolDetail.enrollment")} icon={<GraduationCap className="h-3.5 w-3.5" />}>
          <div className="py-2">
            <EnrollmentUsage
              count={detail.enrollmentCount}
              limit={detail.enrollmentLimit}
              status={detail.enrollmentStatus}
            />
          </div>
          <p className="text-xs text-muted-foreground">{capacityNote}</p>
        </DetailCard>
      </div>
      </div>

      <CustomContractDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        schoolId={detail.id}
        subscription={sub}
      />
      {trialEligible && (
        <ExtendTrialDialog
          open={trialOpen}
          onOpenChange={setTrialOpen}
          schoolId={detail.id}
          subscription={sub}
        />
      )}
    </div>
  );
}

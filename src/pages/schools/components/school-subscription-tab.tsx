import { useTranslation } from "react-i18next";
import { CalendarClock, Clock, CreditCard, GraduationCap } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatRelativeToNow } from "@/lib/format";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

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
  const priceUsd = formatMoney(yearly ? sub.yearlyPrice : sub.monthlyPrice, "USD");
  const priceMad = formatMoney(yearly ? sub.yearlyPriceMAD : sub.monthlyPriceMAD, "MAD");
  const renews = formatRelativeToNow(sub.currentPeriodEnd);

  const maxEnrollmentsValue =
    sub.maxEnrollments == null
      ? null
      : sub.maxEnrollments >= 999_999
        ? "∞"
        : sub.maxEnrollments.toLocaleString();

  const capacityNote =
    detail.enrollmentStatus === "EXCEEDED"
      ? t("schoolDetail.capacityExceeded")
      : detail.enrollmentStatus === "WARNING"
        ? t("schoolDetail.capacityWarning")
        : t("schoolDetail.capacityOk");

  return (
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
                  <Badge variant="info">{t("schoolDetail.subscription.customContract")}</Badge>
                ) : priceUsd ? (
                  <span>
                    {priceUsd}
                    {priceMad && (
                      <span className="ms-2 font-mono text-xs text-muted-foreground">· {priceMad}</span>
                    )}
                  </span>
                ) : null
              }
            />
            <Field
              label={t("schoolDetail.subscription.maxEnrollments")}
              value={maxEnrollmentsValue}
              mono
            />
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
  );
}

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { CurrencyDisplay } from "@/components/currency-display";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans, usePlansActions, usePlansLoading } from "@/store/plans/plans.store";
import type { PlatformPlanDTO } from "@/types/plan.types";
import type { LocalizedText } from "@/types/common.types";

function localize(value: LocalizedText | null | undefined, lang: string): string | null {
  if (!value) return null;
  return value[lang] ?? value.en ?? Object.values(value)[0] ?? null;
}

export function PlansPage() {
  const { t, i18n } = useTranslation();

  const plans = usePlans();
  const loading = usePlansLoading();
  const { fetchPlans } = usePlansActions();

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("nav.plans")}</h1>
        <p className="text-sm text-muted-foreground">{t("plans.subtitle")}</p>
      </div>

      {loading.list && plans.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} lang={i18n.language} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, lang }: { plan: PlatformPlanDTO; lang: string }) {
  const { t } = useTranslation();
  const name = localize(plan.name, lang) ?? t(`enums.planTier.${plan.tier}`);

  return (
    <Card className={plan.active ? undefined : "opacity-70"}>
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{name}</CardTitle>
          <Badge variant="secondary">{t(`enums.planTier.${plan.tier}`)}</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {!plan.active && <Badge variant="outline">{t("plans.flags.inactive")}</Badge>}
          {plan.legacy && <Badge variant="secondary">{t("plans.flags.legacy")}</Badge>}
          {!plan.publiclyVisible && <Badge variant="outline">{t("plans.flags.hidden")}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <CurrencyDisplay
              amount={plan.monthlyPrice}
              currencyCode="USD"
              className="text-xl font-semibold font-sans"
            />
            {plan.monthlyPrice != null && (
              <span className="text-xs text-muted-foreground">{t("plans.perMonth")}</span>
            )}
          </div>
          {plan.monthlyPriceMAD != null && (
            <CurrencyDisplay
              amount={plan.monthlyPriceMAD}
              currencyCode="MAD"
              className="text-xs text-muted-foreground"
            />
          )}
        </div>
        <dl className="space-y-1.5 text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <dt>{t("plans.yearly")}</dt>
            <dd className="text-end">
              <CurrencyDisplay amount={plan.yearlyPrice} currencyCode="USD" className="text-foreground" />
              {plan.yearlyPriceMAD != null && (
                <div>
                  <CurrencyDisplay
                    amount={plan.yearlyPriceMAD}
                    currencyCode="MAD"
                    className="text-xs text-muted-foreground"
                  />
                </div>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("plans.maxEnrollments")}</dt>
            <dd className="text-foreground tabular-nums">{plan.maxEnrollments.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("plans.schoolsOnPlan")}</dt>
            <dd className="text-foreground tabular-nums">{plan.schoolCount.toLocaleString()}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export default PlansPage;

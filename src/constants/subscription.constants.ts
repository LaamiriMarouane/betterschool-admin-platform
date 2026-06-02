/**
 * Single source of truth for the subscription enums. The union types in
 * subscription.types.ts are derived from these arrays, and the option lists drive
 * every select/filter — add a value here and it flows to the types, tables and
 * forms. Mirrors the backend enums (PlanTier, SchoolSubscriptionStatus,
 * BillingCycle, EnrollmentLimitStatus).
 */
export const PLAN_TIERS = ["STARTER", "GROWTH", "STANDARD", "ENTERPRISE"] as const;
export const SUBSCRIPTION_STATUSES = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "PAUSED",
  "CANCELLED",
] as const;
export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const;
export const ENROLLMENT_STATUSES = ["OK", "WARNING", "EXCEEDED"] as const;

/** A select option: the enum value + the i18n key for its label. */
export interface EnumOption<T extends string> {
  value: T;
  labelKey: string;
}

export const planTierOptions: EnumOption<(typeof PLAN_TIERS)[number]>[] = PLAN_TIERS.map(
  (value) => ({ value, labelKey: `enums.planTier.${value}` }),
);

export const subscriptionStatusOptions: EnumOption<(typeof SUBSCRIPTION_STATUSES)[number]>[] =
  SUBSCRIPTION_STATUSES.map((value) => ({
    value,
    labelKey: `enums.subscriptionStatus.${value}`,
  }));

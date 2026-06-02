import type { PlanTier } from "./subscription.types";

/** One tier's school count for the plan-distribution legend (zero-filled, enum order). */
export interface PlanDistributionEntry {
  tier: PlanTier;
  schoolCount: number;
}

/** One trailing-month signup bucket; {@link month} is "YYYY-MM" (UTC). */
export interface MonthlySignup {
  month: string;
  count: number;
}

/**
 * Platform overview for the admin console landing page (GET /platform/dashboard).
 * Mirrors the backend dto/platform/PlatformDashboardDTO. MRR figures are estimates
 * from paying, non-custom subscriptions; {@link newSchoolsGrowthPercent} is null
 * when the previous month had no signups (the UI omits the badge rather than faking it).
 */
export interface PlatformDashboardDTO {
  totalSchools: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  monthlyRecurringRevenue: number;
  monthlyRecurringRevenueMAD: number;
  totalEnrollments: number;
  totalStorageBytes: number;
  planDistribution: PlanDistributionEntry[];
  newSchoolsByMonth: MonthlySignup[];
  newSchoolsGrowthPercent: number | null;
}

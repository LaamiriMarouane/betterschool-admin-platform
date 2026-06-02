import type { LocalizedText } from "./common.types";
import type { PlanTier } from "./subscription.types";

/**
 * Admin view of a SchoolSubscriptionPlan — a superset of the public
 * SubscriptionPlanResponseDTO: it also exposes hidden/legacy/visibility flags,
 * the Paddle ids, and the count of schools currently on the plan.
 * Mirrors the planned backend dto/platform/PlatformPlanDTO.
 */
export interface PlatformPlanDTO {
  id: string;
  tier: PlanTier;
  /** Trilingual jsonb fields, kept raw (resolve per language in the UI). */
  name: LocalizedText;
  description: LocalizedText;
  features: Record<string, unknown> | null;
  maxEnrollments: number;
  // USD — shown globally
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  // MAD — shown to Moroccan visitors
  monthlyPriceMAD: number | null;
  yearlyPriceMAD: number | null;
  active: boolean;
  legacy: boolean;
  publiclyVisible: boolean;
  sortOrder: number;
  // Paddle integration
  paddleProductId: string | null;
  paddleMonthlyPriceId: string | null;
  paddleYearlyPriceId: string | null;
  /** Number of schools currently subscribed to this plan (guards deactivation). */
  schoolCount: number;
}

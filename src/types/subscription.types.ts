import type { LocalizedText } from "./common.types";
import type {
  BILLING_CYCLES,
  ENROLLMENT_STATUSES,
  PLAN_TIERS,
  SUBSCRIPTION_STATUSES,
} from "@/constants/subscription.constants";

// ─── Enums — derived from the single-source arrays in subscription.constants.ts ───
// (TS `enum` is banned here by erasableSyntaxOnly; deriving keeps types + options in sync.)

export type PlanTier = (typeof PLAN_TIERS)[number];
export type BillingCycle = (typeof BILLING_CYCLES)[number];
export type SchoolSubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type EnrollmentLimitStatus = (typeof ENROLLMENT_STATUSES)[number];

/** Paddle scheduled-change action mirror (the entity stores it as a raw string). */
export type ScheduledChangeAction = "cancel" | "pause" | "resume";

/**
 * Subscription view for the school-detail Subscription tab AND the cross-school
 * `/subscriptions` list — it carries schoolId/schoolName so one DTO serves both.
 * Mirrors the planned backend dto/platform/PlatformSubscriptionDTO.
 */
export interface PlatformSubscriptionDTO {
  schoolId: string;
  schoolName: string;
  planId: string;
  planTier: PlanTier;
  /** Trilingual plan name + description (kept raw so the console can resolve per language). */
  planName: LocalizedText;
  planDescription: LocalizedText | null;
  /** Plan capacity + pricing, embedded so the Plan card can render without a second fetch. */
  maxEnrollments: number | null;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  monthlyPriceMAD: number | null;
  yearlyPriceMAD: number | null;
  status: SchoolSubscriptionStatus;
  billingCycle: BillingCycle | null;
  currentPeriodStart: string | null; // ISO datetime
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  enrollmentLimitExceeded: boolean;
  graceDeadline: string | null;
  customContract: boolean;
  /** Negotiated custom-contract overrides — only meaningful when customContract is true. */
  customMaxEnrollments: number | null; // null = use plan, <= 0 = unlimited
  customPriceMAD: number | null;
  customPaddlePriceId: string | null;
  /** The cap actually enforced now (custom cap if set, else plan max; null = unlimited). */
  effectiveMaxEnrollments: number | null;
  scheduledChangeAction: ScheduledChangeAction | null;
  scheduledChangeEffectiveAt: string | null;
}

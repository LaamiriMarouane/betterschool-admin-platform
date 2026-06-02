import type {
  PlanTier,
  SchoolSubscriptionStatus,
  EnrollmentLimitStatus,
  PlatformSubscriptionDTO,
} from "./subscription.types";
import type { PlatformStorageUsageDTO } from "./storage.types";
import type { AttachmentShortDTO } from "./attachment.types";

/**
 * One row in the /schools fleet table. `planName` is resolved to the request
 * language (a flat string) because the table can't render trilingual JSON.
 *
 * The enrollment fields mirror EnrollmentLimitService (active-academic-year,
 * status ACTIVE/SUSPENDED). `enrollmentLimit` is the *effective* limit, NOT raw
 * `plan.maxEnrollments`: null = unlimited (trial-not-expired or ENTERPRISE),
 * 0 = blocked (cancelled / past-due / expired trial). `storageBytesUsed` is a
 * grouped SUM(Attachment.fileSize) keyed by the attachment's `school_id`
 * (BaseEntity.school). Both are computed per page, not per-row, to avoid N+1.
 * Mirrors the planned backend dto/platform/PlatformSchoolRowDTO.
 */
export interface PlatformSchoolRowDTO {
  id: string;
  name: string;
  schoolCode: string | null;
  logo: AttachmentShortDTO | null;
  ownerEmail: string | null;
  ownerFullName: string | null;
  country: string | null;
  city: string | null;
  planTier: PlanTier | null;
  planName: string | null;
  subscriptionStatus: SchoolSubscriptionStatus | null;
  customContract: boolean;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  enrollmentCount: number;
  /** Effective limit; null = unlimited, 0 = blocked. Not raw plan.maxEnrollments. */
  enrollmentLimit: number | null;
  enrollmentStatus: EnrollmentLimitStatus;
  storageBytesUsed: number;
  createdAt: string; // ISO datetime
}

/** Owner / billing-contact summary shown on the school detail Overview tab. */
export interface SchoolOwnerSummaryDTO {
  id: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

/**
 * School-detail hub for /schools/:id — the Overview tab fields plus the embedded
 * subscription and storage summaries (storage may instead be lazy-loaded from
 * GET /platform/schools/{id}/storage; keep it nullable either way).
 * Mirrors the planned backend dto/platform/PlatformSchoolDetailDTO.
 */
export interface PlatformSchoolDetailDTO {
  id: string;
  name: string;
  schoolCode: string | null;
  schoolCodeLocked: boolean;
  logo: AttachmentShortDTO | null;
  email: string | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  facebook: string | null;
  owner: SchoolOwnerSummaryDTO | null;
  subscription: PlatformSubscriptionDTO | null;
  storage: PlatformStorageUsageDTO | null;
  // Effective enrollment usage (same semantics as the row) so the Overview tab is self-sufficient.
  enrollmentCount: number;
  enrollmentLimit: number | null;
  enrollmentStatus: EnrollmentLimitStatus;
  createdAt: string; // ISO datetime
  lastModifiedDate: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
}

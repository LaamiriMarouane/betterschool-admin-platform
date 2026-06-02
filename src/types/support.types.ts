/** Mirrors backend enums/ContactMessageStatus. */
export type ContactMessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

/**
 * A public "contact us" submission, for the platform support inbox.
 * Mirrors backend entity/communication/ContactMessage (a read DTO is TBD — today
 * the backend only has a public `create()` and no staff-facing read endpoint).
 *
 * NOTE: `school` is the free-text school name the submitter typed on the public
 * form — it is NOT a tenant id and does not necessarily match a real school.
 */
export interface PlatformContactMessageDTO {
  id: string;
  name: string;
  email: string;
  /** Free-text school name from the form (nullable). */
  school: string | null;
  message: string;
  status: ContactMessageStatus;
  createdAt: string; // ISO datetime
}

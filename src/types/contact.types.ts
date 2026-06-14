import type {
  ContactMessageSource,
  ContactMessageStatus,
} from "@/constants/contact.constants";

/** A "Contact us" lead. Mirrors backend dto/platform/PlatformContactMessageDTO. */
export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  /** Free-text school name the visitor typed (they have no account). */
  school: string | null;
  message: string;
  status: ContactMessageStatus;
  /** Where the lead originated (marketing form vs. in-product request). */
  source: ContactMessageSource;
  /** Set when the lead came from a logged-in school admin; links back to that school. */
  schoolId: string | null;
  createdAt: string | null; // ISO datetime
}

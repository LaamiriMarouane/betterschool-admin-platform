import type { ContactMessageStatus } from "@/constants/contact.constants";

/** A public "Contact us" message. Mirrors backend dto/platform/PlatformContactMessageDTO. */
export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  /** Free-text school name the visitor typed (they have no account). */
  school: string | null;
  message: string;
  status: ContactMessageStatus;
  createdAt: string | null; // ISO datetime
}

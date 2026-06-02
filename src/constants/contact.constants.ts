/**
 * Contact-us message statuses. Mirrors the backend ContactMessageStatus enum.
 * NEW → READ (on open) → REPLIED (after you reply by email) → ARCHIVED.
 */
export const CONTACT_MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export const contactStatusOptions = CONTACT_MESSAGE_STATUSES.map((value) => ({
  value,
  labelKey: `enums.contactStatus.${value}`,
}));

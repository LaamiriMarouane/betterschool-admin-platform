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

/**
 * Where a contact lead originated. Mirrors the backend ContactMessageSource enum.
 * MARKETING = anonymous public form; ENROLLMENT_LIMIT / CONTACT_SALES = in-product
 * requests from a logged-in school admin.
 */
export const CONTACT_MESSAGE_SOURCES = ["MARKETING", "ENROLLMENT_LIMIT", "CONTACT_SALES"] as const;
export type ContactMessageSource = (typeof CONTACT_MESSAGE_SOURCES)[number];

export const contactSourceOptions = CONTACT_MESSAGE_SOURCES.map((value) => ({
  value,
  labelKey: `enums.contactSource.${value}`,
}));

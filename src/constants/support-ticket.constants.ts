export const SUPPORT_TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "RESOLVED",
  "CLOSED",
] as const;

export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export const SUPPORT_TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type SupportTicketPriority = (typeof SUPPORT_TICKET_PRIORITIES)[number];

export const SUPPORT_TICKET_CATEGORIES = [
  "BUG_REPORT",
  "FEATURE_INQUIRY",
  "BILLING",
  "ACCOUNT_ACCESS",
  "DATA_IMPORT",
  "TRAINING_REQUEST",
  "OTHER",
] as const;

export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number];

export const SUPPORT_TICKET_ACTIVITY_TYPES = [
  "CREATED",
  "STATUS_CHANGED",
  "PRIORITY_CHANGED",
  "ASSIGNED",
  "UNASSIGNED",
  "REPLY_ADDED",
  "ATTACHMENT_ADDED",
  "SATISFACTION_RATED",
  "REOPENED",
] as const;

export type SupportTicketActivityType = (typeof SUPPORT_TICKET_ACTIVITY_TYPES)[number];

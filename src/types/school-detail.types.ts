import type { EnrollmentLimitStatus } from "./subscription.types";

/** Operational usage snapshot — aggregates only, embedded in school detail. */
export interface PlatformSchoolUsageDTO {
  adminCount: number;
  teacherCount: number;
  studentCount: number;
  parentCount: number;
  enrollmentCount: number;
  enrollmentLimit: number | null;
  enrollmentStatus: EnrollmentLimitStatus;
  storageBytesUsed: number;
}

/** Read-only module state for platform ops. */
export interface PlatformSchoolModulesDTO {
  schoolId: string;
  enabledModules: SchoolModuleKey[];
  allModules: SchoolModuleKey[];
}

/** Must match backend `SchoolModule` enum names. */
export type SchoolModuleKey =
  | "STAFF_MANAGEMENT"
  | "LEAVE_MANAGEMENT"
  | "BEHAVIOUR"
  | "EXPENSES"
  | "TRANSPORT"
  | "EQUIPMENT"
  | "ANNOUNCEMENT"
  | "CHAT"
  | "RECLAMATION";

export const SCHOOL_MODULE_KEYS: SchoolModuleKey[] = [
  "STAFF_MANAGEMENT",
  "LEAVE_MANAGEMENT",
  "BEHAVIOUR",
  "EXPENSES",
  "TRANSPORT",
  "EQUIPMENT",
  "ANNOUNCEMENT",
  "CHAT",
  "RECLAMATION",
];

export interface SubscriptionInvoiceItemDTO {
  transactionId: string;
  billedAt: string | null;
  description: string | null;
  status: string | null;
  amount: number | null;
  currencyCode: string | null;
  invoiceNumber: string | null;
  downloadable: boolean;
}

export interface SubscriptionInvoiceListResponseDTO {
  items: SubscriptionInvoiceItemDTO[];
  hasMore: boolean;
  after: string | null;
}

export interface SubscriptionInvoiceDownloadResponseDTO {
  url: string;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "BULK_CREATE"
  | "BULK_DELETE"
  | "STATUS_CHANGE"
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGE"
  | "EXPORT"
  | "IMPORT"
  | "PUBLISH"
  | "UNPUBLISH"
  | "GENERATE"
  | "APPROVE"
  | "REJECT"
  | "CANCEL"
  | "TRANSFER";

export type AuditEntityCategory =
  | "AUTH"
  | "USER_MANAGEMENT"
  | "PEOPLE"
  | "ENROLLMENT"
  | "ACADEMIC"
  | "FINANCE"
  | "COMMUNICATION"
  | "SETTINGS"
  | "OTHER";

export interface AuditLogResponseDTO {
  id: string;
  createdAt: string;
  userId: string | null;
  username: string | null;
  userRole: string | null;
  action: AuditAction;
  entityCategory: AuditEntityCategory;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  descriptionKey: string | null;
  description: string | null;
}

export interface AuditLogStatsDTO {
  totalEntries: number;
  byAction: Record<string, number>;
  byCategory: Record<string, number>;
  byUser: Record<string, number>;
  dailyTrend: { date: string; count: number }[];
}

export interface AuditLogsQuery {
  page: number;
  size: number;
  keyword?: string | null;
  sortBy?: string | null;
  sortDirection?: "ASC" | "DESC" | null;
}

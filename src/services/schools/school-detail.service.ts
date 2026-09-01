import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  AuditLogResponseDTO,
  AuditLogStatsDTO,
  AuditLogsQuery,
  PlatformSchoolModulesDTO,
  SubscriptionInvoiceDownloadResponseDTO,
  SubscriptionInvoiceListResponseDTO,
} from "@/types/school-detail.types";

const schoolBase = (schoolId: string) => `/platform/schools/${schoolId}`;

export const schoolDetailService = {
  getModules: (schoolId: string): Promise<PlatformSchoolModulesDTO> =>
    http.get<PlatformSchoolModulesDTO>(`${schoolBase(schoolId)}/modules`),

  listInvoices: (
    schoolId: string,
    params?: { month?: string | null; after?: string | null },
  ): Promise<SubscriptionInvoiceListResponseDTO> =>
    http.get<SubscriptionInvoiceListResponseDTO>(`${schoolBase(schoolId)}/invoices`, {
      params: {
        month: params?.month || undefined,
        after: params?.after || undefined,
      },
    }),

  getInvoiceDownloadUrl: (
    schoolId: string,
    transactionId: string,
    disposition = "attachment",
  ): Promise<SubscriptionInvoiceDownloadResponseDTO> =>
    http.get<SubscriptionInvoiceDownloadResponseDTO>(
      `${schoolBase(schoolId)}/invoices/${encodeURIComponent(transactionId)}/download`,
      { params: { disposition } },
    ),

  searchAuditLogs: (
    schoolId: string,
    query: AuditLogsQuery,
  ): Promise<PaginatedResponse<AuditLogResponseDTO>> =>
    http.get<PaginatedResponse<AuditLogResponseDTO>>(`${schoolBase(schoolId)}/audit-logs`, {
      params: {
        page: query.page,
        size: query.size,
        keyword: query.keyword || undefined,
        sortBy: query.sortBy || undefined,
        sortDirection: query.sortDirection || undefined,
      },
    }),

  auditStats: (schoolId: string): Promise<AuditLogStatsDTO> =>
    http.get<AuditLogStatsDTO>(`${schoolBase(schoolId)}/audit-logs/stats`),
};

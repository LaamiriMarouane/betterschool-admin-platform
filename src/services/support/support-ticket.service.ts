import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/constants/support-ticket.constants";
import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  SupportTicketDetailDTO,
  SupportTicketListDTO,
  SupportTicketPlatformStatsDTO,
} from "@/types/support-ticket.types";

export interface SupportTicketsQuery {
  page: number;
  size: number;
  search?: string | null;
  statuses?: SupportTicketStatus[] | null;
  categories?: SupportTicketCategory[] | null;
  priorities?: SupportTicketPriority[] | null;
  schoolId?: string | null;
  assignedToUserId?: string | null;
  unassignedOnly?: boolean | null;
  sortBy?: string | null;
  sortDirection?: "ASC" | "DESC" | null;
}

const BASE = "/platform/support-tickets";

export const supportTicketService = {
  stats: (): Promise<SupportTicketPlatformStatsDTO> =>
    http.get<SupportTicketPlatformStatsDTO>(`${BASE}/stats`),

  list: (query: SupportTicketsQuery): Promise<PaginatedResponse<SupportTicketListDTO>> =>
    http.get<PaginatedResponse<SupportTicketListDTO>>(BASE, {
      params: {
        page: query.page,
        size: query.size,
        keyword: query.search || undefined,
        statuses: query.statuses?.length ? query.statuses : undefined,
        categories: query.categories?.length ? query.categories : undefined,
        priorities: query.priorities?.length ? query.priorities : undefined,
        schoolId: query.schoolId || undefined,
        assignedToUserId: query.assignedToUserId || undefined,
        unassignedOnly: query.unassignedOnly === true ? true : undefined,
        sortBy: query.sortBy || undefined,
        sortDirection: query.sortDirection || undefined,
      },
    }),

  findById: (id: string): Promise<SupportTicketDetailDTO> =>
    http.get<SupportTicketDetailDTO>(`${BASE}/${id}`),

  reply: (id: string, body: string): Promise<SupportTicketDetailDTO> =>
    http.post<SupportTicketDetailDTO>(`${BASE}/${id}/replies`, { body }),

  updateStatus: (
    id: string,
    status: SupportTicketStatus,
    note?: string,
  ): Promise<SupportTicketDetailDTO> =>
    http.patch<SupportTicketDetailDTO>(`${BASE}/${id}/status`, { status, note }),

  assign: (
    id: string,
    agentUserId: string,
    agentName: string,
  ): Promise<SupportTicketDetailDTO> =>
    http.patch<SupportTicketDetailDTO>(`${BASE}/${id}/assign`, { agentUserId, agentName }),

  updatePriority: (id: string, priority: SupportTicketPriority): Promise<SupportTicketDetailDTO> =>
    http.patch<SupportTicketDetailDTO>(`${BASE}/${id}/priority`, { priority }),
};

import type {
  FeatureRequestCategory,
  FeatureRequestStatus,
} from "@/constants/feature-request.constants";
import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  FeatureRequestCommentDTO,
  FeatureRequestDetailDTO,
  FeatureRequestListDTO,
  FeatureRequestPlatformStatsDTO,
} from "@/types/feature-request.types";

export interface FeatureRequestsQuery {
  page: number;
  size: number;
  search?: string | null;
  statuses?: FeatureRequestStatus[] | null;
  categories?: FeatureRequestCategory[] | null;
  sortBy?: string | null;
  sortDirection?: "ASC" | "DESC" | null;
}

const BASE = "/platform/feature-requests";

export const featureRequestService = {
  stats: (): Promise<FeatureRequestPlatformStatsDTO> =>
    http.get<FeatureRequestPlatformStatsDTO>(`${BASE}/stats`),

  list: (query: FeatureRequestsQuery): Promise<PaginatedResponse<FeatureRequestListDTO>> =>
    http.get<PaginatedResponse<FeatureRequestListDTO>>(BASE, {
      params: {
        page: query.page,
        size: query.size,
        keyword: query.search || undefined,
        statuses: query.statuses?.length ? query.statuses : undefined,
        categories: query.categories?.length ? query.categories : undefined,
        sortBy: query.sortBy || undefined,
        sortDirection: query.sortDirection || undefined,
      },
    }),

  findById: (id: string): Promise<FeatureRequestDetailDTO> =>
    http.get<FeatureRequestDetailDTO>(`${BASE}/${id}`),

  updateStatus: (
    id: string,
    status: FeatureRequestStatus,
    note?: string,
  ): Promise<FeatureRequestDetailDTO> =>
    http.patch<FeatureRequestDetailDTO>(`${BASE}/${id}/status`, { status, note }),

  updatePlatformResponse: (id: string, response: string): Promise<FeatureRequestDetailDTO> =>
    http.patch<FeatureRequestDetailDTO>(`${BASE}/${id}/platform-response`, { response }),

  togglePin: (id: string): Promise<FeatureRequestDetailDTO> =>
    http.patch<FeatureRequestDetailDTO>(`${BASE}/${id}/pin`),

  listComments: (
    id: string,
    page = 0,
    size = 50,
  ): Promise<PaginatedResponse<FeatureRequestCommentDTO>> =>
    http.get<PaginatedResponse<FeatureRequestCommentDTO>>(`${BASE}/${id}/comments`, {
      params: { page, size },
    }),

  addComment: (id: string, body: string): Promise<FeatureRequestCommentDTO> =>
    http.post<FeatureRequestCommentDTO>(`${BASE}/${id}/comments`, { body }),

  delete: (id: string): Promise<void> => http.delete<void>(`${BASE}/${id}`),
};

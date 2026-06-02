import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  PlatformSchoolDetailDTO,
  PlatformSchoolRowDTO,
} from "@/types/school.types";
import type { PlatformStorageUsageDTO } from "@/types/storage.types";
import type { PlanTier, SchoolSubscriptionStatus } from "@/types/subscription.types";

/** Query for the schools grid. Nullish fields are dropped from the query string. */
export interface PlatformSchoolsQuery {
  page: number;
  size: number;
  sort?: string;
  search?: string | null;
  status?: SchoolSubscriptionStatus | null;
  tier?: PlanTier | null;
  country?: string | null;
  customContract?: boolean | null;
}

const BASE = "/platform/schools";

/**
 * Platform schools API. Services stay thin — build the request, return the typed
 * response; the store owns loading/error/state. No try/catch here.
 */
export const schoolsService = {
  listSchools: (query: PlatformSchoolsQuery): Promise<PaginatedResponse<PlatformSchoolRowDTO>> =>
    http.get<PaginatedResponse<PlatformSchoolRowDTO>>(BASE, {
      params: {
        page: query.page,
        size: query.size,
        sort: query.sort,
        search: query.search || undefined,
        status: query.status || undefined,
        tier: query.tier || undefined,
        country: query.country || undefined,
        customContract: query.customContract ?? undefined,
      },
    }),

  getSchool: (schoolId: string): Promise<PlatformSchoolDetailDTO> =>
    http.get<PlatformSchoolDetailDTO>(`${BASE}/${schoolId}`),

  getSchoolStorage: (schoolId: string): Promise<PlatformStorageUsageDTO> =>
    http.get<PlatformStorageUsageDTO>(`${BASE}/${schoolId}/storage`),
};

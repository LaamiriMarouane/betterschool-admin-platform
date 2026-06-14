import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type {
  PlatformSchoolDetailDTO,
  PlatformSchoolRowDTO,
} from "@/types/school.types";
import type { PlatformStorageUsageDTO } from "@/types/storage.types";
import type {
  PlanTier,
  PlatformSubscriptionDTO,
  SchoolSubscriptionStatus,
} from "@/types/subscription.types";

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

/** Grant or edit a negotiated custom contract on a school's subscription. */
export interface CustomContractRequest {
  customContract: boolean;
  customMaxEnrollments: number | null; // null = use plan, <= 0 = unlimited
  customPriceMAD: number | null;
  customPaddlePriceId: string | null;
}

/** Extend a school's trial by N days (clears the scheduled-purge / warning markers). */
export interface TrialExtendRequest {
  days: number;
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

  setCustomContract: (
    schoolId: string,
    request: CustomContractRequest,
  ): Promise<PlatformSubscriptionDTO> =>
    http.patch<PlatformSubscriptionDTO>(`${BASE}/${schoolId}/subscription`, request),

  extendTrial: (
    schoolId: string,
    request: TrialExtendRequest,
  ): Promise<PlatformSubscriptionDTO> =>
    http.post<PlatformSubscriptionDTO>(`${BASE}/${schoolId}/subscription/trial/extend`, request),
};

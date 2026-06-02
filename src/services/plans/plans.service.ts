import { http } from "@/lib/http";
import type { PlatformPlanDTO } from "@/types/plan.types";

const BASE = "/platform/plans";

/** Platform plan catalog API (read). */
export const plansService = {
  listPlans: (): Promise<PlatformPlanDTO[]> => http.get<PlatformPlanDTO[]>(BASE),
};

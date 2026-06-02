import { http } from "@/lib/http";
import type { PlatformDashboardDTO } from "@/types/dashboard.types";

const BASE = "/platform/dashboard";

/**
 * Platform dashboard API. Thin: one cross-tenant overview call; the store owns
 * loading/error/state. No try/catch here.
 */
export const dashboardService = {
  getDashboard: (): Promise<PlatformDashboardDTO> =>
    http.get<PlatformDashboardDTO>(BASE),
};

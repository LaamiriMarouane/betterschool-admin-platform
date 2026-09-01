import { useAccountStore } from "@/store/account/account.store";
import { useContactStore } from "@/store/contact/contact.store";
import { useDashboardStore } from "@/store/dashboard/dashboard.store";
import { useFeatureRequestStore } from "@/store/features/feature-request.store";
import { usePlansStore } from "@/store/plans/plans.store";
import { useSchoolDetailTabsStore } from "@/store/schools/school-detail.store";
import { useSchoolsStore } from "@/store/schools/schools.store";
import { useSupportTicketStore } from "@/store/support/support-ticket.store";
import { useTeamStore } from "@/store/team/team.store";

/**
 * Clears every domain store. Called on login (drop a previous user's data) and on
 * any auth clear (logout / 401). When you add a domain store, register its
 * `actions.resetStore()` here or its data leaks across users.
 */
export function resetAllStores(): void {
  useSchoolsStore.getState().actions.resetStore();
  useSchoolDetailTabsStore.getState().actions.reset();
  usePlansStore.getState().actions.resetStore();
  useTeamStore.getState().actions.resetStore();
  useContactStore.getState().actions.resetStore();
  useSupportTicketStore.getState().actions.resetStore();
  useFeatureRequestStore.getState().actions.resetStore();
  useDashboardStore.getState().actions.resetStore();
  useAccountStore.getState().actions.resetStore();
}

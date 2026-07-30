import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CircleDot, Clock3, Inbox, UserRoundX } from "lucide-react";

import SearchInput from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/constants/support-ticket.constants";
import { KpiCard } from "@/pages/dashboard/components/dashboard-ui";
import { useAuthStore } from "@/store/auth/auth.store";
import {
  type AssigneeFilter,
  useSupportTicketActions,
  useSupportTicketFilters,
  useSupportTicketLoading,
  useSupportTicketPage,
  useSupportTicketRows,
  useSupportTicketSelected,
  useSupportTicketSize,
  useSupportTicketStats,
  useSupportTicketStore,
} from "@/store/support/support-ticket.store";

import { TicketDetailPane } from "./components/ticket-detail-pane";
import { TicketListPanel } from "./components/ticket-list-panel";

const ALL = "ALL";

export function SupportTicketsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const rows = useSupportTicketRows();
  const selected = useSupportTicketSelected();
  const stats = useSupportTicketStats();
  const filters = useSupportTicketFilters();
  const loading = useSupportTicketLoading();
  const page = useSupportTicketPage();
  const size = useSupportTicketSize();
  const totalPages = useSupportTicketStore((s) => s.totalPages);
  const {
    fetchTickets,
    fetchStats,
    findById,
    clearSelection,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    setPriorityFilter,
    setSchoolIdFilter,
    setAssigneeFilter,
    setPagination,
  } = useSupportTicketActions();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentUserName = useMemo(() => {
    if (!user) return "";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return full || user.username || user.email || "";
  }, [user]);

  useEffect(() => {
    useSupportTicketStore.getState().setCurrentUserId(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    const schoolId = searchParams.get("schoolId");
    if (schoolId) setSchoolIdFilter(schoolId);
  }, [searchParams, setSchoolIdFilter]);

  useEffect(() => {
    void fetchTickets();
    void fetchStats();
  }, [fetchTickets, fetchStats]);

  useEffect(() => {
    if (!selectedId) {
      clearSelection();
      return;
    }
    void findById(selectedId);
  }, [selectedId, findById, clearSelection]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("supportTickets.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("supportTickets.subtitle")}</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            icon={Inbox}
            tone="sky"
            value={stats.totalOpen}
            label={t("supportTickets.stats.open")}
          />
          <KpiCard
            icon={Clock3}
            tone="violet"
            value={stats.totalInProgress}
            label={t("supportTickets.stats.inProgress")}
          />
          <KpiCard
            icon={CircleDot}
            tone="emerald"
            value={stats.totalWaitingOnCustomer}
            label={t("supportTickets.stats.waiting")}
          />
          <KpiCard
            icon={UserRoundX}
            tone="rose"
            value={stats.unassignedCount}
            label={t("supportTickets.stats.unassigned")}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput
          value={filters.search}
          onChange={setSearch}
          placeholder={t("supportTickets.searchPlaceholder")}
          wrapperClassName="w-full min-w-0 lg:max-w-xs"
        />

        <Select
          value={filters.status ?? ALL}
          onValueChange={(value) =>
            setStatusFilter(value === ALL ? null : (value as SupportTicketStatus))
          }
        >
          <SelectTrigger className="h-9 w-full lg:w-[160px]">
            <SelectValue placeholder={t("supportTickets.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("supportTickets.allStatuses")}</SelectItem>
            {SUPPORT_TICKET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`enums.ticketStatus.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority ?? ALL}
          onValueChange={(value) =>
            setPriorityFilter(value === ALL ? null : (value as SupportTicketPriority))
          }
        >
          <SelectTrigger className="h-9 w-full lg:w-[150px]">
            <SelectValue placeholder={t("supportTickets.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("supportTickets.allPriorities")}</SelectItem>
            {SUPPORT_TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {t(`enums.ticketPriority.${priority}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? ALL}
          onValueChange={(value) =>
            setCategoryFilter(value === ALL ? null : (value as SupportTicketCategory))
          }
        >
          <SelectTrigger className="h-9 w-full lg:w-[170px]">
            <SelectValue placeholder={t("supportTickets.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("supportTickets.allCategories")}</SelectItem>
            {SUPPORT_TICKET_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {t(`enums.ticketCategory.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assignee}
          onValueChange={(value) => setAssigneeFilter(value as AssigneeFilter)}
        >
          <SelectTrigger className="h-9 w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("supportTickets.assigneeAll")}</SelectItem>
            <SelectItem value="MINE">{t("supportTickets.assigneeMine")}</SelectItem>
            <SelectItem value="UNASSIGNED">{t("supportTickets.assigneeUnassigned")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-5 xl:col-span-4">
          <TicketListPanel
            tickets={rows}
            selectedId={selectedId}
            loading={loading.list}
            page={page}
            totalPages={totalPages}
            onSelect={setSelectedId}
            onPageChange={(nextPage) => setPagination(nextPage, size)}
          />
        </aside>

        <main className="lg:col-span-7 xl:col-span-8">
          <TicketDetailPane
            ticket={selected}
            currentUserId={user?.id ?? null}
            currentUserName={currentUserName}
          />
        </main>
      </div>
    </div>
  );
}

export default SupportTicketsPage;

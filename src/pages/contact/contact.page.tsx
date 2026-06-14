import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Inbox } from "lucide-react";
import type { ColumnDef, PaginationState, Updater } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { DateDisplay } from "@/components/date-display";
import { TextDisplay } from "@/components/text-display";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmAlertDialog } from "@/components/ui/confirm-alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_MESSAGE_SOURCES,
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageSource,
  type ContactMessageStatus,
} from "@/constants/contact.constants";
import { cn } from "@/lib/utils";
import {
  useContactActions,
  useContactFilters,
  useContactLoading,
  useContactPage,
  useContactRows,
  useContactSize,
  useContactTotalItems,
} from "@/store/contact/contact.store";
import type { ContactMessageDTO } from "@/types/contact.types";

import { ContactDetailDialog } from "./components/contact-detail-dialog";
import { ContactStatusBadge } from "./components/contact-status-badge";

const ALL = "ALL";

/** In-product leads (ENROLLMENT_LIMIT/CONTACT_SALES) get an accent; the marketing form is neutral. */
function ContactSourceBadge({ source }: { source: ContactMessageSource }) {
  const { t } = useTranslation();
  return (
    <Badge variant={source === "MARKETING" ? "neutral" : "info"}>
      {t(`enums.contactSource.${source}`)}
    </Badge>
  );
}

export function ContactPage() {
  const { t } = useTranslation();
  const rows = useContactRows();
  const totalItems = useContactTotalItems();
  const page = useContactPage();
  const size = useContactSize();
  const filters = useContactFilters();
  const loading = useContactLoading();
  const {
    fetchMessages,
    fetchUnreadCount,
    setSearch,
    setStatusFilter,
    setSourceFilter,
    setPagination,
    updateStatus,
    deleteMessage,
  } = useContactActions();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContactMessageDTO | null>(null);

  useEffect(() => {
    void fetchMessages();
    void fetchUnreadCount();
  }, [fetchMessages, fetchUnreadCount]);

  const columns = useMemo<ColumnDef<ContactMessageDTO, unknown>[]>(
    () => [
      {
        id: "sender",
        header: t("contact.sender"),
        size: 240,
        cell: ({ row }) => {
          const message = row.original;
          return (
            <div className="min-w-0">
              <div className={cn("truncate text-sm", message.status === "NEW" && "font-semibold")}>
                {message.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">{message.email}</div>
            </div>
          );
        },
      },
      {
        id: "school",
        header: t("contact.school"),
        size: 160,
        meta: { hideOnMobile: true },
        cell: ({ row }) => {
          const { school, schoolId } = row.original;
          if (schoolId) {
            return (
              <Link
                to={`/schools/${schoolId}`}
                className="truncate text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                onClick={(e) => e.stopPropagation()}
              >
                {school || t("contact.viewSchool")}
              </Link>
            );
          }
          return <TextDisplay value={school || null} truncate />;
        },
      },
      {
        id: "source",
        header: t("contact.sourceLabel"),
        size: 140,
        meta: { hideOnMobile: true },
        cell: ({ row }) => <ContactSourceBadge source={row.original.source} />,
      },
      {
        id: "message",
        header: t("contact.message"),
        size: 280,
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="block truncate text-sm text-muted-foreground">
            {row.original.message}
          </span>
        ),
      },
      {
        id: "status",
        header: t("contact.statusLabel"),
        size: 120,
        meta: { align: "center" },
        cell: ({ row }) => <ContactStatusBadge status={row.original.status} />,
      },
      {
        id: "received",
        header: t("contact.received"),
        size: 150,
        meta: { hideOnMobile: true },
        cell: ({ row }) => <DateDisplay date={row.original.createdAt} showIcon={false} />,
      },
    ],
    [t],
  );

  const pagination: PaginationState = { pageIndex: page, pageSize: size };

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setPagination(next.pageIndex, next.pageSize);
  };

  const statusFilter = (
    <Select
      value={filters.status ?? ALL}
      onValueChange={(value) =>
        setStatusFilter(value === ALL ? null : (value as ContactMessageStatus))
      }
    >
      <SelectTrigger className="h-9 w-[160px]">
        <SelectValue placeholder={t("contact.statusLabel")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("contact.allStatuses")}</SelectItem>
        {CONTACT_MESSAGE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`enums.contactStatus.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const sourceFilter = (
    <Select
      value={filters.source ?? ALL}
      onValueChange={(value) =>
        setSourceFilter(value === ALL ? null : (value as ContactMessageSource))
      }
    >
      <SelectTrigger className="h-9 w-[170px]">
        <SelectValue placeholder={t("contact.sourceLabel")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("contact.allSources")}</SelectItem>
        {CONTACT_MESSAGE_SOURCES.map((source) => (
          <SelectItem key={source} value={source}>
            {t(`enums.contactSource.${source}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const openMessage = (message: ContactMessageDTO) => {
    setSelectedId(message.id);
    if (message.status === "NEW") void updateStatus(message.id, "READ");
  };

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await deleteMessage(deleting.id);
    if (ok) {
      setDeleting(null);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("contact.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        pagination={pagination}
        paginationOptions={{ rowCount: totalItems, onPaginationChange }}
        isLoading={loading.list}
        onSearchChange={setSearch}
        searchValue={filters.search}
        searchText={t("contact.searchPlaceholder")}
        getRowId={(row) => row.id}
        onRowClick={openMessage}
        actions={[sourceFilter, statusFilter]}
        emptyState={{ icon: <Inbox />, message: t("contact.empty") }}
      />

      <ContactDetailDialog
        message={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onDelete={setDeleting}
      />

      <ConfirmAlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={t("contact.deleteTitle")}
        description={
          <>
            <span className="font-medium text-foreground">{deleting?.name}</span>
            {" — "}
            {t("contact.deleteDesc")}
          </>
        }
        actions={
          <>
            <AlertDialogCancel disabled={loading.save}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              disabled={loading.save}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {t("contact.delete")}
            </AlertDialogAction>
          </>
        }
      />
    </div>
  );
}

export default ContactPage;

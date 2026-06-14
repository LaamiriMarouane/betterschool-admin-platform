import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Archive, Reply, Trash2 } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContactActions, useContactLoading } from "@/store/contact/contact.store";
import type { ContactMessageDTO } from "@/types/contact.types";

import { ContactStatusBadge } from "./contact-status-badge";

export function ContactDetailDialog({
  message,
  open,
  onOpenChange,
  onDelete,
}: {
  message: ContactMessageDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (message: ContactMessageDTO) => void;
}) {
  const { t } = useTranslation();
  const { updateStatus } = useContactActions();
  const loading = useContactLoading();

  if (!message) return null;

  const reply = () => {
    const subject = encodeURIComponent(t("contact.replySubject"));
    window.location.href = `mailto:${message.email}?subject=${subject}`;
    void updateStatus(message.id, "REPLIED");
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={message.name}
      description={message.email}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={loading.save}
            onClick={() => onDelete(message)}
          >
            <Trash2 className="me-1.5 h-4 w-4" />
            {t("contact.delete")}
          </Button>
          {message.status !== "ARCHIVED" && (
            <Button
              variant="outline"
              disabled={loading.save}
              onClick={() => void updateStatus(message.id, "ARCHIVED")}
            >
              <Archive className="me-1.5 h-4 w-4" />
              {t("contact.archive")}
            </Button>
          )}
          <Button disabled={loading.save} onClick={reply}>
            <Reply className="me-1.5 h-4 w-4" />
            {t("contact.reply")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 px-4 pb-2 sm:w-[34rem] sm:px-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <ContactStatusBadge status={message.status} />
          <Badge variant={message.source === "MARKETING" ? "neutral" : "info"}>
            {t(`enums.contactSource.${message.source}`)}
          </Badge>
          <span>·</span>
          <DateDisplay date={message.createdAt} showIcon={false} showTime />
        </div>

        {message.school && (
          <div className="text-sm">
            <span className="text-muted-foreground">{t("contact.school")}: </span>
            {message.schoolId ? (
              <Link
                to={`/schools/${message.schoolId}`}
                className="font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                {message.school}
              </Link>
            ) : (
              <span className="font-medium">{message.school}</span>
            )}
          </div>
        )}

        <div className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
          {message.message}
        </div>
      </div>
    </ResponsiveDialog>
  );
}

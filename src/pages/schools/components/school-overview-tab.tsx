import { useTranslation } from "react-i18next";
import { Clock, Link as LinkIcon, Mail, MapPin, Phone, Users } from "lucide-react";

import { DateDisplay } from "@/components/date-display";
import { TextDisplay } from "@/components/text-display";
import type { PlatformSchoolDetailDTO } from "@/types/school.types";

import { Chip, DetailCard, Field, InitialAvatar } from "./detail-ui";

export function SchoolOverviewTab({ detail }: { detail: PlatformSchoolDetailDTO }) {
  const { t } = useTranslation();
  const owner = detail.owner;
  const hasSocial = Boolean(detail.instagram || detail.whatsapp || detail.facebook);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        <DetailCard title={t("schoolDetail.contact")} icon={<Mail className="h-3.5 w-3.5" />}>
          <Field label={t("schoolDetail.email")} value={<TextDisplay value={detail.email} copyable />} />
          <Field label={t("schoolDetail.phone")} value={<TextDisplay value={detail.phoneNumber} />} mono />
          <Field
            label={t("schoolDetail.website")}
            value={
              detail.website ? (
                <Chip icon={<LinkIcon className="h-3.5 w-3.5" />}>{detail.website}</Chip>
              ) : null
            }
          />
        </DetailCard>

        <DetailCard title={t("schoolDetail.address")} icon={<MapPin className="h-3.5 w-3.5" />}>
          <Field label={t("schoolDetail.address")} value={<TextDisplay value={detail.address} />} />
        </DetailCard>

        {hasSocial && (
          <DetailCard title={t("schoolDetail.social")} icon={<LinkIcon className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-2">
              {detail.instagram && (
                <Chip icon={<LinkIcon className="h-3.5 w-3.5" />}>Instagram · {detail.instagram}</Chip>
              )}
              {detail.whatsapp && (
                <Chip icon={<Phone className="h-3.5 w-3.5" />}>WhatsApp · {detail.whatsapp}</Chip>
              )}
              {detail.facebook && (
                <Chip icon={<LinkIcon className="h-3.5 w-3.5" />}>Facebook · {detail.facebook}</Chip>
              )}
            </div>
          </DetailCard>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <DetailCard title={t("schoolDetail.owner")} icon={<Users className="h-3.5 w-3.5" />}>
          <div className="flex items-center gap-3 pb-3">
            <InitialAvatar name={owner?.fullName} size={42} />
            <div className="min-w-0">
              <div className="truncate font-semibold">{owner?.fullName ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{t("schoolDetail.accountOwner")}</div>
            </div>
          </div>
          <Field label={t("schoolDetail.email")} value={<TextDisplay value={owner?.email} copyable />} />
          <Field label={t("schoolDetail.phone")} value={<TextDisplay value={owner?.phoneNumber} />} mono />
        </DetailCard>

        <DetailCard title={t("schoolDetail.metadata")} icon={<Clock className="h-3.5 w-3.5" />}>
          <Field
            label={t("schoolDetail.createdAt")}
            value={<DateDisplay date={detail.createdAt} showIcon={false} showTime />}
          />
          <Field
            label={t("schoolDetail.lastModified")}
            value={<DateDisplay date={detail.lastModifiedDate} showIcon={false} showTime />}
          />
        </DetailCard>
      </div>
    </div>
  );
}

/**
 * User avatar — renders the profile image via AppImage (with auth loading) and a
 * deterministic colored-initials fallback when there's no image. Ported from the
 * product frontend so the platform console matches its avatar logic.
 */

import { AppImage } from "@/components/ui/app-image";
import { getAvatarColor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";
import type { AttachmentShortDTO } from "@/types/attachment.types";

interface UserAvatarProps {
  /** Preferred: attachment from API (profileImage). Handles auth loading via AppImage. */
  profileImage?: AttachmentShortDTO | null;
  /** @deprecated Prefer profileImage. Internal URL; treated as non-external attachment. */
  imageUrl?: string;
  firstName: string;
  lastName?: string;
  /** Stable key (preferably user id) used to pick the fallback color; falls back to the name. */
  colorKey?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  profileImage,
  imageUrl,
  firstName,
  lastName = "",
  colorKey,
  size = "md",
  className = "",
  onClick,
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "h-5 w-5",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-40 w-40",
  };

  const fallbackSizeClasses = {
    xs: "text-[8px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl",
  };

  const attachment: AttachmentShortDTO | null =
    profileImage ??
    (imageUrl
      ? ({
          id: "",
          url: imageUrl,
          originalFileName: "",
          isExternal: false,
        } as AttachmentShortDTO)
      : null);

  const getInitials = () => {
    if (!lastName) return firstName.charAt(0).toUpperCase();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const fallback = (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full font-semibold text-white",
        getAvatarColor(colorKey ?? `${firstName}${lastName}`),
        fallbackSizeClasses[size],
      )}
    >
      {getInitials()}
    </div>
  );

  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "shrink-0 overflow-hidden rounded-full",
        onClick && "cursor-pointer transition-opacity hover:opacity-80",
        className,
      )}
    >
      <AppImage
        attachment={attachment}
        alt={`${firstName} ${lastName}`}
        className="h-full w-full rounded-full"
        imgClassName="h-full w-full rounded-full object-cover"
        skeletonClassName="rounded-full"
        fallback={fallback}
      />
    </div>
  );
}

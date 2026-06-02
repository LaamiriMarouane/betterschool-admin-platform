import { useEffect, useRef, useState, type ReactNode } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { imageService } from "@/services/image/image.service";
import type { AttachmentShortDTO } from "@/types/attachment.types";

type AppImageStatus = "loading" | "success" | "error";

export interface AppImageProps {
  /**
   * Attachment to render. When `isExternal` the `url` is used directly; otherwise
   * it's a protected backend blob fetched with the bearer token. Prefer this over
   * `src` whenever you have the DTO.
   */
  attachment?: AttachmentShortDTO | null;
  /**
   * Raw URL fallback (when you don't have an attachment). Cross-origin URLs render
   * directly; same-origin/relative URLs are fetched with auth.
   */
  src?: string | null;
  alt: string;
  /** Wrapper class (size, rounding, border). */
  className?: string;
  /** Class for the <img> element. */
  imgClassName?: string;
  skeletonClassName?: string;
  /** Custom fallback when the image is missing or fails to load. */
  fallback?: ReactNode;
}

/**
 * Image with loading / success / fallback states that transparently handles
 * authenticated (protected) backend images. All auth/blob logic lives here.
 */
export function AppImage({
  attachment,
  src,
  alt,
  className,
  imgClassName,
  skeletonClassName,
  fallback,
}: AppImageProps) {
  const [status, setStatus] = useState<AppImageStatus>("loading");
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Resolve the target URL and whether it can be rendered directly (public) or
  // must be fetched with auth (protected backend blob).
  let targetUrl: string | null = null;
  let direct = false;
  if (attachment) {
    targetUrl = attachment.thumbnailUrl || attachment.url || null;
    direct = attachment.isExternal === true;
  } else if (src) {
    targetUrl = src;
    direct = imageService.isDirect(src);
  }

  useEffect(() => {
    let cancelled = false;
    const revoke = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    if (!targetUrl) {
      setResolvedSrc(null);
      setStatus("error");
      return;
    }

    if (direct) {
      setResolvedSrc(targetUrl);
      setStatus("loading");
      return revoke;
    }

    setStatus("loading");
    setResolvedSrc(null);
    imageService
      .loadImageWithAuth(targetUrl)
      .then((blobUrl) => {
        if (cancelled) return;
        if (blobUrl) {
          blobUrlRef.current = blobUrl;
          setResolvedSrc(blobUrl);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      revoke();
    };
  }, [targetUrl, direct]);

  if (status !== "error" && resolvedSrc) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {status === "loading" && (
          <Skeleton className={cn("absolute inset-0 h-full w-full", skeletonClassName)} />
        )}
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn(
            "h-full w-full object-cover",
            status === "loading" && "opacity-0",
            imgClassName,
          )}
          onLoad={() => setStatus("success")}
          onError={() => setStatus("error")}
        />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className={cn("overflow-hidden", className)}>
        <Skeleton className={cn("h-full w-full", skeletonClassName)} />
      </div>
    );
  }

  if (fallback !== undefined && fallback !== null) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden", className)}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-muted text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className="h-1/2 w-1/2" />
    </div>
  );
}

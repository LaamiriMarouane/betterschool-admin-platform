/**
 * Mirrors backend dto/shedule/AttachmentShortDTO. Used for protected images
 * (e.g. a school logo): when `isExternal` the `url` is public, otherwise it's a
 * backend blob that must be fetched with auth (handled by AppImage).
 */
export interface AttachmentShortDTO {
  id: string;
  url: string;
  originalFileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  thumbnailUrl?: string | null;
  isExternal?: boolean | null;
}

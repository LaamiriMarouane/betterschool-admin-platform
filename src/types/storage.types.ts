/** One category line in a school's storage breakdown. */
export interface StorageCategoryUsageDTO {
  /** Display bucket folded from AttachmentType: DOCUMENTS | IMAGES | ACADEMIC | ADMINISTRATIVE | MEDIA | OTHER. */
  category: string;
  bytes: number;
  fileCount: number;
}

/**
 * Per-school storage usage for the school-detail Storage tab. Aggregated from
 * Attachment.fileSize on the backend.
 * Mirrors the planned backend dto/platform/PlatformStorageUsageDTO.
 */
export interface PlatformStorageUsageDTO {
  schoolId: string;
  totalBytes: number;
  /** Null until per-school / per-tier quotas are introduced. */
  quotaBytes: number | null;
  breakdown: StorageCategoryUsageDTO[];
  computedAt: string; // ISO datetime
}

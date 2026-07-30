export const FEATURE_REQUEST_STATUSES = [
  "NEW",
  "UNDER_REVIEW",
  "PLANNED",
  "IN_PROGRESS",
  "RELEASED",
  "DECLINED",
] as const;

export type FeatureRequestStatus = (typeof FEATURE_REQUEST_STATUSES)[number];

export const FEATURE_REQUEST_CATEGORIES = [
  "ACADEMICS",
  "SCHEDULING",
  "FINANCE",
  "HR",
  "COMMUNICATION",
  "GRADING",
  "TRANSPORT",
  "ATTENDANCE",
  "ENROLLMENT",
  "REPORTS",
  "MOBILE_APP",
  "INTEGRATIONS",
  "UI_UX",
  "OTHER",
] as const;

export type FeatureRequestCategory = (typeof FEATURE_REQUEST_CATEGORIES)[number];

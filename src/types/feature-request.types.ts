import type {
  FeatureRequestCategory,
  FeatureRequestStatus,
} from "@/constants/feature-request.constants";

export interface FeatureRequestListDTO {
  id: string;
  title: string;
  description: string;
  category: FeatureRequestCategory;
  status: FeatureRequestStatus;
  voteCount: number;
  commentCount: number;
  votedByCurrentSchool: boolean;
  pinned: boolean;
  submittedBySchoolName?: string | null;
  platformResponse?: string | null;
  createdAt: string;
  statusChangedAt?: string | null;
}

export interface FeatureRequestStatusHistoryDTO {
  oldStatus?: string | null;
  newStatus: string;
  note?: string | null;
  createdAt: string;
}

export interface FeatureRequestDetailDTO extends FeatureRequestListDTO {
  statusNote?: string | null;
  statusHistory: FeatureRequestStatusHistoryDTO[];
  updatedAt?: string | null;
}

export interface FeatureRequestCommentDTO {
  id: string;
  authorName: string;
  platformReply: boolean;
  body: string;
  createdAt: string;
}

export interface FeatureRequestPlatformStatsDTO {
  totalNew: number;
  totalUnderReview: number;
  totalPlanned: number;
  totalInProgress: number;
  totalReleased: number;
  totalDeclined: number;
  totalCount: number;
}

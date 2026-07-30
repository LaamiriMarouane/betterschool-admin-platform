import type {
  SupportTicketActivityType,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/constants/support-ticket.constants";

export interface SupportTicketListDTO {
  id: string;
  ticketNumber: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  schoolName: string;
  submittedByName: string;
  assignedToName?: string | null;
  messageCount: number;
  createdAt: string;
  lastReplyAt?: string | null;
  satisfactionRating?: number | null;
}

export interface SupportTicketAttachmentDTO {
  id: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  contentType: string;
  fileUrl?: string | null;
  createdAt: string;
}

export interface SupportTicketMessageDTO {
  id: string;
  senderName: string;
  platformReply: boolean;
  systemMessage: boolean;
  body: string;
  attachments?: SupportTicketAttachmentDTO[];
  createdAt: string;
}

export interface SupportTicketActivityLogDTO {
  activityType: SupportTicketActivityType;
  actorName: string;
  oldValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface SupportTicketDetailDTO extends SupportTicketListDTO {
  description: string;
  schoolSubdomain?: string | null;
  subscriptionPlanName?: string | null;
  resolutionNote?: string | null;
  satisfactionComment?: string | null;
  messages: SupportTicketMessageDTO[];
  activityLog: SupportTicketActivityLogDTO[];
  attachments?: SupportTicketAttachmentDTO[];
  updatedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface SupportTicketPlatformStatsDTO {
  totalOpen: number;
  totalInProgress: number;
  totalWaitingOnCustomer: number;
  totalResolved: number;
  totalClosed: number;
  unassignedCount: number;
  averageResolutionTimeHours?: number | null;
  averageSatisfaction?: number | null;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byAssignee: Record<string, number>;
}

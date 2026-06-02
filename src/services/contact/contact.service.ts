import type { ContactMessageStatus } from "@/constants/contact.constants";
import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types/common.types";
import type { ContactMessageDTO } from "@/types/contact.types";

export interface ContactMessagesQuery {
  page: number;
  size: number;
  search?: string | null;
  status?: ContactMessageStatus | null;
}

const BASE = "/platform/contact-messages";

/** Platform "Contact us" inbox API. Thin: build the request, return the typed response. */
export const contactService = {
  list: (query: ContactMessagesQuery): Promise<PaginatedResponse<ContactMessageDTO>> =>
    http.get<PaginatedResponse<ContactMessageDTO>>(BASE, {
      params: {
        page: query.page,
        size: query.size,
        search: query.search || undefined,
        status: query.status || undefined,
      },
    }),

  unreadCount: (): Promise<number> => http.get<number>(`${BASE}/unread-count`),

  updateStatus: (id: string, status: ContactMessageStatus): Promise<ContactMessageDTO> =>
    http.put<ContactMessageDTO>(`${BASE}/${id}/status`, { status }),

  delete: (id: string): Promise<void> => http.delete<void>(`${BASE}/${id}`),
};

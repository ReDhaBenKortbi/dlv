import { apiClient } from './ApiClient';
import type { DomainTicket, TicketRepo, TicketStatus } from '../../application/ports/TicketRepo';

interface ApiTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

function toTicket(api: ApiTicket): DomainTicket {
  return {
    id: api.id,
    userId: api.userId,
    userEmail: api.userEmail,
    subject: api.subject,
    message: api.message,
    status: api.status as TicketStatus,
    createdAt: new Date(api.createdAt),
  };
}

export function makeApiTicketRepo(): TicketRepo {
  return {
    async getAll(): Promise<DomainTicket[]> {
      const tickets = await apiClient.get<ApiTicket[]>('/tickets');
      return tickets.map(toTicket);
    },

    async resolve(id: string): Promise<void> {
      await apiClient.patch(`/tickets/${id}/resolve`);
    },

    async remove(id: string): Promise<void> {
      await apiClient.delete(`/tickets/${id}`);
    },
  };
}

import { api } from "../lib/api";
import { buildQuery } from "../lib/qs";
import type { Ticket, TicketStatus } from "../types/ticket";
import type { Paginated } from "../types/pagination";

export interface TicketsQuery {
  page?: number;
  limit?: number;
}

export const getTickets = (query: TicketsQuery = {}): Promise<Paginated<Ticket>> =>
  api(`/tickets${buildQuery(query)}`);

export const createTicket = (payload: {
  subject: string;
  message: string;
}): Promise<Ticket> =>
  api("/tickets", { method: "POST", body: JSON.stringify(payload) });

export const setTicketStatus = (
  id: string,
  status: TicketStatus,
): Promise<Ticket> =>
  api(`/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteTicket = (id: string): Promise<null> =>
  api(`/tickets/${id}`, { method: "DELETE" });

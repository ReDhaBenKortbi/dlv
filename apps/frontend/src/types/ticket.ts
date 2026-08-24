export type TicketStatus = "new" | "read" | "resolved";

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

// Pure domain Support Ticket type — no Firebase, no `any`.

export type TicketStatus = "new" | "read" | "resolved";

export interface DomainTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: Date;
}

export type CreateTicketInput = Omit<DomainTicket, "id" | "createdAt" | "status">;

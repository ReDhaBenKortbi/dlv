export type TicketStatus = 'NEW' | 'RESOLVED';

export interface DomainTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: Date;
}

export interface TicketRepo {
  getAll(): Promise<DomainTicket[]>;
  resolve(id: string): Promise<void>;
  remove(id: string): Promise<void>;
}

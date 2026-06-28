export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: any;
}

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  amount: string;
  receiptURL: string;
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
}

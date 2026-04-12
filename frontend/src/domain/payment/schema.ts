// Pure domain Payment types — no Firebase, no Timestamps.

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface DomainPaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  amount: string;
  receiptURL: string;
  status: PaymentStatus;
  createdAt: Date;
  processedAt?: Date;
}

export type CreatePaymentInput = Omit<DomainPaymentRequest, "id" | "createdAt" | "processedAt" | "status">;

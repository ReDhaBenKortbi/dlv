export type PaymentStatus = "pending" | "approved" | "rejected";

/** Domain entity — uses Date, never Firebase Timestamp. */
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

export type CreatePaymentInput = Omit<
  DomainPaymentRequest,
  "id" | "createdAt" | "processedAt" | "status"
>;

export interface PaymentRepo {
  getPending(): Promise<DomainPaymentRequest[]>;
  create(input: CreatePaymentInput): Promise<void>;
  updateStatus(
    id: string,
    status: PaymentStatus,
    processedAt: Date,
  ): Promise<void>;
}

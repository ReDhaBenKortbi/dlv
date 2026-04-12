import { apiClient } from './ApiClient';
import type {
  PaymentRepo,
  DomainPaymentRequest,
  CreatePaymentInput,
  PaymentStatus,
} from '../../application/ports/PaymentRepo';

interface ApiPayment {
  id: string;
  userId: string;
  userEmail: string;
  fullName: string;
  amount: string;
  receiptURL: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

function toPayment(api: ApiPayment): DomainPaymentRequest {
  return {
    id: api.id,
    userId: api.userId,
    userEmail: api.userEmail,
    fullName: api.fullName,
    amount: api.amount,
    receiptURL: api.receiptURL,
    status: api.status.toLowerCase() as PaymentStatus,
    createdAt: new Date(api.createdAt),
    processedAt: api.processedAt ? new Date(api.processedAt) : undefined,
  };
}

export function makeApiPaymentRepo(): PaymentRepo {
  return {
    async getPending(): Promise<DomainPaymentRequest[]> {
      const payments = await apiClient.get<ApiPayment[]>('/payments/pending');
      return payments.map(toPayment);
    },

    async create(input: CreatePaymentInput): Promise<void> {
      await apiClient.post('/payments/submit', {
        amount: input.amount,
        receiptURL: input.receiptURL,
      });
    },

    // The backend processes the payment and updates the user subscription
    // atomically in PATCH /payments/:id/process. The action mapping is:
    // "approved" → APPROVED, "rejected" → REJECTED.
    async updateStatus(id: string, status: PaymentStatus, _processedAt: Date): Promise<void> {
      await apiClient.patch(`/payments/${id}/process`, {
        action: status.toUpperCase(),
      });
    },
  };
}

import type { PaymentRepo, DomainPaymentRequest } from "../ports/PaymentRepo";

export function makeGetPendingPayments(paymentRepo: PaymentRepo) {
  return function getPendingPayments(): Promise<DomainPaymentRequest[]> {
    return paymentRepo.getPending();
  };
}

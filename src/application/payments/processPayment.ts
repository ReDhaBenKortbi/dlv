import type { PaymentRepo, PaymentStatus } from "../ports/PaymentRepo";
import type { UserRepo } from "../ports/UserRepo";
import type { Clock } from "../ports/Clock";

interface ProcessPaymentDeps {
  paymentRepo: PaymentRepo;
  userRepo: UserRepo;
  clock: Clock;
}

interface ProcessPaymentInput {
  requestId: string;
  userId: string;
  action: "approve" | "reject";
}

/**
 * Approve or reject a subscription payment request.
 * Phase 0: stub — tests will be RED.
 * Phase 3: replace with real implementation using computeSubscriptionEndDate from domain.
 */
export function makeProcessPayment(_deps: ProcessPaymentDeps) {
  return async function processPayment(
    _input: ProcessPaymentInput,
  ): Promise<void> {
    // stub
  };
}

export type { ProcessPaymentDeps, ProcessPaymentInput, PaymentStatus };

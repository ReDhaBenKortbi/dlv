import type { PaymentRepo, PaymentStatus } from "../ports/PaymentRepo";
import type { UserRepo } from "../ports/UserRepo";
import type { Clock } from "../ports/Clock";
import { computeSubscriptionEndDate } from "../../domain/subscription/policy";

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

export function makeProcessPayment(deps: ProcessPaymentDeps) {
  return async function processPayment(input: ProcessPaymentInput): Promise<void> {
    const { paymentRepo, userRepo, clock } = deps;
    const { requestId, userId, action } = input;
    const now = clock.now();

    if (action === "approve") {
      await paymentRepo.updateStatus(requestId, "approved", now);
      await userRepo.updateSubscription(userId, {
        isSubscribed: true,
        status: "approved",
        startDate: now,
        endDate: computeSubscriptionEndDate(now),
      });
    } else {
      await paymentRepo.updateStatus(requestId, "rejected", now);
      await userRepo.updateSubscription(userId, {
        isSubscribed: false,
        status: "none",
        startDate: null,
        endDate: null,
      });
    }
  };
}

export type { ProcessPaymentDeps, ProcessPaymentInput, PaymentStatus };

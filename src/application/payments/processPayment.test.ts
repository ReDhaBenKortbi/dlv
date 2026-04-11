import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeProcessPayment } from "./processPayment";
import type { PaymentRepo } from "../ports/PaymentRepo";
import type { UserRepo } from "../ports/UserRepo";
import type { Clock } from "../ports/Clock";

// ──────────────────────────────────────────────
// Fake implementations
// ──────────────────────────────────────────────

const makeFakePaymentRepo = (): PaymentRepo => ({
  getPending: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(undefined),
  updateStatus: vi.fn().mockResolvedValue(undefined),
});

const makeFakeUserRepo = (): UserRepo => ({
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(undefined),
  updateSubscription: vi.fn().mockResolvedValue(undefined),
  resetSubscriptionStatus: vi.fn().mockResolvedValue(undefined),
  setSubscribed: vi.fn().mockResolvedValue(undefined),
  subscribeToUser: vi.fn().mockReturnValue(() => {}),
});

const FIXED_NOW = new Date("2026-04-11T00:00:00.000Z");
const makeFakeClock = (now = FIXED_NOW): Clock => ({ now: () => now });

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("processPayment use case", () => {
  let paymentRepo: PaymentRepo;
  let userRepo: UserRepo;
  let processPayment: ReturnType<typeof makeProcessPayment>;

  beforeEach(() => {
    paymentRepo = makeFakePaymentRepo();
    userRepo = makeFakeUserRepo();
    processPayment = makeProcessPayment({
      paymentRepo,
      userRepo,
      clock: makeFakeClock(),
    });
  });

  // ── Approve ──────────────────────────────────

  describe("approve", () => {
    it("marks the payment request as approved with a processedAt timestamp", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "approve" });

      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(
        "pay-1",
        "approved",
        expect.any(Date),
      );
    });

    it("grants a 30-day subscription to the user", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "approve" });

      const expectedEnd = new Date("2026-05-11T00:00:00.000Z"); // 30 days later

      expect(userRepo.updateSubscription).toHaveBeenCalledWith("user-1", {
        isSubscribed: true,
        status: "approved",
        startDate: FIXED_NOW,
        endDate: expectedEnd,
      });
    });

    it("does not call resetSubscriptionStatus on approve", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "approve" });
      expect(userRepo.resetSubscriptionStatus).not.toHaveBeenCalled();
    });
  });

  // ── Reject ───────────────────────────────────

  describe("reject", () => {
    it("marks the payment request as rejected with a processedAt timestamp", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "reject" });

      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(
        "pay-1",
        "rejected",
        expect.any(Date),
      );
    });

    it("resets the user subscription to none on rejection", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "reject" });

      expect(userRepo.updateSubscription).toHaveBeenCalledWith("user-1", {
        isSubscribed: false,
        status: "none",
        startDate: null,
        endDate: null,
      });
    });

    it("does not grant subscription days on rejection", async () => {
      await processPayment({ requestId: "pay-1", userId: "user-1", action: "reject" });

      // The subscription update for a rejection must set endDate to null
      expect(userRepo.updateSubscription).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ endDate: null }),
      );
    });
  });
});

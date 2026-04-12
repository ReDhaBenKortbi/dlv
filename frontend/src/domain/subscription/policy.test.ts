import { describe, it, expect } from "vitest";
import {
  isSubscriptionExpired,
  computeSubscriptionEndDate,
  SUBSCRIPTION_DURATION_DAYS,
} from "./policy";

describe("isSubscriptionExpired", () => {
  it("returns true when end date is in the past", () => {
    const endDate = new Date("2024-01-01");
    const now = new Date("2026-04-11");
    expect(isSubscriptionExpired(endDate, now)).toBe(true);
  });

  it("returns false when end date is in the future", () => {
    const endDate = new Date("2027-01-01");
    const now = new Date("2026-04-11");
    expect(isSubscriptionExpired(endDate, now)).toBe(false);
  });

  it("treats exact equality as expired", () => {
    const date = new Date("2026-04-11T12:00:00Z");
    expect(isSubscriptionExpired(date, date)).toBe(true);
  });

  it("returns false for a subscription ending one millisecond from now", () => {
    const now = new Date("2026-04-11T12:00:00.000Z");
    const endDate = new Date("2026-04-11T12:00:00.001Z");
    expect(isSubscriptionExpired(endDate, now)).toBe(false);
  });
});

describe("computeSubscriptionEndDate", () => {
  it(`adds ${SUBSCRIPTION_DURATION_DAYS} days to the start date`, () => {
    const start = new Date("2026-04-11T00:00:00.000Z");
    const end = computeSubscriptionEndDate(start);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(SUBSCRIPTION_DURATION_DAYS);
  });

  it("does not mutate the start date", () => {
    const start = new Date("2026-04-11");
    const original = start.getTime();
    computeSubscriptionEndDate(start);
    expect(start.getTime()).toBe(original);
  });

  it("returns a new Date instance", () => {
    const start = new Date("2026-04-11");
    const end = computeSubscriptionEndDate(start);
    expect(end).not.toBe(start);
  });
});

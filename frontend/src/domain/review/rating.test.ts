import { describe, it, expect } from "vitest";
import {
  computeNewAverageRating,
  computeRatingAfterDeletion,
} from "./rating";

describe("computeNewAverageRating", () => {
  it("returns the rating itself when this is the first review (prevTotal = 0)", () => {
    expect(computeNewAverageRating(0, 0, 5)).toBe(5);
  });

  it("computes the weighted average for the second review", () => {
    // prevAvg=4, prevTotal=1, newRating=2 → (4*1 + 2) / 2 = 3
    expect(computeNewAverageRating(4, 1, 2)).toBe(3);
  });

  it("computes the weighted average correctly for many reviews", () => {
    // prevAvg=3, prevTotal=10, newRating=5 → (3*10 + 5) / 11 ≈ 3.18...
    const result = computeNewAverageRating(3, 10, 5);
    expect(result).toBeCloseTo(35 / 11, 5);
  });

  it("returns a value in the range [1, 5] for valid ratings", () => {
    const result = computeNewAverageRating(3, 10, 5);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(5);
  });
});

describe("computeRatingAfterDeletion", () => {
  it("returns 0 when the only review is deleted (prevTotal = 1)", () => {
    expect(computeRatingAfterDeletion(5, 1, 5)).toBe(0);
  });

  it("recalculates average correctly after removing a review", () => {
    // prevAvg=3, prevTotal=2, removedRating=2 → (3*2 - 2) / (2-1) = 4
    expect(computeRatingAfterDeletion(3, 2, 2)).toBe(4);
  });

  it("handles deletion from a large set", () => {
    // prevAvg=3, prevTotal=10, removedRating=3 → (30-3)/9 = 3
    expect(computeRatingAfterDeletion(3, 10, 3)).toBeCloseTo(3, 5);
  });

  it("never returns a negative value", () => {
    const result = computeRatingAfterDeletion(1, 1, 5);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

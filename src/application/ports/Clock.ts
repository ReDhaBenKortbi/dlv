/**
 * Clock port — abstracts the current time so use cases are deterministic in tests.
 */
export interface Clock {
  now(): Date;
}

/** Production implementation — replace in tests with a fixed date. */
export const systemClock: Clock = { now: () => new Date() };

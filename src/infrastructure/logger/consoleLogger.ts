import type { Logger } from "../../application/ports/Logger";

export const consoleLogger: Logger = {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, context ?? "");
  },

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context ?? "");
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error ?? "", context ?? "");
  },
};

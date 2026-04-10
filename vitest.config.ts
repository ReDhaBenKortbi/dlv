import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // node environment avoids loading heavy jsdom on /mnt/d/ (Windows FS via WSL2)
    // Add @vitest/browser or per-file `@vitest-environment jsdom` annotation for React tests
    pool: "threads",
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/application/**"],
      thresholds: { lines: 80 },
    },
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

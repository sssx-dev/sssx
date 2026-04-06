import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    // Run test files sequentially since E2E and stress tests
    // share the example project directory
    fileParallelism: false,
  },
});

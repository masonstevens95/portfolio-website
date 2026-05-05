import { defineConfig } from "vitest/config";

// Standalone vitest config (does NOT extend vite.config.ts) so the
// federation plugin and its live-remote fetches don't run during tests.
// Pure-function tests live in node environment; we'll add jsdom only if
// we ever need to test components that touch the DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});

import { defineConfig } from "@playwright/test";

// Browser checks run against the production build, in the Google Chrome that
// is already installed, so no extra browser download is needed.
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  use: { baseURL: "http://localhost:3100", channel: "chrome" },
  webServer: {
    command: "pnpm build && pnpm start --port 3100",
    // Its own build folder, so a preview server on .next keeps working.
    env: { NEXT_DIST_DIR: ".next-test" },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});

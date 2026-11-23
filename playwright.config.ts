import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

config({ path: [".env.local", ".env"], quiet: true });

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * Local smoke tests (H1). They need a seeded database and the demo
 * credentials in .env.local. Run with `pnpm test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: `${baseURL}/login`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

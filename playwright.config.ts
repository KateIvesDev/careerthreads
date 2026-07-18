import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const remote = !baseURL.startsWith("http://localhost");

export default defineConfig({
  testDir: "./tests/e2e",
  // E2E flows intentionally share one seeded demo profile.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    httpCredentials: process.env.DEMO_ACCESS_PASSWORD ? { username: "careerthread", password: process.env.DEMO_ACCESS_PASSWORD } : undefined,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: remote ? undefined : {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI && process.env.PLAYWRIGHT_ISOLATED !== "1",
  },
});

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3107", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3107/api/health/live",
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3107",
      APP_HOSTNAME: "127.0.0.1",
      PORT: "3107",
    },
  },
});

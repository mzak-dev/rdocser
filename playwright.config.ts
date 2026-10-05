/** Optional real-browser acceptance checks for layout, routes and interactive document cards. */
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: { baseURL: "http://localhost:5173", viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "npm run dev", url: "http://localhost:5173", reuseExistingServer: !process.env.CI },
});

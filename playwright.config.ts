import { defineConfig, devices } from '@playwright/test';

// Runs against the full local stack (RUNNING.md: Docker -> NestJS :3001 ->
// FastAPI :8000 -> Next :3000), never in CI - see e2e/journey.spec.ts and
// Documentation/Testing/MASTER_TEST_PLAN.md for why.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});

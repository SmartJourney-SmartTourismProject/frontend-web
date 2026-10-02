import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, STORAGE_STATE } from './e2e/env';

// Runs against the full local stack (RUNNING.md: Docker -> NestJS -> FastAPI
// -> Next), never in CI - see e2e/journey.spec.ts and
// Documentation/Testing/MASTER_TEST_PLAN.md for why.
//
// The addresses come from .env.local (see e2e/env.ts) instead of being written
// here, because they have to agree with the redirect URI registered for
// `smartjourney-web` in the Keycloak realm. A hard-coded port is how this
// suite ended up testing an unrelated app that happened to be listening.
const port = new URL(BASE_URL).port || '3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  projects: [
    // Signs in once and writes the session to STORAGE_STATE; everything below
    // starts already authenticated (the signed-out test opts back out).
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: BASE_URL,
    reuseExistingServer: true,
    // A cold `next dev` compiles on first request; 60s was tight on this app.
    timeout: 120_000,
  },
});

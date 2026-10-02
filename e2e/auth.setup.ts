import { expect, test as setup } from '@playwright/test';
import { API_URL, E2E_PASSWORD, E2E_USERNAME, SEEDED_TRIP_TITLE, STORAGE_STATE } from './env';
import { ensureTestUser } from './keycloak-admin';

/**
 * Runs once before the journeys and leaves behind the two things they used to
 * be skipped for: a real signed-in session, and a saved trip to find.
 *
 * The session is obtained the way a person gets one - Keycloak's own login
 * form, the real authorization-code round-trip, the real next-auth cookie.
 * Nothing is stubbed, so a green journey still means sign-in works.
 */

setup('sign in as a traveler and seed a trip', async ({ page, request, baseURL }) => {
  // Guard against the mistake this suite was failing on: another project's app
  // answering on the port we point at. Reusing a running dev server is a big
  // time saver, but only when it is the right server.
  await page.goto('/');
  await expect(
    page,
    `${baseURL} is serving a different application. Start SmartJourney's frontend there (RUNNING.md), ` +
      `or set NEXTAUTH_URL in .env.local to the port it is really on.`,
  ).toHaveTitle(/SmartJourney/i);

  await ensureTestUser();

  // /login forwards straight to Keycloak (AuthCard's autoRedirect), so there
  // is no button to press here - wait for the realm's form to arrive.
  await page.goto('/login?callbackUrl=%2Fhome');
  await page.waitForURL(/\/realms\/[^/]+\/protocol\/openid-connect\/auth/, { timeout: 30_000 });

  await page.locator('#username').fill(E2E_USERNAME);
  await page.locator('#password').fill(E2E_PASSWORD);
  await page.locator('#kc-login, button[type="submit"], input[type="submit"]').first().click();

  // Back on the app, signed in. Waiting for the URL alone would accept the
  // callback route mid-flight, so wait for something only a session renders.
  await page.waitForURL(/\/home/, { timeout: 30_000 });
  await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible({ timeout: 30_000 });

  await page.context().storageState({ path: STORAGE_STATE });

  await seedSavedTrip(page, request);
});

/**
 * Gives the account one saved trip, through the same API the "Save itinerary"
 * button calls. The access token comes from /api/auth/session, which is where
 * the app's own axios client reads it (src/lib/api.ts), so this is the app's
 * normal write path rather than a direct database insert - a trip seeded that
 * way could be shaped in a way the API would never produce.
 */
async function seedSavedTrip(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
): Promise<void> {
  const session = (await (await page.request.get('/api/auth/session')).json()) as {
    access_token?: string;
  };
  expect(session.access_token, 'no access token on the next-auth session').toBeTruthy();
  const auth = { Authorization: `Bearer ${session.access_token}` };

  const existing = (await (await request.get(`${API_URL}/trips`, { headers: auth })).json()) as {
    title: string | null;
  }[];
  if (existing.some((trip) => trip.title === SEEDED_TRIP_TITLE)) return;

  const created = await request.post(`${API_URL}/trips`, {
    headers: auth,
    data: {
      title: SEEDED_TRIP_TITLE,
      destination: 'Kandy',
      travelers: 2,
      currency: 'LKR',
      // No dates: the list filters drafts to trips that have not ended, and a
      // fixed date would quietly start failing once it fell into the past.
      itinerary: [
        {
          day: 1,
          items: [
            {
              time: '09:00',
              type: 'attraction',
              name: 'Temple of the Sacred Tooth Relic',
              lat: 7.2936,
              lon: 80.6413,
            },
          ],
        },
      ],
    },
  });
  expect(created.ok(), `seeding a trip failed: ${created.status()} ${await created.text()}`).toBeTruthy();
}

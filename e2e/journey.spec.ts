import { expect, test } from '@playwright/test';
import { SEEDED_TRIP_TITLE } from './env';

/**
 * Runs against the full local stack only (Docker + Keycloak + both APIs -
 * see RUNNING.md), never in CI: excluded from every GitHub Actions workflow
 * on purpose (Documentation/Testing/MASTER_TEST_PLAN.md §3.1.3). Run with
 * `npm run test:e2e` after RUNNING.md's startup order.
 *
 * The signed-in journeys sign in for real: e2e/auth.setup.ts seeds a traveler
 * account through Keycloak's admin API, drives the realm's own login form, and
 * saves the resulting session for these tests to reuse. Nothing is stubbed, so
 * a green run still means Keycloak, next-auth and NestJS all work together.
 */

test.describe('signed out', () => {
  // The signed-in state is applied to this project by default; these two lines
  // take it away, which is the whole point of the test below.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('an unauthenticated visitor hitting a protected route is sent to /login', async ({ page, request }) => {
    // The middleware's redirect, read without following it. `callbackUrl` is a
    // contract, not a detail: /login reads that exact parameter to come back to
    // the page the visitor wanted (AuthCard), so the name is worth asserting.
    const redirect = await request.get('/home', { maxRedirects: 0 });
    expect(redirect.status()).toBe(307);
    expect(redirect.headers().location).toMatch(/\/login\?callbackUrl=%2Fhome$/);

    // And what a person actually sees: /login forwards straight on to
    // Keycloak's form, so the journey ends at the realm's sign-in page.
    await page.goto('/home');
    await expect(page).toHaveURL(/\/realms\/[^/]+\/protocol\/openid-connect\/auth/);
  });
});

test('a signed-in traveler on /home sees the chat panel', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
});

test('a saved itinerary appears in /saved-itineraries', async ({ page }) => {
  await page.goto('/saved-itineraries');
  // Named, not "the first link on the page": the sidebar and header are links
  // too, so `getByRole('link').first()` would have passed on an empty list.
  await expect(page.getByRole('link', { name: SEEDED_TRIP_TITLE })).toBeVisible();
});

test('a non-admin visiting /admin is redirected away, not shown the dashboard', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).not.toHaveURL(/\/admin$/);
  // Signed in but without the role, the middleware sends them to /login
  // carrying where they tried to go - it does not render the dashboard.
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
});

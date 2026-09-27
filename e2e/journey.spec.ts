import { expect, test } from '@playwright/test';

/**
 * Runs against the full local stack only (Docker + Keycloak + both APIs -
 * see RUNNING.md), never in CI: excluded from every GitHub Actions workflow
 * on purpose (Documentation/Testing/MASTER_TEST_PLAN.md §3.1.3). Run with
 * `npm run test:e2e` after `RUNNING.md`'s startup order.
 *
 * These need a real signed-in Keycloak session and seeded data (a saved
 * itinerary, an admin account) that this repo does not script the creation
 * of yet - see that same doc's Special Considerations for what to seed
 * before they'll pass.
 */

test('an unauthenticated visitor hitting a protected route is sent to /login', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveURL(/\/login\?callbackUrl=/);
});

test('a signed-in traveler on /home sees the chat panel', async ({ page }) => {
  // Requires a pre-authenticated storage state - see playwright's
  // authentication guide; not wired up in this repo yet (no scripted way
  // to obtain a Keycloak session token headlessly). Skipped rather than
  // faked, so a green run means what it says.
  test.skip(true, 'needs a seeded, pre-authenticated Keycloak session (see file header)');
  await page.goto('/home');
  await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
});

test('a saved itinerary appears in /saved-itineraries', async ({ page }) => {
  test.skip(true, 'needs a seeded, pre-authenticated Keycloak session and an existing saved trip');
  await page.goto('/saved-itineraries');
  await expect(page.getByRole('link').first()).toBeVisible();
});

test('a non-admin visiting /admin is redirected away, not shown the dashboard', async ({ page }) => {
  test.skip(true, 'needs a seeded, pre-authenticated traveler (non-admin) Keycloak session');
  await page.goto('/admin');
  await expect(page).not.toHaveURL(/\/admin/);
});

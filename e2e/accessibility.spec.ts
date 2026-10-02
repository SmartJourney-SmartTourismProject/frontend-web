import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Accessibility testing (WCAG 2.0/2.1 A and AA), via axe-core in a real browser.
 *
 * `next lint` already runs six jsx-a11y rules, but those are static checks over
 * JSX source: they can see a missing `alt`, not a contrast ratio, not a heading
 * order that only exists once three components have rendered together, and not
 * a dialog that traps focus. This suite runs against the rendered page, signed
 * in, with real data from the API - which is the only place most of those
 * defects exist.
 *
 * Scope note: axe finds roughly a third to a half of WCAG issues. A clean run
 * here is not a claim of conformance, and does not replace a keyboard-only or
 * screen-reader pass. It is the automatable part, run automatically.
 */

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Asserts on a one-line-per-violation summary rather than on axe's raw result.
 * Asserting the raw object buries the finding in several hundred lines of diff;
 * this way the failure output names the rule, the impact and the element that
 * has to be fixed.
 */
async function expectNoViolations(page: Page, label: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();

  const summary = violations.flatMap((v) =>
    v.nodes.map(
      (n) =>
        `[${v.impact}] ${v.id} @ ${n.target.join(' ')} — ${v.help}\n    ` +
        // The CSS selector alone is often ambiguous (".mt-6" could be anything);
        // the markup says which element to go and change.
        n.html.replace(/\s+/g, ' ').slice(0, 120),
    ),
  );

  expect(summary, `${label}: WCAG A/AA violations`).toEqual([]);
}

test.describe('signed out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('the landing page has no WCAG A/AA violations', async ({ page }) => {
    await page.goto('/');
    await expectNoViolations(page, 'Landing page (/)');
  });
});

test('the chat page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/home');
  // Scan the page a user sees, not a skeleton: axe would otherwise pass a
  // loading state that has none of the real controls on it.
  await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
  await expectNoViolations(page, 'Chat (/home)');
});

test('the explore page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expectNoViolations(page, 'Explore (/explore)');
});

test('the saved itineraries page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/saved-itineraries');
  await expect(page.getByRole('heading', { name: /saved itineraries/i })).toBeVisible();
  await expectNoViolations(page, 'Saved itineraries (/saved-itineraries)');
});

test('the budget tracker has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/budget-tracker');
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expectNoViolations(page, 'Budget tracker (/budget-tracker)');
});

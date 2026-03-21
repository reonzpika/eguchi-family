import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Smoke: every app page and API route responds without server error (5xx).
 * Unauthenticated: pages redirect to sign-in; APIs return 3xx/401/405, not 500.
 * Chromium only: same coverage in one browser to keep CI time reasonable.
 */

const UUID = '00000000-0000-0000-0000-000000000000';

const PAGE_PATHS: string[] = [
  '/',
  '/sign-in',
  '/ideas',
  '/ideas/new',
  '/ideas/new-result',
  `/ideas/${UUID}`,
  `/ideas/${UUID}/chat`,
  `/ideas/${UUID}/validate`,
  `/ideas/${UUID}/upgrade`,
  '/projects',
  `/projects/${UUID}`,
  '/feed',
  '/notifications',
  '/settings',
  '/menu',
  '/missions',
  '/tools',
  '/tools/new',
  `/tools/${UUID}`,
  `/tools/${UUID}/missions/${UUID}`,
  `/tools/${UUID}/threads`,
  `/tools/${UUID}/threads/${UUID}`,
  '/discussions',
  `/discussions/${UUID}`,
  '/inspiration',
  '/learning',
  '/showcase',
  '/discovery',
  '/admin',
  '/admin/health',
  '/admin/members',
  '/admin/hub',
];

/** GET-able API paths (including POST-only routes to assert 405, not 500). */
const API_PATHS: string[] = [
  '/api/auth/status',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/cron/friday-reminder',
  '/api/discovery/status',
  '/api/me/stats',
  '/api/ideas',
  `/api/ideas/${UUID}`,
  '/api/projects',
  `/api/projects/${UUID}`,
  `/api/projects/${UUID}/activity`,
  `/api/projects/${UUID}/milestones`,
  '/api/activity-feed',
  '/api/reflections',
  '/api/comments',
  '/api/notifications',
  '/api/hub/featured',
  '/api/hub/threads',
  `/api/hub/threads/${UUID}`,
  '/api/hub/missions',
  `/api/hub/missions/${UUID}`,
  '/api/hub/tools',
  `/api/hub/tools/${UUID}`,
  `/api/hub/posts/${UUID}`,
  '/api/admin/members',
];

function assertNoServerError(status: number, label: string) {
  expect.soft(status, label).toBeLessThan(500);
}

test.describe('Route smoke (all paths)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');
  test.setTimeout(120_000);

  /** Use HTTP GET (no browser) so dev server is not starved while other E2E tests run in parallel. */
  test('every page returns a non-5xx response', async ({ request }) => {
    for (const path of PAGE_PATHS) {
      const res = await request.get(path, { maxRedirects: 0 });
      assertNoServerError(res.status(), `GET ${path} → ${res.status()}`);
    }
  });

  test('every listed API GET returns a non-5xx response', async ({ request }) => {
    for (const path of API_PATHS) {
      const res = await request.get(path, { maxRedirects: 0 });
      assertNoServerError(res.status(), `GET ${path} → ${res.status()}`);
    }
  });
});

test.describe('Authenticated API smoke', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');
  test.setTimeout(120_000);
  test.skip(
    () => !process.env.E2E_PASSWORD?.trim(),
    'set E2E_PASSWORD for authenticated route checks',
  );

  async function signInWithE2E(page: Page) {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(\?|$)/, { timeout: 20000 });
  }

  test('session can GET key APIs without 5xx', async ({ page }) => {
    await signInWithE2E(page);
    const request = page.context().request;

    const authedPaths = [
      '/api/ideas',
      '/api/projects',
      '/api/activity-feed',
      '/api/notifications',
      '/api/me/stats',
      '/api/discovery/status',
      '/api/hub/featured',
      '/api/hub/threads',
      '/api/hub/missions',
      '/api/hub/tools',
    ];

    for (const path of authedPaths) {
      const res = await request.get(path);
      assertNoServerError(res.status(), `GET ${path} (authed) → ${res.status()}`);
    }
  });
});

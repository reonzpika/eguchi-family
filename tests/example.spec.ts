import { test, expect } from '@playwright/test';

/**
 * Family Workspace app tests aligned with docs/USER_FLOWS.md.
 * Sign-in and protected routes; no test user required for smoke tests.
 */

test.describe('Sign-in page', () => {
  test('loads and shows sign-in UI', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: /江口ファミリーハブ/ })).toBeVisible();
    await expect(page.getByText(/家族のプライベートワークスペース/)).toBeVisible();
    await expect(page.getByText('誰ですか？')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.getByRole('button', { name: /次へ/ })).toBeVisible();
  });

  test('has family member dropdown options', async ({ page }) => {
    await page.goto('/sign-in');

    await page.getByRole('combobox').selectOption({ index: 1 });
    const value = await page.getByRole('combobox').inputValue();
    expect(value).toBeTruthy();
  });

  test('after selecting member and 次へ, shows password step', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption({ index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Protected routes', () => {
  test('redirects to sign-in when visiting home unauthenticated', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting ideas unauthenticated', async ({ page }) => {
    await page.goto('/ideas');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting projects unauthenticated', async ({ page }) => {
    await page.goto('/projects');

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Onboarding (unauthenticated)', () => {
  test('redirects to sign-in when visiting onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting feed', async ({ page }) => {
    await page.goto('/feed');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting notifications', async ({ page }) => {
    await page.goto('/notifications');

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe('Authenticated flows (require E2E credentials)', () => {
  test.skip(!process.env.E2E_PASSWORD, 'Set E2E_PASSWORD and E2E_MEMBER_ID to run authenticated tests');

  test('after sign-in, home shows welcome or ideas CTA', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(\?|onboarding|$)/, { timeout: 10000 });
    await expect(
      page.getByText(/ようこそ|アイデアを追加する|アイデア/)
    ).toBeVisible({ timeout: 5000 });
  });

  test('authenticated user can open projects list', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(\?|onboarding|$)/, { timeout: 10000 });
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByText(/プロジェクト|まだプロジェクトがありません|マイルストーン|内容/)).toBeVisible({ timeout: 5000 });
  });
});

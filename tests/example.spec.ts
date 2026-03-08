import { test, expect } from '@playwright/test';

/**
 * Family Workspace app tests aligned with docs/USER_FLOWS.md.
 * Sign-in and protected routes; no test user required for smoke tests.
 */

test.describe('Sign-in page', () => {
  test('loads and shows sign-in UI', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: /Family Workspace/ })).toBeVisible();
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

test.describe('New idea and other routes (unauthenticated)', () => {
  test('redirects to sign-in when visiting new idea page', async ({ page }) => {
    await page.goto('/ideas/new');

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
    await expect(page).toHaveURL(/\/(discovery|\?|$)/, { timeout: 10000 });
    const url = new URL(page.url());
    if (url.pathname === '/discovery') {
      await page.context().addCookies([
        { name: 'discovery_completed', value: '1', domain: url.hostname, path: '/' },
      ]);
      await page.goto('/');
    }
    await expect(page).toHaveURL(/\/(\?|$)/);
    await expect(
      page.getByText(/ようこそ|アイデアを追加する|アイデア|家族の活動|まだアクティビティはありません/).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('ideas page FAB links to new idea chat', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(discovery|\?|$)/, { timeout: 10000 });
    const url = new URL(page.url());
    if (url.pathname === '/discovery') {
      await page.context().addCookies([
        { name: 'discovery_completed', value: '1', domain: url.hostname, path: '/' },
      ]);
      await page.goto('/');
    }
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/ideas/);
    await page.getByRole('link', { name: /＋/ }).click();
    await expect(page).toHaveURL(/\/ideas\/new/);
    await expect(page.getByText(/アイデアを育てる|準備しています|メッセージを入力/)).toBeVisible({ timeout: 10000 });
  });

  test('idea chat header hides on scroll down and shows on scroll up', async ({ page }) => {
    test.skip(!process.env.E2E_PASSWORD, 'E2E_PASSWORD required');
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto('/sign-in', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    const memberSelect = page.getByTestId('sign-in-member-select');
    await expect(memberSelect).toBeVisible({ timeout: 15000 });
    await memberSelect.selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(discovery|\?|$)/, { timeout: 10000 });
    const url = new URL(page.url());
    if (url.pathname === '/discovery') {
      await page.context().addCookies([
        { name: 'discovery_completed', value: '1', domain: url.hostname, path: '/' },
      ]);
      await page.goto('/');
    }
    await page.goto('/ideas/new');
    await expect(page.getByText(/メッセージを入力|準備しています|アイデアを育てる/)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
    const saveBtn = page.getByRole('button', { name: /保存/ });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await expect(page.getByText(/保存しました/)).toBeVisible({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/ideas/);
    const ideaLink = page.getByTestId('idea-card-link').first();
    await expect(ideaLink).toBeVisible({ timeout: 5000 });
    const href = await ideaLink.getAttribute('href') ?? '';
    const pathname = href.startsWith('http') ? new URL(href).pathname : href;
    const match = pathname.match(/^\/ideas\/([^/?#]+)(?:\/|$)/);
    const ideaId = match ? match[1] : null;
    if (!ideaId || ideaId === 'new' || ideaId.includes('/')) {
      throw new Error(`Could not get idea id from ideas list. href=${href} pathname=${pathname} ideaId=${ideaId}`);
    }
    await page.goto(`/ideas/${ideaId}/chat`);
    await expect(page).toHaveURL(/\/ideas\/[^/]+\/chat/);
    const header = page.getByTestId('idea-chat-header');
    const scrollContainer = page.getByTestId('idea-chat-scroll');
    await expect(header).toBeVisible();
    await expect(scrollContainer).toBeVisible();
    // Establish baseline at top so lastScrollTopRef starts at 0.
    await scrollContainer.evaluate((el) => {
      (el as HTMLDivElement).scrollTop = 0;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    await page.waitForTimeout(100);
    const canScrollPastThreshold = await scrollContainer.evaluate((el) => {
      const d = el as HTMLDivElement;
      return (d.scrollHeight - d.clientHeight) > 50;
    });
    if (canScrollPastThreshold) {
      // Scroll down: should hide header.
      await scrollContainer.evaluate((el) => {
        const d = el as HTMLDivElement;
        d.scrollTop = Math.min(200, d.scrollHeight - d.clientHeight);
        d.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
      await page.waitForTimeout(400);
      await expect(header).toHaveClass(/-translate-y-full/);
      // Scroll up: should show header.
      await scrollContainer.evaluate((el) => {
        const d = el as HTMLDivElement;
        d.scrollTop = Math.max(0, d.scrollTop - 60);
        d.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
      await page.waitForTimeout(400);
      await expect(header).toHaveClass(/translate-y-0/);
      await expect(header).not.toHaveClass(/-translate-y-full/);
    } else {
      // Not enough content to scroll: header should always be visible.
      await expect(header).toHaveClass(/translate-y-0/);
      await expect(header).not.toHaveClass(/-translate-y-full/);
    }
  });

  test('authenticated user can open projects list', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(discovery|\?|$)/, { timeout: 10000 });
    const url = new URL(page.url());
    if (url.pathname === '/discovery') {
      await page.context().addCookies([
        { name: 'discovery_completed', value: '1', domain: url.hostname, path: '/' },
      ]);
    }
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(
      page.getByText(/プロジェクト|まだプロジェクトがありません|マイルストーン|内容/).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

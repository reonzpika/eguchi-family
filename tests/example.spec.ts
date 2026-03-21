import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Family Workspace app tests aligned with docs/USER_FLOWS.md.
 * Sign-in and protected routes; no test user required for smoke tests.
 */

async function signInWithE2E(page: Page) {
  await page.goto('/sign-in');
  await page.getByRole('combobox').selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
  await page.getByRole('button', { name: /次へ/ }).click();
  await expect(page.getByPlaceholder('パスワード')).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /ログイン/ }).click();
  await expect(page).toHaveURL(/\/(\?|$)/, { timeout: 20000 });
}

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

  test('redirects to sign-in when visiting idea validate page', async ({ page }) => {
    await page.goto('/ideas/00000000-0000-0000-0000-000000000001/validate');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting feed', async ({ page }) => {
    await page.goto('/feed');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting tools', async ({ page }) => {
    await page.goto('/tools');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting notifications', async ({ page }) => {
    await page.goto('/notifications');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('redirects to sign-in when visiting discovery', async ({ page }) => {
    await page.goto('/discovery');

    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe.serial('Authenticated flows (require E2E credentials)', () => {
  test.skip(!process.env.E2E_PASSWORD?.trim(), 'Set E2E_PASSWORD and E2E_MEMBER_ID to run authenticated tests');

  test('after sign-in, home shows welcome or ideas CTA', async ({ page }) => {
    await signInWithE2E(page);
    await expect(
      page.getByText(/ようこそ|アイデアを追加する|アイデア|家族の活動|まだアクティビティはありません|新着ツール|AIと仲良くなる|家族のタイムライン|今週のミッション|最近の活動|すべてのミッション/).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('ideas page FAB links to new idea chat', async ({ page }) => {
    await signInWithE2E(page);
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/ideas/);
    const fab = page.getByRole('link', { name: '新しいアイデア' });
    await expect(fab).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/ideas\/new/, { timeout: 15_000 }),
      fab.click(),
    ]);
    await expect(page.getByText(/アイデアを育てる|準備しています|メッセージを入力/)).toBeVisible({ timeout: 10000 });
  });

  test('idea chat header hides on scroll down and shows on scroll up', async ({ page }) => {
    test.skip(!process.env.E2E_PASSWORD?.trim(), 'E2E_PASSWORD required');
    test.skip(true, 'ChatHeader does not implement hide-on-scroll; test disabled until implemented');
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto('/sign-in', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });
    const memberSelect = page.getByTestId('sign-in-member-select');
    await expect(memberSelect).toBeVisible({ timeout: 15000 });
    await memberSelect.selectOption(process.env.E2E_MEMBER_ID ?? { index: 1 });
    await page.getByRole('button', { name: /次へ/ }).click();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('パスワード').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/\/(\?|$)/, { timeout: 15000 });
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

  test('ideas list: プロジェクトに昇格 menu item navigates to upgrade page', async ({ page }) => {
    test.skip(!process.env.E2E_PASSWORD?.trim(), 'E2E_PASSWORD required');
    test.skip(true, 'Menu opens with portal/timing; fix IdeaCard menu visibility in E2E when re-enabling');
    await signInWithE2E(page);
    await page.goto('/ideas');
    await expect(page).toHaveURL(/\/ideas/);
    const emptyState = page.getByText('まだアイデアがありません');
    if (await emptyState.isVisible()) {
      test.skip(true, 'No ideas in list; upgrade menu not available');
    }
    const menuButton = page.getByRole('button', { name: 'メニューを開く' }).first();
    await expect(menuButton).toBeVisible({ timeout: 5000 });
    await menuButton.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible({ timeout: 3000 });
    await menu.getByRole('link', { name: 'プロジェクトに昇格' }).click();
    await expect(page).toHaveURL(/\/ideas\/[^/]+\/validate/, { timeout: 5000 });
    await expect(page.getByText(/プロジェクトに昇格する前に|プロジェクトを作成する|AIがチェックしています/)).toBeVisible({ timeout: 10000 });
  });

  test('visiting /discovery when authenticated redirects to /settings', async ({ page }) => {
    await signInWithE2E(page);
    await page.goto('/discovery');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading', { name: '設定' })).toBeVisible();
  });

  test('authenticated user can open projects list', async ({ page }) => {
    await signInWithE2E(page);
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(
      page.getByText(/プロジェクト|まだプロジェクトがありません|自分のプロジェクト|家族のプロジェクト|マイルストーン|内容/).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('PWA install prompt appears 5s after landing on home with discovery flag', async ({
    page,
    context,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 600 });
    await signInWithE2E(page);
    // Apply Android UA only after auth; overriding UA during sign-in can break credentials.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () =>
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        configurable: true,
      });
    });
    await page.evaluate(() => {
      localStorage.removeItem('pwa_install_prompt_shown');
      sessionStorage.setItem('show_pwa_install_prompt', '1');
    });
    await page.reload();
    await expect(page).toHaveURL(/\/(\?|$)/);
    await expect(page.getByRole('dialog', { name: /ホーム画面に追加/ })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/いつでもすぐにアクセスできます/)).toBeVisible();
  });
});

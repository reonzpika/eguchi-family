# Idea upgrade button fix (executed)

## Goal

Fix "プロジェクトに昇格" in the IdeaCard 3-dot menu so it reliably navigates to `/ideas/[id]/upgrade`.

## What was done

1. **IdeaCard** ([src/components/ideas/IdeaCard.tsx](src/components/ideas/IdeaCard.tsx))  
   - Replaced the "プロジェクトに昇格" `<button>` with a Next.js `<Link href={/ideas/${idea.id}/upgrade}>` so navigation is native and does not depend on `router.push` in a portal callback.  
   - Kept `onClick` to close the menu and optionally call `onMoveToProject?.(idea)`.

2. **Playwright**  
   - Added test "ideas list: プロジェクトに昇格 menu item navigates to upgrade page" in the authenticated block: opens menu, clicks link, asserts URL and upgrade page content. Skips when the ideas list is empty.

## Verification

- Unauthenticated tests: `npx playwright test --grep-invert "Authenticated flows"` — 27 passed.
- Authenticated tests (including the new upgrade test) run when `E2E_PASSWORD` is set; new test skips when there are no ideas.

## Phase 2 (optional, not done)

Validation step before upgrade (`/ideas/[id]/validate` + API) remains pending per the earlier plan.

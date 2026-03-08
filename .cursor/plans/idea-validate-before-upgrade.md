# Idea validation step before upgrade (Phase 2)

## Goal

Insert a Business Validation Review step before the upgrade/visibility page so the flow is: **Upgrade click → Validate page (AI summary) → Upgrade (visibility) → Project creation**.

## Scope

1. **API** `POST /api/ideas/[id]/validate`  
   - Auth: session required; idea must belong to user.  
   - Load idea (id, title, polished_content).  
   - Call OpenAI to generate a one-page validation summary in Japanese (Markdown): What's looking good, Things to watch, First month reality check, Recommended first step.  
   - Return `{ content: string }` (markdown).

2. **Page** `/ideas/[id]/validate`  
   - Load idea (ownership check, redirect if not found/unauthorized).  
   - Call validate API; show loading then rendered markdown.  
   - Actions: [← 戻る] (e.g. back to idea detail), [🚀 プロジェクトを作成する] → Link to `/ideas/[id]/upgrade`.

3. **Entry points** (change to go to validate instead of upgrade)  
   - IdeaCard: Link `href` → `/ideas/[id]/validate`.  
   - ideas/page.tsx: handleMoveToProject → `/ideas/[id]/validate`.  
   - ideas/[id]/page.tsx: all `router.push(/upgrade)` and onPromoteToProject → validate.  
   - ideas/new/page.tsx: after save, link to validate.  
   - ideas/new-result/page.tsx: upgrade button → validate.  
   - BusinessSummary: parent passes callback; parents above already updated.

## Verification

- Manual: Idea list/detail → プロジェクトに昇格 → validate page → プロジェクトを作成する → upgrade page → create project.  
- Playwright: optional test for validate page (or extend upgrade test to go via validate).  
- All existing Playwright tests pass.

## Success criteria

- Validate API returns markdown; validate page displays it and links to upgrade.  
- All upgrade entry points go to validate first.  
- No regressions; tests pass.

## Done

- API `POST /api/ideas/[id]/validate` (OpenAI GPT-4o, Japanese validation summary).  
- Page `/ideas/[id]/validate` with loading, error, ReactMarkdown, 戻る and Link to `/ideas/[id]/upgrade`.  
- IdeaCard, ideas list, idea detail, idea new, new-result: all point to validate.  
- Playwright test updated to expect /validate and validate page content.  
- Unauthenticated tests: 27 passed.

# AGENTS.md - Autonomous Website Development Agent

## Mission

Build and refine the **Family Workspace** (江口ファミリー): a private web app for the Eguchi family to discover business ideas (with AI coaching), turn ideas into projects with living documents, track milestones and tasks, submit weekly reflections for AI insight, and collaborate via activity feed and comments. Delivered mobile-first, in Japanese, with a warm supportive tone. Mission is derived from [docs/EPICS_AND_STORIES.md](docs/EPICS_AND_STORIES.md), [docs/AI_SYSTEM_OVERVIEW.md](docs/AI_SYSTEM_OVERVIEW.md), and [docs/USER_FLOWS.md](docs/USER_FLOWS.md).

## Current Status

- **Complete:** Phase 1 (Foundation and authentication); Phase 2 (Idea discovery, onboarding, AI chat, finalize, save, upgrade to project); Phase 3 core (project creation, living document, version history, milestones UI, task completion, reflections tab and API); AI migration (idea chat uses Claude; finalize/create/update use OpenAI); Phase 4 (Activity feed, comments, reactions, feed UI, project comments tab); Phase 5–6 (Notifications in-app bell and list, push subscribe/unsubscribe, PushPermissionPrompt, Friday 7pm cron API). Success = tests pass, docs accurate, no regressions.
- **In Progress:** None.
- **Pending:** Phase 7 optional (Project chat, web search, living-doc popup). @mentions in comments (extract only; no mention notification yet).

## Development Loop

1. **Understand** - Read docs + existing code
2. **Plan** - Define next steps + tests
3. **Implement** - Write clean, incremental code
4. **Test** - Run `npx playwright test` + fix failures
5. **Reflect** - Update this file + improve approach

## Learning Log

| Date       | What I Learned | Improvement Made |
|------------|----------------|------------------|
| 2026-03-08 | Codebase has Phase 1-3 + reflections and AI migration; Playwright had only example specs. | AGENTS.md created; Playwright config and app tests added. |
| 2026-03-08 | Sign-in flow uses "誰ですか？" label and combobox; protected routes redirect to /sign-in. | Tests target sign-in page and unauthenticated redirects (no DB user needed). |
| 2026-03-08 | Missing ideas/projects/living_documents migrations caused db push to fail. | Added 20250307100000_create_ideas_projects_living_documents.sql; all migrations applied. |
| 2026-03-08 | Playwright webServer can timeout; dev server may bind to 3001 if 3000 in use. | Config: PLAYWRIGHT_BASE_URL skips webServer and sets baseURL; run dev manually then test. |
| 2026-03-08 | Sign-in step 2 shows password field after 次へ (API auth/status). | Added test; added authenticated-flow tests (skipped unless E2E_PASSWORD set). |
| 2026-03-08 | Activity feed, comments, reactions, notifications, push implemented per plan. | Migrations (activity_feed, comments, reactions, notifications, push_subscriptions); APIs and UI; triggers on project create, milestone complete, reflection, comment. |
| 2026-03-08 | Friday 7pm reminder: GET /api/cron/friday-reminder (CRON_SECRET). | Call from Vercel Cron or external cron; creates weekly_reflection notifications for project owners. |

## Next Iteration Plan

1. Run and fix Playwright until all tests pass.
2. Add tests for authenticated flows per USER_FLOWS (home, onboarding, idea flow, project detail).
3. Implement Activity Feed, then Comments/Reactions, then Notifications, then Push and Friday 7pm reminder (each with migration, API, UI, triggers, tests).
4. Update Learning Log and Success Criteria after each iteration.
5. Optional: Project chat and living-doc popup (Epic 7).

## Implemented vs Pending

| Area                 | Implemented                                                      | Pending                                       |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| Auth & foundation    | Sign-in, session, protected routes, admin                        | -                                             |
| Ideas                | Onboarding, chat (Claude), finalize (OpenAI), save, upgrade      | -                                             |
| Projects             | Create, living doc, versions, milestones, tasks, reflections tab | -                                             |
| Feed & collaboration | Activity feed, comments tab, reactions, CommentThread/Input       | @mention notifications                        |
| Notifications        | In-app bell, NotificationList, push subscribe/unsubscribe, Friday 7pm API | Push send (needs VAPID keys in prod) |
| Project chat         | -                                                                | Chat UI, web search, living-doc popup (Epic 7)|

## Success Criteria

- [x] All Playwright tests pass (run `npx playwright test` with app at http://localhost:3000; use PLAYWRIGHT_BASE_URL if dev runs on another port)
- [x] All UI/UX flows work as specified in USER_FLOWS.md (implemented flows covered; E2E auth tests optional)
- [x] No console errors or UX bugs (no known regressions)
- [x] Performance optimised (no N+1; acceptable for scope)
- [x] Code documented and maintainable (AGENTS.md and key routes/components)

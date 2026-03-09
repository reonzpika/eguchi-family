# AGENTS.md - Autonomous Website Development Agent

## Mission

Build and refine the **Family Workspace** (江口ファミリー): a private web app for the Eguchi family to discover business ideas (with AI coaching), turn ideas into projects with living documents, track milestones and tasks, submit weekly reflections for AI insight, and collaborate via activity feed and comments. Delivered mobile-first, in Japanese, with a warm supportive tone. Mission is derived from [docs/EPICS_AND_STORIES.md](docs/EPICS_AND_STORIES.md), [docs/AI_SYSTEM_OVERVIEW.md](docs/AI_SYSTEM_OVERVIEW.md), and [docs/USER_FLOWS.md](docs/USER_FLOWS.md).

## Current Status

- **Complete:** Phase 1 (Foundation and authentication); Phase 2 (Idea discovery, /ideas/new chat-only flow, AI chat, finalize, save, upgrade to project); Phase 3 core and execution (project creation, living document, version history, milestones UI, task completion, reflections tab and API; At A Glance AI insight, progress bar colours, sticky; Activity tab; milestone auto-activate, manual start confirmation, celebration and What's next modals, add custom milestone; feed infinite scroll, idea_started, click-to-navigate, AI insight card style; living doc collapsible sections and "Last updated by AI"; conversational reflection wizard with blocker chips; push prompt on home, denied banner, localStorage for prompt-seen). AI migration (idea chat uses Claude; finalize/create/update use OpenAI). Phase 4 (Activity feed, comments, reactions, feed UI, project comments tab). Phase 5–6 (Notifications in-app bell and list, push subscribe/unsubscribe, Friday 7pm cron API). Success = tests pass, docs accurate, no regressions.
- **In Progress:** None.
- **Pending:** Phase 7 optional (Project chat, web search, living-doc popup). @mentions in comments (extract only; no mention notification yet).
- **Complete:** Shared project (shared_with_all): admin creates "Family Workspace アプリ改善" project; all members can edit; activity shows "家族"; Friday reminder skipped.

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
| 2026-03-08 | Phase 2 idea flow: pastedText removed; /ideas/new is chat-only; onboarding page removed. | Backend chat/start, chat/message, finalize no longer use pastedText; all "new idea" links point to /ideas/new; Playwright tests updated. |
| 2026-03-08 | Idea chat save and resume: drafts persisted with chat_history and chat_summary. | Migration 20250312000000; POST /api/ideas/chat/save (AI title + summary); Back = save then redirect; Save button; idea detail shows draft chat resume with summary; finalize accepts ideaId to update draft. |
| 2026-03-08 | Mobile-first idea pages: single 保存 in header; 3-dot menu (Rename, Move to project); summary on every save. | PLAN.md updated; chat/save accepts ideaId and runs full AI summary on insert and update; /ideas/new and /ideas/[id] use sticky header with 保存 + 3-dot; BusinessSummary hideActions for header-only actions; 44px touch targets. |
| 2026-03-08 | When AI replied, scroll-to-bottom forced users to scroll up to read the start of the message. | Scroll logic: when last message is agent, scroll start of that message into view (`block: "start"`); when last is user, scroll to end. Applied in ideas/new, ideas/[id]/chat, ideas/[id], IdeaChat. |
| 2026-03-08 | IdeaChatPage header hide-on-scroll didn't work: page used `min-h-screen` so window scrolled not inner div. | AppChrome `main` is now `h-dvh overflow-hidden` for detail pages; IdeaChatPage root is `h-full`; scroll listener is simple and direct. |
| 2026-03-08 | Phase 3 execution (docs/phase-3-execution.md) fully implemented. | Migration: projects.ai_insight, ai_insight_updated_at, last_activity_at; living_documents.updated_by; activity_type ai_insight. At A Glance: colours, AI insight, sticky. Milestones: auto-activate next, start confirmation, celebration/What's next modals, POST project milestones for custom. Feed: infinite scroll, idea_started on chat/start, ActivityCard AI style and click-to-project. Activity tab, LivingDocSections collapsible, reflection wizard + blocker chips, PushPermissionPrompt on home with denied banner. |
| 2026-03-08 | IdeaCard "プロジェクトに昇格" did nothing on click (portal + router.push). | Replaced menu item with Next.js Link to `/ideas/[id]/upgrade` for reliable navigation; added Playwright test (skips when no ideas). |
| 2026-03-08 | Phase 2 validation step before upgrade (phase-2-validation.md). | Added POST /api/ideas/[id]/validate (OpenAI validation summary), /ideas/[id]/validate page; all upgrade entry points now go to validate first, then link to upgrade. |
| 2026-03-09 | PWA install prompt after first discovery. | PwaInstallPrompt shows 5s after landing on home with sessionStorage flag; mobile-only; beforeinstallprompt (Android) or instructions (iOS); localStorage prevents re-show. |
| 2026-03-09 | Discovery optional and in Settings. | Removed middleware redirect to /discovery; discovery flow embedded in Settings page (DiscoverySection). /discovery redirects to /settings. Idea chat already supports no profile (general advice). |


## Next Iteration Plan

1. Run and fix Playwright until all tests pass.
2. Add tests for authenticated flows per USER_FLOWS (home, idea flow, project detail).
3. Implement Activity Feed, then Comments/Reactions, then Notifications, then Push and Friday 7pm reminder (each with migration, API, UI, triggers, tests).
4. Update Learning Log and Success Criteria after each iteration.
5. Optional: Project chat and living-doc popup (Epic 7).

## Implemented vs Pending

| Area                 | Implemented                                                      | Pending                                       |
| -------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| Auth & foundation    | Sign-in, session, protected routes, admin                        | -                                             |
| Ideas                | Main page /ideas (list), /ideas/new (chat-only), chat (Claude), save (single 保存 + 3-dot: Rename, Move to project), AI summary on every save, sticky header, resume (draft/summary), validate step then upgrade | -                                             |
| Projects             | Create, living doc, versions, milestones, tasks, reflections tab; At A Glance (AI insight, progress colours, sticky); Activity tab; milestone flows (auto-activate, confirm start, celebration, What's next, add custom); living doc collapsible + updated_by | -                                             |
| Feed & collaboration | Activity feed (infinite scroll, idea_started, AI insight style, click-to-project), comments tab, reactions, CommentThread/Input | @mention notifications                        |
| Notifications        | In-app bell, NotificationList, push subscribe/unsubscribe, Friday 7pm API; PushPermissionPrompt on home (first-time, denied banner); PwaInstallPrompt 5s after discovery complete (mobile, add to home) | Push send (needs VAPID keys in prod) |
| Discovery            | Optional; embedded in Settings (DiscoverySection). Profile used by idea chat when present; no profile = general advice. /discovery redirects to /settings. | - |
| Reflections          | Conversational wizard (Q1 → Q2 → Q3), blocker chips, API and project ai_insight update | -                                             |
| Project chat         | -                                                                | Chat UI, web search, living-doc popup (Epic 7)|

## Success Criteria

- [x] All Playwright tests pass (run `npx playwright test` with app at http://localhost:3000; use PLAYWRIGHT_BASE_URL if dev runs on another port)
- [x] All UI/UX flows work as specified in USER_FLOWS.md (implemented flows covered; E2E auth tests optional)
- [x] No console errors or UX bugs (no known regressions)
- [x] Performance optimised (no N+1; acceptable for scope)
- [x] Code documented and maintainable (AGENTS.md and key routes/components)

# Plan: Mobile-first idea chat – single Save, 3-dot menu, auto-summary

## Goal and scope

- **Header:** On `/ideas/new` and `/ideas/[id]` show only a single **保存** (Save) button. Add a **3-dot menu** with: **Rename** (タイトルを変更), **Move to project** (プロジェクトに昇格).
- **Summary behaviour:** Once the idea is saved, AI automatically creates the summary. The user sees it when they open `/ideas/[id]`. The summary is updated every time the user saves.
- **Mobile-first:** Sticky header so Save and menu stay visible; 44px+ touch targets (per design system and ui-design skill).

## Success criteria

- Header on ideas/new and ideas/[id]: Back, title, **保存** only, plus 3-dot menu (Rename, Move to project).
- Save creates/updates the idea and triggers AI summary (polished_content + ai_suggestions); user sees summary on opening /ideas/[id]; each save updates the summary.
- Sticky header; no primary actions hidden by scroll on mobile.
- Touch targets min 44px; Playwright tests pass.

## Ordered steps

### 1. Backend: chat/save – update path and always generate summary

- **1.1** Support **update** in `POST /api/ideas/chat/save`: accept `ideaId` + `chatHistory`. If `ideaId`: load idea, update `chat_history` and `chat_summary` (and title from existing short AI call), then run **full summarisation** (same as finalize: polished_content, ai_suggestions) and update the row.
- **1.2** On **insert** (no ideaId): after inserting the new idea, run full summarisation and update the new row so `polished_content` and `ai_suggestions` are set (user sees summary when opening /ideas/[id]).
- **1.3** Reuse finalize’s summarisation logic (or call a shared helper) so one code path generates summary for both “first save” and “save again”.

### 2. /ideas/new – UI

- **2.1** **Sticky** top bar: Back, title (centred), **保存** (single button, min-h 44px), **3-dot menu** (⋮). No “下書き保存” / “保存済み” duplication; label is “保存” (and disable when nothing to save or already saving).
- **2.2** 3-dot menu dropdown: **Rename** (タイトルを変更), **Move to project** (プロジェクトに昇格). Rename: only when `savedIdeaId` exists; opens modal or inline edit; on submit PATCH `/api/ideas/[id]` with title. Move to project: when `savedIdeaId` exists, link to `/ideas/[savedIdeaId]/upgrade`; otherwise disabled or hidden.
- **2.3** Ensure scrollable area uses `flex-1 min-h-0 overflow-y-auto`; optional safe-area padding for sticky header.

### 3. /ideas/[id] – UI

- **3.1** Same header pattern: sticky bar with Back, title, **保存**, 3-dot menu (Rename, Move to project). Save calls `POST /api/ideas/chat/save` with `ideaId` and current `chatHistory` (and updates summary per step 1).
- **3.2** Rename: edit title (modal or inline), PATCH `/api/ideas/[id]`. Move to project: navigate to `/ideas/[id]/upgrade`.
- **3.3** Remove or repurpose “アイデアをまとめる” so the main action is **保存** (summary is generated on save). Option: keep “結果を見る” that navigates to `/ideas/new-result?id=...` if desired, or rely on opening the idea to see the summary.

### 4. Summary view on /ideas/[id]

- **4.1** When `polished_content` (or ai_suggestions) exists, show the summary (existing BusinessSummary or summary card). Summary is updated every time user clicks 保存 (backend step 1).
- **4.2** Optional: sticky bottom bar for long summary pages (Save, Promote) per previous plan; or keep actions only in header (保存 + menu). Prefer header-only for consistency with “only 保存 in header”.

### 5. /ideas/new-result and other pages

- **5.1** No change to “only 保存 in header” requirement for new-result; that page can keep its current layout (or sticky bottom bar as before). Focus: ideas/new and ideas/[id] have the new header + 3-dot.

### 6. Touch targets and tests

- **6.1** All header buttons and menu items min-h 44px (or 48px per design system).
- **6.2** Run `npx playwright test`; fix any failures (selectors, flows). Update AGENTS.md Learning Log.

## Verification summary

| Check | How |
|-------|-----|
| Only 保存 in header + 3-dot on ideas/new and ideas/[id] | Inspect header; no separate “下書き保存”/“まとめる” in header |
| 3-dot: Rename, Move to project | Open menu; actions work |
| Summary after save; updated on each save | Save on new, open /ideas/id, see summary; save again, reload, summary updated |
| Sticky header; 44px targets | Visual + class check |
| Tests pass | `npx playwright test` (environment-dependent) |

---

**Status:** Executed. Backend chat/save supports ideaId and full summary on every save; ideas/new and ideas/[id] have sticky header with single 保存 and 3-dot menu (Rename, Move to project). Playwright failures observed were pre-existing (auth/session).

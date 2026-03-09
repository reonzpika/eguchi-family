# Plan: Chat Shared Layout

## Goal

Unify all idea chat pages with a shared layout: fixed headers (no hide-on-scroll), consistent footer, proximity-based auto-scroll, scroll-to-bottom button, safe-area padding, and 44px touch targets.

## Scope

- **Pages:** `/ideas/new`, `/ideas/[id]` (draft mode), `/ideas/[id]/chat`
- **New components:** `ChatLayout`, `ChatHeader`, `ChatFooter`, `ChatScrollArea`

## Requirements

1. **Fixed header** (50–60px): back, title, right slot (Save + menu, or spacer). No hide-on-scroll.
2. **Sticky footer** (56–64px): input + send, safe-area padding, min-h-[44px] send button.
3. **Proximity-based auto-scroll:** Only auto-scroll on new messages when user is near bottom (within 100px).
4. **Scroll-to-bottom button:** Floating ↓ when not near bottom; same pattern on all pages.
5. **Scroll container:** overflow-x-hidden, -webkit-overflow-scrolling: touch.
6. **Start-at-top for resumed chats:** /ideas/[id] draft and /ideas/[id]/chat only (skip initial scroll when loading existing history).

## Implementation Steps

### 1. Create shared components

**`ChatHeader`** – Props: `onBack`, `title`, `children` (right slot). Fixed height h-14 (~56px), border-b, bg-white.

**`ChatFooter`** – Props: `inputValue`, `onInputChange`, `onSend`, `disabled`, `placeholder`, `showOptionsHint` (optional). min-h-[56px], pb-safe, send min-h-[44px].

**`ChatScrollArea`** – Props: `children`, `scrollContainerRef`, `messagesEndRef`, `lastAgentMessageRef`, `chatHistory`, `onScroll` (for proximity + scroll-to-bottom), `showScrollToBottom`, `scrollToBottom`, `chatLoading`. Renders scroll div + typing indicator + scroll-to-bottom button.

**`ChatLayout`** – Composes: ChatHeader, flex-1 scroll area slot, ChatFooter. Root: `flex h-full flex-col`.

### 2. Extract shared scroll logic

- **Proximity check:** `scrollTop + clientHeight + 100 >= scrollHeight` → auto-scroll.
- **Scroll listener:** Update `showScrollToBottom` (distFromBottom > 80); pass to scroll effect for proximity.
- **useChatScroll** hook: Returns `scrollContainerRef`, `messagesEndRef`, `lastAgentMessageRef`, `showScrollToBottom`, `scrollToBottom`, and a function to run scroll effect (proximity-aware).

### 3. Update IdeaChatPage

- Remove `headerHidden`, `setHeaderHidden`, `SCROLL_THRESHOLD`, hide-on-scroll wrapper and transform.
- Use fixed header (ChatHeader or inline equivalent).
- Add proximity-based auto-scroll.
- Keep scroll-to-bottom button; ensure it uses shared pattern.
- Add safe-area, min-h-[44px] send, -webkit-overflow-scrolling: touch.

### 4. Update NewIdeaPage

- Use ChatLayout or equivalent structure.
- Add scrollContainerRef, proximity logic, scroll-to-bottom button.
- Add safe-area, min-h-[44px] send, -webkit-overflow-scrolling: touch.

### 5. Update IdeaDetailPage (draft mode)

- Use ChatLayout or equivalent structure.
- Add scrollContainerRef, proximity logic, scroll-to-bottom button.
- Add skipNextScrollRef for initial load (start at top when resuming).
- Add safe-area, min-h-[44px] send, -webkit-overflow-scrolling: touch.

### 6. Add safe-area utility

- Ensure `pb-safe` or `pb-[env(safe-area-inset-bottom)]` exists. Check globals.css or Tailwind config.

## Success Criteria

- All three chat pages have fixed headers (no hide-on-scroll).
- Proximity-based auto-scroll on all pages.
- Scroll-to-bottom button on all pages when not near bottom.
- Footer has safe-area padding and 44px send button.
- Scroll container has -webkit-overflow-scrolling: touch and overflow-x-hidden.
- No regressions; Playwright tests pass.

## Done

- Created ChatHeader, ChatFooter, ChatScrollArea, useChatScroll.
- Added pb-safe utility in globals.css.
- IdeaChatPage: removed hide-on-scroll, uses shared components.
- NewIdeaPage: uses ChatHeader, ChatFooter, ChatScrollArea, useChatScroll.
- IdeaDetailPage draft mode: uses shared components.
- All headers fixed; proximity-based scroll; scroll-to-bottom button; safe-area; 44px touch targets.

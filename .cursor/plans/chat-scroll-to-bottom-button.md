# Plan: Start at top + scroll-to-bottom button in IdeaChatPage

## Goal

1. On initial load, start at the top of the chat (don't auto-scroll to the last message).
2. Add a floating "scroll to bottom" button (↓) that appears when the user is not near the bottom, and smoothly scrolls to the latest message when tapped.

## Scope

`src/app/(app)/ideas/[id]/chat/page.tsx` only.

## Approach

### 1. Start at top on load

- Add `skipNextScrollRef = useRef(false)`.
- In the fetch effect, after `setChatHistory(history)`, if `history.length > 0` set `skipNextScrollRef.current = true`.
- In the `chatHistory` scroll effect: if `skipNextScrollRef.current` is true, set it to false and return early (skip auto-scroll). This preserves normal auto-scroll for all user/AI messages after initial load.

### 2. Scroll-to-bottom button

- Add `showScrollToBottom` state (boolean, default false).
- In the scroll listener: after direction detection, compute `distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight`. Set `showScrollToBottom = distFromBottom > 80`.
- Also set `showScrollToBottom = false` when `scrollTop` reaches near the bottom.
- Wrap the scroll container in a `relative` div. Position the button absolute, bottom-right, above the input (outside the scroll div).
- Button: circular, 40×40px, border, bg-white, shadow-md, ↓ icon, aria-label="最新メッセージへ". Clicking calls `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`.
- Button only renders when `showScrollToBottom` is true.

## Success criteria

- Page opens at the top of the conversation (not the last message).
- A "↓" button appears when the user scrolls up away from the bottom.
- Clicking the button smoothly scrolls to the bottom.
- Auto-scroll still works for new messages sent in the session.
- No regressions.

## Done

- Implemented in `src/app/(app)/ideas/[id]/chat/page.tsx`: `skipNextScrollRef` to skip auto-scroll on initial load; `showScrollToBottom` state and scroll listener; floating "↓" button (aria-label 最新メッセージへ) when >80px from bottom; `scrollToBottom()`.
- Fixed pre-existing Playwright strict-mode: `getByText(...).first()` in "after sign-in, home shows..." and "authenticated user can open projects list". Authenticated tests that depend on sign-in completing may still fail if E2E credentials or server state are not set up.

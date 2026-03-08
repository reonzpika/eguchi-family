# Plan: Chat scroll UX when AI answers

## Goal

When the AI replies in the idea chat, the view currently scrolls to the very bottom. The user then has to scroll up to read the beginning of the message and scroll down again. Fix so that when a new AI message appears, the view shows the **start** of that message (user can read from the top and scroll down naturally).

## Scope

- **Pages:** `src/app/(app)/ideas/new/page.tsx` (NewIdeaPage), `src/app/(app)/ideas/[id]/chat/page.tsx` (IdeaChatPage), `src/app/(app)/ideas/[id]/page.tsx` (IdeaDetailPage).
- **Component:** `src/components/ideas/IdeaChat.tsx` (used in idea flows; apply same logic if it renders chat with scroll).
- **No change** to scroll behaviour when the user sends a message: still scroll to bottom so the user sees their message and the loading indicator.

## Approach

1. **When the last message is from the agent:** Scroll the **start** of the last (agent) message into view using a ref on that message element and `scrollIntoView({ behavior: "smooth", block: "start" })`.
2. **When the last message is from the user** (or only loading): Keep current behaviour: scroll the end anchor into view (bottom).
3. **Implementation:** Add a ref (e.g. `lastAgentMessageRef`) that is attached to the last message when it is from the agent. In the existing `useEffect` that runs on `chatHistory` change, branch: if last message is agent, scroll `lastAgentMessageRef` with `block: "start"`; else scroll `messagesEndRef` as today.

## Steps

1. **ideas/new/page.tsx**
   - Add `lastAgentMessageRef`.
   - In the message list, attach the ref to the wrapper of the last message when `msg.role === "agent"` and it's the last item (e.g. `idx === chatHistory.length - 1`).
   - In the scroll `useEffect`: if `chatHistory.length > 0` and last message is agent, scroll `lastAgentMessageRef` with `block: "start"`; else scroll `messagesEndRef`.
2. **ideas/[id]/chat/page.tsx**
   - Same pattern: add ref, attach to last agent message, branch in useEffect.
3. **ideas/[id]/page.tsx**
   - Same pattern (locate the chat message list and scroll effect, apply same logic).
4. **IdeaChat.tsx**
   - Same pattern if this component is used in a scrollable idea chat context; otherwise leave as-is if usage is different.
5. **Verify:** Run Playwright tests; manually confirm that after sending a message, when the AI replies the view shows the top of the reply and the user can read downward without scrolling up first.

## Success criteria

- When an AI message is added, the view scrolls so the **beginning** of that message is visible.
- When the user sends a message, the view still scrolls to the bottom (user message + loader visible).
- No new regressions; existing tests pass.

## Done

- Implemented in `ideas/new/page.tsx`, `ideas/[id]/chat/page.tsx`, `ideas/[id]/page.tsx`, and `IdeaChat.tsx`. Scroll effect: if last message is agent, scroll last agent message into view with `block: "start"`; else scroll to end. Playwright failures observed are pre-existing (sign-in / protected routes), not related to this change.

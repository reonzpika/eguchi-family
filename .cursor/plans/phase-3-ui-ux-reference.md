# Phase 3 UI/UX Reference: Reuse idea chatbot patterns

Use this as the source of truth for any Phase 3 UI that is conversational, chat-like, or form/wizard. **Copy the code and patterns below** so we don’t regress the improved idea chatbot UX.

**Reference files:**  
- [src/app/(app)/ideas/[id]/chat/page.tsx](src/app/(app)/ideas/[id]/chat/page.tsx) (IdeaChatPage)  
- [src/app/(app)/ideas/[id]/page.tsx](src/app/(app)/ideas/[id]/page.tsx) (draft chat block)  
- [src/app/(app)/ideas/new/page.tsx](src/app/(app)/ideas/new/page.tsx) (NewIdeaPage)  
- [src/components/ui/ChatMarkdown.tsx](src/components/ui/ChatMarkdown.tsx)

---

## 1. Layout and structure

- **Root:** `flex h-full flex-col` or `flex h-screen flex-col overflow-hidden` so the inner scroll area is constrained (no window scroll). For pages under AppChrome detail routes, use `h-full` so the chrome’s `h-dvh overflow-hidden` main works.
- **Header:** Sticky, `border-b border-border-warm bg-white px-4 py-3`. Left: back/primary action (min-h-[44px], h-11 w-11). Centre: truncated title `text-center text-sm font-semibold`. Right: primary CTA + optional 3-dot menu. All tap targets **min-h-[44px]**.
- **Scroll area:** `flex-1 min-h-0` (critical so flex doesn’t grow past viewport), `overflow-y-auto`, `space-y-4 pb-4`. Use a **ref** on this div for scroll listeners (hide header, “scroll to bottom” FAB).
- **Input/footer:** `border-t border-border-warm bg-white pt-4`; keep as `shrink-0` so it doesn’t collapse.

---

## 2. Scroll behaviour (copy exactly)

- **Refs:** `messagesEndRef` (div at end of message list), `lastAgentMessageRef` (attached to the last message when `msg.role === "agent"` and `idx === chatHistory.length - 1`).
- **When last message is agent:**  
  `lastAgentMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });`  
  So the user sees the **start** of the AI message and can read down (no scrolling up to find the beginning).
- **When last message is user:**  
  `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });`  
  So the user sees their message and the loading indicator.
- **Initial load with history:** Use a ref (e.g. `skipNextScrollRef`) to do one-time scroll to end with `behavior: "auto"` and then clear the flag so the normal effect doesn’t fight it.

---

## 3. Hide header on scroll (optional; IdeaChatPage pattern)

- **Ref:** `scrollContainerRef` on the scrollable div.
- **State:** `headerHidden`.
- **Listener:** On scroll, if `scrollTop > 50` and scrolling down → set `headerHidden(true)`; if scrolling up or `scrollTop <= 50` → set `headerHidden(false)`. Keep `lastScrollTopRef` for direction.
- **Header wrapper:** Fixed height (e.g. `h-[69px]`), `overflow-hidden`, `transition-[height] duration-200`; when hidden use `h-0`. Header inside uses `transition-transform`, `-translate-y-full` when hidden so layout doesn’t jump.
- **Content padding:** When `headerHidden`, reduce top padding (e.g. `pt-0`) so content doesn’t have a gap.

---

## 4. “Scroll to bottom” FAB

- **State:** `showScrollToBottom` when `scrollHeight - scrollTop - clientHeight > 80`.
- **Button:** Absolute position (e.g. `bottom-6 right-0`), `h-10 w-10`, rounded-full, border, shadow, `aria-label="最新メッセージへ"`. On click: `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`.

---

## 5. Message bubbles (copy classes)

- **Agent:**  
  `max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white`  
  Content: `<ChatMarkdown>{msg.content}</ChatMarkdown>`.
- **User:**  
  `max-w-[85%] rounded-2xl rounded-br-sm border-2 border-border-warm bg-white px-4 py-3 text-sm text-foreground`  
  Content: `<ChatMarkdown>{content}</ChatMarkdown>`.
- **Quick options (under agent message):**  
  `flex flex-wrap gap-2`; each button: `rounded-full border-2 border-primary bg-white px-4 py-2 text-xs font-semibold text-primary transition-transform active:scale-[0.95] disabled:opacity-50`.

---

## 6. Loading indicator

Three bouncing dots (same as idea chat):

```tsx
<div className="flex gap-1">
  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
</div>
```

---

## 7. Input row

- **Container:** `flex gap-2`.
- **Input:**  
  `flex-1 rounded-xl border border-border-warm bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50`  
  Enter to submit (no shift); `onKeyDown`: if `e.key === "Enter" && !e.shiftKey` then `e.preventDefault()` and send.
- **Submit button:**  
  `rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50`  
  Disabled when `!currentInput.trim() || chatLoading`.

---

## 8. Modals

- **Overlay:** `fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4`, click overlay to close (stopPropagation on content).
- **Content:** `max-w-[350px]` or `max-w-sm`, `rounded-2xl border border-border-warm bg-white p-4 shadow-lg`. For scrollable body: `scrollbar-hide max-h-[80vh] overflow-y-auto`.
- **Buttons:** Primary full-width or two buttons `flex gap-2`; each **min-h-[44px]**, `rounded-xl`, primary vs border.

---

## 9. Error display

- Use `<ErrorMessage message={chatError} />` in a `shrink-0 mb-4` block **above** the scroll area so it doesn’t get pushed away.

---

## 10. Touch and accessibility

- Every interactive element **min-h-[44px]** (or h-11 w-11). Buttons: `transition-transform active:scale-[0.97]` or `active:scale-[0.98]`.
- Menu: `aria-expanded`, `aria-haspopup="true"`. Scroll-to-bottom: `aria-label="最新メッセージへ"`.
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title.

---

## Where to apply in Phase 3

- **Weekly reflection (conversational wizard):** Use the same layout (sticky header, scroll area, input/footer), same scroll logic if multi-step messages appear in a thread, same bubble styling and ChatMarkdown for AI acknowledgments, same input row and loading dots. Optionally reuse “scroll to bottom” and hide-on-scroll if the reflection flow has a long scrollable thread.
- **Any new “chat-like” or step-by-step AI flow:** Reuse this document; prefer extracting a shared `ConversationLayout` or `ChatBubble` from the idea pages and importing in Phase 3 so behaviour and styles stay in sync.

# Plan: Hide IdeaChatPage header on scroll down

## Goal

Hide the sticky header (back button + title) on IdeaChatPage when the user scrolls down, so more content is visible. Show the header again when the user scrolls up or when near the top of the chat.

## Scope

- **File:** `src/app/(app)/ideas/[id]/chat/page.tsx` (IdeaChatPage only).
- **Element:** The `<header class="sticky top-0 z-10 ...">` containing ←, title, and spacer.

## Approach

1. Track scroll position (and direction) on the scrollable chat container (`div.flex-1.overflow-y-auto`).
2. When user scrolls **down** past a small threshold (e.g. 50px), hide the header (e.g. `transform: translateY(-100%)` with transition).
3. When user scrolls **up** or scroll position is near the top (e.g. ≤ threshold), show the header again.
4. Keep layout stable: wrap the header in a fixed-height wrapper so when the header slides up it doesn’t cause content jump (wrapper keeps same height, header moves up inside it).

## Steps

1. Add ref for the scroll container (`scrollContainerRef`).
2. Add ref for previous scroll top (`lastScrollTopRef`) and state for `headerHidden` (boolean).
3. Add scroll listener on the scroll container: compare current scrollTop to previous; if scrolling down and scrollTop > 50, set headerHidden true; if scrolling up or scrollTop ≤ 50, set headerHidden false. Update lastScrollTopRef.
4. Wrap the header in a wrapper div with fixed height (e.g. match header height) and `shrink-0`. Apply to header: `transition-transform`, and when `headerHidden`: `-translate-y-full` (Tailwind).
5. Verify: scroll down in chat → header hides; scroll up or to top → header shows. No layout jump.

## Success criteria

- Header hides when user scrolls down past threshold.
- Header reappears when user scrolls up or when scroll is near top.
- Smooth transition; no layout jump (reserved space for header).

## Done

- Implemented: scroll listener on chat container, `headerHidden` state, 50px threshold. Header wrapped in fixed-height (69px) overflow-hidden wrapper; header uses `transition-transform` and `-translate-y-full` when hidden. Scroll down past 50px hides header; scroll up or scroll top ≤ 50px shows it.

## Root cause (final)

`flex min-h-screen flex-col` on the page root lets the container grow beyond the viewport. The whole flex tree grows with content, so `overflow-hidden` and `overflow-y-auto` have nothing to constrain — everything grows and the WINDOW scrolls. The inner div's `scrollTop` is always 0, scroll events never fire on it.

**Real fix:** AppChrome `main` uses `h-dvh overflow-hidden` for detail pages (chrome-hidden routes). IdeaChatPage root uses `flex h-full flex-col` instead of `flex min-h-screen flex-col`. This constrains the page to viewport height. The inner `overflow-y-auto` div now scrolls. Scroll listener is direct (no rAF, no wheel, no touch workarounds). Works on desktop and touch.

## Fix (header not showing again on scroll up)

- **Root cause:** Listener attached with effect [idea]; `lastScrollTopRef` stayed 0. After programmatic scroll (e.g. from scrollIntoView) or first user scroll, `prev` could be wrong so scroll-up detection failed. Also ref might attach before layout is ready.
- **Fix:** 1) Defer attaching listener with requestAnimationFrame so ref is set and any programmatic scroll has run. 2) When attaching, set `lastScrollTopRef.current = el.scrollTop` so direction detection uses correct previous value. 3) Add data-testid for Playwright. 4) Add Playwright test (authenticated): open idea chat, scroll down, assert header hidden; scroll up, assert header visible.

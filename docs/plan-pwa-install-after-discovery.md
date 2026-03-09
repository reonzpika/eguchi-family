# Plan: PWA Install Prompt 5s After First Discovery

## Goal

Show a popup 5 seconds after the user finishes the discovery flow for the first time, prompting them to install the web app on their home screen. Mobile only.

## Requirements

- **Trigger:** 5 seconds after user lands on home after completing discovery
- **First time only:** Never show again once dismissed or installed
- **Mobile only:** Do not show on desktop
- **Skip if already installed:** Do not show when app is already running as standalone

## Implementation Plan

### 1. Discovery page: set session flag before redirect

**File:** `src/app/(discovery)/discovery/page.tsx`

In `handleCompletionCta`, after successful `fetch(...)` and before `router.push("/")`:

- Add: `sessionStorage.setItem('show_pwa_install_prompt', '1')`

This signals "user just completed discovery".

### 2. New component: PwaInstallPrompt

**File:** `src/components/notifications/PwaInstallPrompt.tsx` (new)

**Logic:**

- On mount (client): check conditions in order:
  1. `sessionStorage.getItem('show_pwa_install_prompt') === '1'`
  2. `localStorage.getItem('pwa_install_prompt_shown') !== '1'`
  3. Mobile: `/(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent)` (or `maxTouchPoints` + viewport)
  4. Not already installed: `!window.matchMedia('(display-mode: standalone)').matches` and `!('standalone' in navigator && navigator.standalone)`
- If all pass: start 5s timer
- On timer fire: show modal
- On show: clear `sessionStorage.removeItem('show_pwa_install_prompt')`, set `localStorage.setItem('pwa_install_prompt_shown', '1')`
- Listen for `beforeinstallprompt` (store event for later use)

**Modal UI:**

- Same pattern as existing modals: `fixed inset-0 z-50`, `bg-black/40`, `rounded-2xl` card, max-w-[350px]
- Title: "ホーム画面に追加"
- Body: "いつでもすぐにアクセスできます。アプリのように使えます。"
- **Android/Chrome (beforeinstallprompt available):** Primary "インストール" button → `deferredPrompt.prompt()`, then close modal. Handle outcome (userChoice).
- **iOS or Android without prompt:** Show instructions: "共有ボタン → ホーム画面に追加"
- **Dismiss:** "あとで" (Later) button — closes modal, sets localStorage so we never show again
- **Desktop:** Skip (mobile-only)

**Accessibility:**

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 44px min-height buttons (per design system)
- Escape key closes modal (optional; improves a11y)

### 3. Home page: render PwaInstallPrompt

**File:** `src/app/(app)/page.tsx`

- Import and render `<PwaInstallPrompt />` (near `PushPermissionPrompt`)

### 4. Storage keys

- `sessionStorage`: `show_pwa_install_prompt` — set by discovery, read by home, cleared on show
- `localStorage`: `pwa_install_prompt_shown` — set when prompt shown, prevents re-show

## Edge Cases

| Case | Handling |
|------|----------|
| User refreshes home before 5s | sessionStorage persists; timer runs; prompt shows |
| User navigates away before 5s | sessionStorage persists; next visit to home, if within same session, could show. But we clear on show only. If they never see it, sessionStorage stays until tab close. On next session, no flag — won't show. So we need: clear sessionStorage when they leave home? No — we want to show on next home visit in same session. So keep it. |
| User completes discovery, closes tab, reopens | sessionStorage cleared (new session). Won't show. That's intentional — "first time" means first time they land on home after discovery. |
| beforeinstallprompt never fires (Android) | Show instructions: "共有ボタン → ホーム画面に追加" (same as iOS) |
| Already installed | Skip entirely |
| Desktop | Skip (mobile-only) |

## Review Checklist

- [x] Matches existing modal patterns (z-50, rounded-2xl, 44px buttons)
- [x] Japanese copy, warm tone
- [x] No regression to discovery or home flows
- [x] Playwright: PWA install prompt test (authenticated, mobile userAgent via addInitScript)

## Files Changed

1. `src/app/(discovery)/discovery/page.tsx` — add sessionStorage flag
2. `src/components/notifications/PwaInstallPrompt.tsx` — new component
3. `src/app/(app)/page.tsx` — render PwaInstallPrompt

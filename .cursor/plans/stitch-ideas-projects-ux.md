# Stitch-aligned Ideas and Projects integration (plan)

## Source of truth (read before implementing)

| Document | Role |
|----------|------|
| [docs/hub-overview.md](docs/hub-overview.md) | Hub routes (`/` hub home, `/tools/*`, `/discussions`, `/feed` timeline); points to design spec |
| [docs/stitch/kazoku_harmony/DESIGN.md](docs/stitch/kazoku_harmony/DESIGN.md) | **Authoritative** Digital Engawa design system (tokens, typography, elevation, components, do/don't) |
| [docs/stitch/](docs/stitch/) HTML mocks | Concrete layouts: e.g. [_3/code.html](docs/stitch/_3/code.html) (AIツール一覧: sticky bar, chips, list), [_1/code.html](docs/stitch/_1/code.html) (top bar + breadcrumb + forms), [tool_detail/code.html](docs/stitch/tool_detail/code.html), [q_a/code.html](docs/stitch/q_a/code.html), [empty_states/code.html](docs/stitch/empty_states/code.html) |

Implementation must **not** invent a parallel visual language; it must follow DESIGN.md and reuse patterns visible in the Stitch HTML (tokens already mapped in [src/app/globals.css](src/app/globals.css)).

---

## Stitch design rules (checklist for Ideas / Projects)

These are non-negotiable when reskinning list pages.

### Brand and surfaces

- **Creative north star:** "Digital Engawa"; warm, editorial, homely; avoid clinical boxed grids where mocks use soft layering.
- **Background:** `background` / `#f9f9f9`; text **`on_surface`** `#2f3334` (never pure black).
- **No-line rule:** do not use 1px borders to separate major sections; use **background shift** (`surface_container`, `surface_container_low`, `surface_container_lowest`).
- **Primary / secondary / tertiary** roles as in DESIGN.md; **missions / reward tone** use **`tertiary_container`** where the mock uses sunshine orange.

### Typography

- **Headlines:** `font-headline` (Plus Jakarta Sans + Noto Sans JP stack already in app).
- **Body:** default sans (Be Vietnam Pro + Noto JP).
- **Page titles** on list screens: match [_3](docs/stitch/_3/code.html): large editorial title, e.g. `text-3xl font-bold font-headline tracking-tight`, with framed margins (see spacing).

### Components

- **Material Symbols Outlined** for icons; default `material-symbols-outlined` styling from globals; use **FILL 1** only for active/emphasis where mocks do.
- **Cards:** prefer **tonal layering** (white / lowest on grey band) over heavy outlines; corner radius **at least** `rounded-xl` / `rounded-2xl` for content blocks (DESIGN: sharp corners feel wrong).
- **Ambient shadow** for hero or floating emphasis: `editorial-shadow` class (already in globals): `0px 12px 32px rgba(47, 51, 52, 0.06)`.
- **Primary CTA:** signature **primary gradient** (`bg-primary-gradient` in app) or gradient described in DESIGN.md; press **`active:scale-[0.98]`** or similar tactile feedback.
- **Glass** (floating panels): `surface_container_lowest` at high opacity + `backdrop-blur` (~16px) when mocks use glass cards.
- **Inputs / filters:** filled **`surface_container_low`**; focus ghost ring (primary at low opacity), not harsh outlines (DESIGN.md).

### Spacing and shell

- **Horizontal framing:** Stitch list mocks use **`max-w-7xl mx-auto px-8`** (and similar); align Ideas/Projects list layout with this, not the legacy `max-w-[390px]` column.
- **Vertical rhythm:** generous gaps between sections (`space-y-8` to `space-y-10`); internal card padding **`p-5` to `p-6`** (DESIGN: spacing-6 for card interiors).
- **List screens in mocks** often use **`min-h-[max(884px,100dvh)]`** and bottom padding for nav/FAB; mirror for scroll areas.

### List + filter patterns (from [_3 AIツール一覧](docs/stitch/_3/code.html))

- **Sticky top region:** `sticky top-0 z-50`, `bg-[#f9f9f9]` (or token `background`), inner **`max-w-7xl mx-auto px-8 py-4`**, avatar + wordmark row, optional **`search` / `help_outline`** actions in soft circular **`surface_container_low`** buttons.
- **Section header + chips:** below the bar, **`mb-10`**, title + **`flex flex-wrap gap-3`** **pill filters** (`rounded-full`, active state `bg-primary text-on-primary`, inactive tonal surfaces).
- Apply the same **structure** to **Projects** (status / ownership filters) and **Ideas** (e.g. draft vs final if needed): chips, not heavy borders.

### Empty states

- Follow [empty_states](docs/stitch/empty_states/code.html): illustration-forward, soft surfaces, single clear CTA; no harsh boxes.

---

## Hub scope vs family workspace (from hub-overview)

- [hub-overview.md](docs/hub-overview.md) defines the **Hub** as tools, missions, threads, plaza, and points home at featured mission + tools + tips + timeline link.
- **Ideas** and **Projects** are **family workspace** execution tracks; they are not in that table but must **look like the same product** by sharing the Stitch shell and tokens.

**Chosen IA:** **Strategy A** (single unified bottom bar across the app, including Ideas and Projects). Strategies B and C are **out of scope**.

Regardless of route, **visual parity** means list pages use the **same Stitch shell primitives** as `/` and `/tools` (top bar pattern, `max-w-7xl`, chip row where filters exist, editorial cards, bottom nav + FAB rules below).

---

## Information architecture (locked in): Strategy A

### Unified bottom navigation (six tabs)

One **Stitch-styled** bottom bar component, shared by **every** screen that shows global chrome (not full-screen idea/project/tool detail). Suggested order (left to right; tune labels in implementation if copy review prefers):

| # | Label (JA) | Path | Role |
|---|------------|------|------|
| 1 | ホーム | `/` | Hub home (featured mission, tools carousel, tips, activity) |
| 2 | ミッション | `/missions` | All missions index |
| 3 | ツール | `/tools` | Tool catalogue |
| 4 | アイデア | `/ideas` | Ideas list |
| 5 | プロジェクト | `/projects` | Projects list |
| 6 | 設定 | `/settings` | Settings (and any former **メニュー** entry points; fold **/menu** or link it from settings so we do not add a seventh tab) |

### Density and UX mitigations (crowding)

- **Icons + short labels:** keep `text-[10px]` or similar; Material Symbols at a fixed size; active state uses Stitch pill or **primary-container** fill (match current home bottom nav).
- **Safe area:** keep `pb-safe` on the nav.
- **FAB:** keep optional **quick action** (e.g. `/tools/new`) as **FAB** above the bar where the product already uses it on home; do not add a seventh tab for FAB.
- **Scroll:** if the bar feels too tight on narrow devices, allow **horizontal scroll** for the tab row **only as a last resort**; prefer slightly smaller horizontal padding or icon-only with label on active first.

### Code direction

- **Replace** the current split between (1) home’s custom 4-tab bar in [src/app/(app)/page.tsx](src/app/(app)/page.tsx) and (2) [src/components/layout/BottomNav.tsx](src/components/layout/BottomNav.tsx) five-tab bar with **one** exported component (e.g. `StitchBottomNav` or evolve `BottomNav`) used by `AppChrome` and **removed** from inline duplication on `/`.
- **AppChrome:** all routes that show bottom nav use **`max-w-7xl`** (or the same width as home) so the bar aligns with the Stitch shell.

**Branding (still open):** DESIGN and mocks use **"AI Masterclass"** / **AIMasterclass** in headers; hub-overview uses **Digital Engawa**. Pick **one** primary wordmark for the shared Stitch top bar (secondary subtitle can stay family-specific).

---

## Implementation phases (when execution is approved)

1. **Unified bottom nav (Strategy A):** Implement the **six-tab** Stitch bar in one component; use it from **AppChrome** on all global-chrome routes; **refactor `/`** to remove duplicate inline bottom nav and rely on the shared component (keep FAB on home only if desired).
2. **Stitch shell extraction:** Shared layout matching DESIGN + [_3](docs/stitch/_3/code.html) (sticky header, `max-w-7xl`, main padding, optional FAB) driven by route config.
3. **Ideas list:** Apply checklist; page title + optional chips; **IdeaCard** or wrapper uses tonal cards + `editorial-shadow` where appropriate; empty state per empty_states mock.
4. **Projects list:** Same shell; replace ad-hoc filters with **pill chips**; project rows/cards on layered surfaces; **prefer Material Symbols over Lucide** on these screens for Stitch consistency.
5. **AppChrome / Header:** Retire legacy **390px + old Header** for routes covered by Stitch; single wordmark policy.
6. **Tests:** Update Playwright if headings or nav labels change.

---

## Todos

- [x] Confirm IA strategy: **A** (unified six-tab bottom bar).
- [x] **Wordmark:** **AIMasterclass** in `StitchAppBar` (aligned with Stitch mocks).
- [x] Implement **six-tab** `BottomNav` and remove home inline nav; `AppChrome` uses `StitchAppBar` + `BottomNav` everywhere (except detail full-screen).
- [x] **Stitch shell:** `max-w-7xl` app column; sticky `StitchAppBar`; `pb-28` main for bottom nav.
- [x] Reskin **`/ideas`**, **`/projects`**, **`/tools`**, **`/missions`**, **`/settings`** (list framing, tokens, projects chips).
- [x] **設定** links to **`/menu`** as「その他のメニュー」(no seventh tab).
- [ ] Run **Playwright** with dev server when verifying locally.

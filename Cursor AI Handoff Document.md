# 江口ファミリーハブ — Cursor AI Handoff Document

This document contains everything Cursor needs to build the app phase by phase.
Complete and test each phase fully before moving to the next.
Do not skip ahead. Each phase builds on the last.

---

## Project Overview

A private, Japanese-language family workspace for the Eguchi family.
Members brainstorm business ideas using free AI tools (ChatGPT, Claude, Perplexity),
paste the output into the Hub, which polishes it using the Claude API and saves it
as a private idea. Ideas can be upgraded into public living documents (projects)
that update over time. The site is mobile-first and entirely in Japanese.

**Members:** Ryo (admin), Yoko, Haruhi, Natsumi, Motoharu

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk (invite-only, no public signup) |
| Database + Storage | Supabase (PostgreSQL) |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| Email | Resend |
| Deployment | Vercel |
| Icons | Lucide React |
| Fonts | Noto Sans JP (Google Fonts) |

---

## Design Tokens (use these consistently across all phases)

```
Primary:        #F97B6B  (coral — buttons, highlights)
Primary Light:  #FDECEA
Secondary:      #F9C784  (amber — accents)
Background:     #FFFAF5  (warm off-white)
Surface:        #FFFFFF  (cards)
Text:           #2D2D2D
Muted:          #9E9E9E
Success:        #7CC9A0
Success Light:  #EBF7F2
Border:         #F0E8DF
Border Radius:  16px cards, 12px buttons, 24px modals
Font:           Noto Sans JP (weights 400, 600, 700, 800)
```

Member avatar colours:
```
Ryo:      #7CC9A0
Yoko:     #F9C784
Haruhi:   #B5A4E0
Natsumi:  #F97B6B
Motoharu: #7BBFDC
```

---

## Database Schema (Supabase)

Run this SQL in Supabase before starting Phase 3.

```sql
-- Users (mirrors Clerk users)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  name text not null,
  email text unique not null,
  role text default 'member', -- 'admin' or 'member'
  avatar_color text,
  created_at timestamptz default now()
);

-- Ideas (private to each user)
create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  original_paste text not null,
  polished_content text,
  ai_suggestions jsonb,
  is_upgraded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects (visible to all family members)
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  idea_id uuid references ideas(id),
  title text not null,
  status text default 'planning', -- 'planning', 'active', 'complete'
  visibility text default 'unlisted', -- 'unlisted', 'public'
  created_at timestamptz default now()
);

-- Living Documents
create table living_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  content text not null,
  version_number integer default 1,
  change_summary text,
  created_at timestamptz default now()
);

-- Resources (learning hub)
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  category text not null, -- 'HTML/CSS', 'ビジネス', 'AI', 'EC'
  target_member text, -- optional: 'Haruhi', 'Natsumi', etc.
  level text default '入門', -- '入門', '中級', '上級'
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table ideas enable row level security;
alter table projects enable row level security;
alter table living_documents enable row level security;

-- RLS: Users can only see their own ideas
create policy "Users see own ideas" on ideas
  for all using (user_id = (
    select id from users where clerk_id = auth.uid()::text
  ));

-- RLS: All authenticated users can see projects
create policy "All users see projects" on projects
  for select using (true);

-- RLS: Only owner can insert/update their project
create policy "Owner manages project" on projects
  for all using (user_id = (
    select id from users where clerk_id = auth.uid()::text
  ));

-- RLS: All authenticated users can read living documents
create policy "All users read living docs" on living_documents
  for select using (true);

-- RLS: Only project owner can update living doc
create policy "Owner updates living doc" on living_documents
  for all using (
    project_id in (
      select id from projects where user_id = (
        select id from users where clerk_id = auth.uid()::text
      )
    )
  );
```

---

## Environment Variables

Create a `.env.local` file with these. Never commit this file.

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_CLERK_ID= (Ryo's Clerk user ID, set after Phase 1)
```

---

---

# PHASE 0 — Project Initialisation

## Goal
Create the repo, install all dependencies, and confirm the app runs locally with no errors.

## Cursor Prompt

```
I am building a private family web app called 江口ファミリーハブ (Eguchi Family Hub).
This is Phase 0 of a multi-phase build. Do only what is listed here.
Do not scaffold any pages or features yet.

Stack:
- Next.js 14 with App Router and TypeScript
- Tailwind CSS
- Clerk for auth
- Supabase for database
- Anthropic Claude API for AI features
- Resend for email notifications
- Lucide React for icons

Step 1: Initialise the project
Run: npx create-next-app@latest eguchi-hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

Step 2: Install all dependencies
npm install @clerk/nextjs @supabase/supabase-js @anthropic-ai/sdk resend lucide-react

Step 3: Add Google Fonts (Noto Sans JP) to app/layout.tsx
Import from next/font/google. Apply to the html element as the default font.
Weights needed: 400, 600, 700, 800.
subsets: ['latin', 'japanese']

Step 4: Set up Tailwind with custom design tokens in tailwind.config.ts
Add these custom colours:
  primary: '#F97B6B'
  primary-light: '#FDECEA'
  secondary: '#F9C784'
  bg-warm: '#FFFAF5'
  muted: '#9E9E9E'
  success: '#7CC9A0'
  success-light: '#EBF7F2'
  border-warm: '#F0E8DF'

Step 5: Create a .env.local file with placeholder values for all required environment variables.
List the variable names only, leave values empty.
Variables needed:
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  RESEND_API_KEY
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ADMIN_CLERK_ID

Step 6: Create a lib/ folder inside src/ with these empty placeholder files:
  src/lib/supabase.ts
  src/lib/anthropic.ts
  src/lib/resend.ts

Step 7: Replace the default app/page.tsx with a minimal placeholder:
  A white page with the text "江口ファミリーハブ — 準備中" centred on screen in Noto Sans JP.

Step 8: Run npm run dev and confirm there are no errors.

Acceptance criteria:
- npm run dev runs without errors
- The placeholder page loads in the browser
- No TypeScript errors
- All dependencies are in package.json
```

## Test Before Continuing
- [ ] `npm run dev` runs cleanly
- [ ] Browser shows the placeholder page
- [ ] No red errors in terminal or browser console

---

---

# PHASE 1 — Auth + Layout + Navigation

## Goal
Set up Clerk auth, create the app shell with bottom navigation,
and protect all routes so only invited family members can access the app.

## Cursor Prompt

```
This is Phase 1 of a multi-phase build of 江口ファミリーハブ.
Phase 0 (project setup) is already complete. Do only what is listed here.

Context:
- This is a private family app. There is no public signup.
- Only Ryo (the admin) can invite members via the Clerk dashboard.
- The app is entirely in Japanese.
- It is mobile-first. Max width is 390px, centred on desktop.
- Design tokens are already in tailwind.config.ts from Phase 0.

Tasks:

1. Set up Clerk middleware
Create src/middleware.ts using clerkMiddleware from @clerk/nextjs/server.
Protect all routes except /sign-in.
Public routes: ['/sign-in']

2. Wrap the app in ClerkProvider
Update src/app/layout.tsx to wrap children in ClerkProvider.
Keep the Noto Sans JP font from Phase 0.
Set background colour to #FFFAF5 (bg-warm) on the body.

3. Create the sign-in page
Path: src/app/sign-in/[[...sign-in]]/page.tsx
Use Clerk's <SignIn /> component.
Centre it on a full-screen warm background (#FFFAF5).
Above the sign-in component, show:
  - A coral (#F97B6B) rounded square icon with 🌸 emoji (72x72px)
  - Title: 江口ファミリーハブ (font size 26px, weight 800)
  - Subtitle: 家族のプライベートワークスペース (font size 14px, muted colour #9E9E9E)
Do not show any registration link.

4. Create the main app layout
Path: src/app/(app)/layout.tsx
This wraps all authenticated pages.
It should:
  - Enforce max-width of 390px, centred, with the warm background
  - Show a top header bar with:
      Left: 🌸 江口ファミリーハブ (font weight 800, font size 15px)
      Right: User's first name + Avatar (first letter, coloured by member)
  - Show a bottom navigation bar fixed to the bottom with 4 tabs:
      ホーム (🏠) → /
      アイデア (💡) → /ideas
      プロジェクト (📁) → /projects
      メニュー (☰) → /menu
  - Highlight the active tab in coral (#F97B6B)
  - Add padding-bottom of 80px to page content so it clears the nav bar
  - Add padding-top of 56px to page content to clear the header

5. Create placeholder pages for each tab (just a title for now)
  src/app/(app)/page.tsx → shows "ホーム"
  src/app/(app)/ideas/page.tsx → shows "アイデア"
  src/app/(app)/projects/page.tsx → shows "プロジェクト"
  src/app/(app)/menu/page.tsx → shows "メニュー"

6. Create a Supabase client helper
Path: src/lib/supabase.ts
Export two functions:
  createClientComponentClient() — for use in client components
  createServerComponentClient() — for use in server components and API routes
Use @supabase/supabase-js with the env vars from .env.local.

7. Create a user sync API route
Path: src/app/api/auth/sync/route.ts
This is called after sign-in to ensure the Clerk user exists in the Supabase users table.
It should:
  - Read the Clerk user from auth()
  - Check if a row exists in the users table for that clerk_id
  - If not, insert a new row with name, email, clerk_id, and default role 'member'
  - Return { success: true }

Acceptance criteria:
- Unauthenticated users are redirected to /sign-in
- Authenticated users see the app shell with header and bottom nav
- Active tab is highlighted correctly on each page
- No TypeScript errors
- No console errors
```

## Test Before Continuing
- [ ] Unauthenticated visit to `/` redirects to `/sign-in`
- [ ] After signing in, the app shell loads with header and nav
- [ ] All 4 nav tabs navigate to their pages
- [ ] Active tab highlights correctly
- [ ] No console errors

---

---

# Phase 2 — Onboarding Flow + AI Chat Agent

## Overview

Build the complete onboarding experience that guides new members through using free AI tools
to develop their business ideas. After pasting their initial AI output, a chat agent opens
and guides them through a structured conversation until a private checklist is complete.
Only then is the idea saved.

This is a multi-phase build. Do only what is listed here. Do not build anything from Phase 3 onwards.

---

## Architecture Flow

```
Home Page
  ↓ (query ideas count)
  ├── count === 0 → NewMemberHome
  └── count  >  0 → ReturningMemberHome

NewMemberHome
  ├── "はい、あります！" → /onboarding
  └── "まだ考え中です"  → /inspiration

/onboarding (3 steps)
  Step 1: Tool selection
  Step 2: Copy prompt + open AI tool
  Step 3: Paste AI output → submit
            ↓
      [Chat Agent opens on same page]
      Agent asks questions until checklist complete
      "アイデアをまとめる ✨" button appears
            ↓
      POST /api/ideas/finalize
            ↓
      /ideas/new-result?id=[ideaId]
```

---

## Implementation Tasks

### 1. Update Home Page

**File:** `src/app/(app)/page.tsx`

- Server Component
- Use `auth()` from Clerk to get `userId`
- Use `createServerComponentClient()` to query the `ideas` table for this user's count
- If count === 0: render `<NewMemberHome />`
- If count > 0: render `<ReturningMemberHome />`
- Pass the user's first name as a prop to both components

---

### 2. NewMemberHome Component

**File:** `src/components/home/NewMemberHome.tsx`

- Client component, receives `name: string` prop
- Greeting: `こんにちは、[name]さん！`
- Subtext: `ようこそ江口ファミリーハブへ。まず、あなたのアイデアを育てましょう。`
- Section title: `ビジネスアイデアはありますか？`
- Two tappable cards:
  - Card 1 (coral gradient background, no border):
    - Icon: ✨
    - Title: `はい、あります！`
    - Subtitle: `AIと一緒にアイデアを育てましょう →`
    - On tap: navigate to `/onboarding`
  - Card 2 (amber outlined border, white background):
    - Icon: 🌱
    - Title: `まだ考え中です`
    - Subtitle: `インスピレーションをもらいましょう →`
    - On tap: navigate to `/inspiration`
- Below cards: show 2 most recent family projects from the `projects` table
  (ordered by `created_at desc`, limit 2)
  - Show project title, owner name, owner avatar

---

### 3. ReturningMemberHome Component

**File:** `src/components/home/ReturningMemberHome.tsx`

- Client component, receives `name: string` prop
- Greeting: `おかえりなさい、[name]さん！`
- Two stat cards in a 2-column grid:
  - Left: 💡 total ideas count
  - Right: 📁 total projects count
- Full-width coral button: `＋ 新しいアイデアを追加する` → `/onboarding`
- Section title: `最近の更新`
- List user's 3 most recent ideas (ordered by `updated_at desc`, limit 3)
  - Show title, first 60 chars of `polished_content`, formatted date
  - On tap: navigate to `/ideas/[id]`

---

### 4. Onboarding Page (Steps 1–3 + Chat Agent)

**File:** `src/app/(app)/onboarding/page.tsx`

Client component. Use React state to track the current step (1, 2, 3, or 'chat').
Show a progress bar at the top for steps 1–3. Hide it during the chat phase.

---

#### Step 1 — Tool Selection

- Title: `AIツールを選んでください`
- Subtext: `無料のAIツールでアイデアを育てます。どれを使いますか？`
- Three selectable cards:
  - ChatGPT 🤖 — `https://chat.openai.com` — show `おすすめ` badge
  - Claude ✨ — `https://claude.ai`
  - Perplexity 🔍 — `https://perplexity.ai`
- Selected card gets a coral border and ✓ checkmark
- Store selected tool URL in `sessionStorage` with key `selectedAITool`
- Next button disabled until a tool is selected
- Footnote: `迷ったらChatGPTがおすすめです`

---

#### Step 2 — Copy Prompt

- Title: `プロンプトをコピーしてください`
- Subtext: `下のボタンを押してコピーし、AIツールに貼り付けてください。`
- Show this prompt text in a muted background box:

```
私はビジネスアイデアを考えているのですが、まだはっきりとした形になっていません。
一度に一つずつ質問しながら、私のアイデアを一緒に整理してもらえますか？

まず最初に「どんなビジネスをやってみたいか、一言で教えてください」と聞いてください。
```

- Button 1 (primary): `プロンプトをコピーする`
  - On click: `navigator.clipboard.writeText(promptText)`
  - After copy: change to `✓ コピーしました！` in green, set `hasCopied = true`
- Button 2 (outlined): `AIツールを開く ↗`
  - On click: read URL from `sessionStorage` and `window.open(url, '_blank')`
- Next button: `AIと話し終わりました → 次へ`
  - Only enabled after `hasCopied === true`

---

#### Step 3 — Paste Output

- Title: `AIの返答を貼り付けてください`
- Subtext: `AIとの会話の結果をここに貼り付けてください。あとはEguchi HubのAIがサポートします！`
- Large textarea (min-height 180px), placeholder: `ここに貼り付け...`
- Submit button: `AIに整理してもらう ✨`
  - Disabled until textarea has more than 20 characters
  - On click:
    1. Set `isLoading = true`, show `整理中...` on button
    2. POST to `/api/ideas/chat/start` with `{ pastedText: string }`
    3. On success: receive `{ sessionId, firstMessage, options }` from the API
    4. Set step to `'chat'`
    5. Initialise chat state with the agent's first message

---

#### Chat Agent Phase (after Step 3)

This replaces the step UI. The progress bar is hidden.

**Layout:**

```
[Header]
江口AIコーチ 🌸
アイデアを一緒に育てましょう

[Message thread — scrollable]
  Agent bubble (left-aligned, coral background)
  User bubble (right-aligned, white with border)
  Multiple choice buttons (when agent provides options)

[Input area — fixed bottom]
  Text input + Send button
  OR
  Multiple choice option buttons (when agent asks an options question)
```

**Chat behaviour:**

- Each user message is sent to `POST /api/ideas/chat/message`
  with `{ sessionId, message, chatHistory }`
- The API returns `{ message, options, isComplete }`
- `options` is either `null` (free text reply expected) or an array of strings
  (render as tappable buttons instead of free text input)
- When `isComplete === true`:
  - Hide the input area
  - Show a full-width coral button: `アイデアをまとめる ✨`
  - On click: POST to `/api/ideas/finalize` with `{ sessionId, chatHistory }`
  - On success: navigate to `/ideas/new-result?id=[ideaId]`

**Chat state managed in React:**

```typescript
type Message = {
  role: 'agent' | 'user'
  content: string
  options?: string[] // present when agent gives multiple choice
}

const [chatHistory, setChatHistory] = useState<Message[]>([])
const [sessionId, setSessionId] = useState<string>('')
const [isComplete, setIsComplete] = useState(false)
const [isLoading, setIsLoading] = useState(false)
```

**UX details:**
- Auto-scroll to latest message after each reply
- Show a typing indicator (three animated dots) while waiting for the agent response
- If the agent provides `options`, render them as tappable pill buttons below the agent message
  Tapping a pill sends that option as the user's message immediately (no text input needed)
- If `options` is null, show the free text input so the user can type freely
- Disable input and buttons while `isLoading === true`

---

### 5. Inspiration Page

**File:** `src/app/(app)/inspiration/page.tsx`

- Client component
- Back button: `← 戻る` → navigates back
- Title: `アイデアのヒント`
- Subtext: `次の質問を考えてみてください。ピンときたらAIと話してみましょう！`
- Three tappable cards:
  - 🌟 `自分が得意なことで、よく頼まれることは？`
  - 💭 `毎日の生活で「これ不便だな」と感じることは？`
  - ❤️ `好きなことや趣味で、世界と共有したいものは？`
- Each card: tap to navigate to `/onboarding`
- Bottom of each card: `このテーマでAIと話す →` in coral

---

### 6. API Route — Start Chat Session

**File:** `src/app/api/ideas/chat/start/route.ts`

- Method: POST
- Body: `{ pastedText: string }`
- Authenticate user via Clerk `auth()`

**For Phase 2, this is a placeholder:**
- Generate a `sessionId` using `crypto.randomUUID()`
- Log the `pastedText`
- Return a mock first message:

```json
{
  "sessionId": "uuid-here",
  "firstMessage": "ありがとうございます！内容を確認しました。もう少し教えてください。どんな形でビジネスをイメージしていますか？",
  "options": [
    "オンラインショップで商品を販売する",
    "サービスを提供する（教室・コーチングなど）",
    "企業やお店向けのBtoBサービス",
    "まだわからない"
  ]
}
```

- Full Claude API implementation is in Phase 3.

---

### 7. API Route — Chat Message

**File:** `src/app/api/ideas/chat/message/route.ts`

- Method: POST
- Body: `{ sessionId: string, message: string, chatHistory: Message[] }`
- Authenticate user via Clerk `auth()`

**For Phase 2, this is a placeholder:**
- Log the message and history
- Return a mock follow-up:

```json
{
  "message": "なるほど！ありがとうございます。次に、ターゲットのお客様について教えてください。誰のためのビジネスですか？",
  "options": [
    "個人のお客様（一般消費者）",
    "ビジネスオーナーや企業",
    "特定のコミュニティや趣味のグループ",
    "まだ決めていない"
  ],
  "isComplete": false
}
```

- Full Claude API implementation with checklist tracking is in Phase 3.

---

### 8. API Route — Finalize Idea

**File:** `src/app/api/ideas/finalize/route.ts`

- Method: POST
- Body: `{ sessionId: string, chatHistory: Message[] }`
- Authenticate user via Clerk `auth()`

**For Phase 2, this is a placeholder:**
- Log the session and history
- Return a mock idea ID:

```json
{
  "ideaId": "placeholder-id",
  "success": true
}
```

- Full implementation (Claude polish + Supabase save) is in Phase 3.

---

## File Structure After Phase 2

```
src/
├── app/
│   ├── (app)/
│   │   ├── page.tsx (updated — detects new vs returning)
│   │   ├── onboarding/
│   │   │   └── page.tsx (new — steps 1-3 + chat agent UI)
│   │   └── inspiration/
│   │       └── page.tsx (new)
│   └── api/
│       └── ideas/
│           ├── chat/
│           │   ├── start/
│           │   │   └── route.ts (new — placeholder)
│           │   └── message/
│           │       └── route.ts (new — placeholder)
│           └── finalize/
│               └── route.ts (new — placeholder)
└── components/
    └── home/
        ├── NewMemberHome.tsx (new)
        └── ReturningMemberHome.tsx (new)
```

---

## Important Notes for Cursor

- The three API routes (`chat/start`, `chat/message`, `finalize`) are placeholders in this phase.
  They must return the mock JSON shown above so the UI can be fully tested.
  The real Claude API implementation comes in Phase 3.
- All user-facing text must be in Japanese.
- The chat agent UI must handle both multiple choice (options array) and free text (options null) seamlessly.
- Never expose API keys to the client. All API calls go through Next.js route handlers.
- The `chatHistory` array is stored in React state only — no database storage needed in Phase 2.
- Auto-scroll behaviour in the chat must work on mobile (iOS Safari and Android Chrome).
- Do not build `/ideas/new-result` in this phase. Just navigate to it after finalize.
  It will be built in Phase 3.

---

## Testing Checklist

- [ ] New user sees NewMemberHome with two cards
- [ ] Returning user sees ReturningMemberHome with stats and recent ideas
- [ ] Onboarding Step 1: tool selection highlights selected card, stores in sessionStorage
- [ ] Onboarding Step 2: copy to clipboard works, button turns green
- [ ] Onboarding Step 2: AI tool opens in new tab with correct URL
- [ ] Onboarding Step 2: Next button disabled until copy is clicked
- [ ] Onboarding Step 3: submit button disabled until 20+ characters in textarea
- [ ] Onboarding Step 3: loading state shows on submit button
- [ ] Chat opens after Step 3 submit with mock first message
- [ ] Multiple choice options render as tappable pill buttons
- [ ] Tapping a pill sends it as a user message immediately
- [ ] Free text input shows when options is null
- [ ] Typing indicator (three dots) shows while waiting for response
- [ ] Chat auto-scrolls to latest message
- [ ] "アイデアをまとめる ✨" button appears when isComplete is true
- [ ] Clicking finalize button navigates to /ideas/new-result
- [ ] Inspiration page shows 3 cards and navigates to /onboarding
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Mobile layout works at 390px max width

---

---

# Phase 3 — OpenAI Integration + Chat Agent + Idea Save

## Overview

Replace all Phase 2 placeholder API routes with real OpenAI implementations.  
This phase brings the chat agent to life, implements the checklist-driven conversation,  
generates a polished idea summary from the completed chat, and saves it to Supabase.

This is a multi-phase build. Do only what is listed here. Do not build anything from Phase 4 onwards.

---

## Context

- Phases 0–2 are complete and tested
- Phase 2 built the full chat UI with placeholder API routes
- This phase replaces those placeholders with real OpenAI API calls
- The UI does not change — only the API routes change
- All AI responses must be in Japanese
- The AI persona is a warm, encouraging coach

---

## 1. Set Up the OpenAI Client

**File:** `src/lib/openai.ts`

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai
```

Install the OpenAI SDK:
```
npm install openai
```

Add to `.env.local`:
```
OPENAI_API_KEY=your-key-here
```

Model to use throughout this phase: `gpt-4o`

---

## 2. Replace Chat Start Route

**File:** `src/app/api/ideas/chat/start/route.ts`

Method: POST  
Body: `{ pastedText: string }`

This route:

a. Authenticates the user via Clerk `auth()`  
b. Sends the pasted text to OpenAI with the system prompt below  
c. Returns the agent's first message and optional multiple choice options

**System prompt:**
```
あなたは江口ファミリーの専用AIビジネスコーチです。
家族のメンバーがビジネスアイデアを育てるのを温かくサポートするのがあなたの役割です。

話し方のルール：
- 丁寧だけど堅くならず、温かみのある日本語で話す
- 否定せず、まず良いところを見つけて伝える
- 一度に一つだけ質問する
- 専門用語は使わず、誰にでもわかる言葉を使う
- 質問は短くシンプルに

あなたは会話を通じて、以下の5項目のチェックリストを完成させる必要があります。
このチェックリストはユーザーには見せません。内部で管理してください。

チェックリスト：
1. ビジネスの種類 — 商品販売 / サービス提供 / 教える / その他
2. ターゲット顧客 — 誰のためのビジネスか
3. 販売・提供方法 — オンライン / 対面 / SNS など
4. 差別化ポイント — 他と何が違うか、強みは何か
5. 収益の仕組み — どうやって収入を得るか

各項目が会話の中で自然に明らかになったらチェックしてください。
すべての項目が完了したら、isComplete を true にしてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "message": "エージェントのメッセージ（日本語）",
  "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"] または null,
  "isComplete": false
}

options は、ユーザーが選びやすい選択肢がある場合のみ配列を返してください。
自由回答が適切な場合は null にしてください。
isComplete はチェックリストがすべて完了した場合のみ true にしてください。
```

**User message:**
```
以下のビジネスアイデアについて教えてください：

[pastedText]

まず最初の質問をしてください。
```

**Response handling:**
- Parse the JSON response from OpenAI
- Generate a `sessionId` using `crypto.randomUUID()`
- Return:
```json
{
  "sessionId": "uuid",
  "firstMessage": "...",
  "options": [...] or null,
  "isComplete": false
}
```

**Error handling:**  
If OpenAI returns invalid JSON, return a 500 with:  
`{ "error": "AIの処理中にエラーが発生しました。もう一度お試しください。" }`

---

## 3. Replace Chat Message Route

**File:** `src/app/api/ideas/chat/message/route.ts`

Method: POST  
Body: `{ sessionId: string, message: string, chatHistory: Message[], pastedText: string }`

Note: The client must also send `pastedText` so the API has full context on every turn.

This route:

a. Authenticates the user via Clerk `auth()`  
b. Builds the full message history for OpenAI from `chatHistory`  
c. Calls OpenAI with the same system prompt as the start route  
d. Returns the next agent message, options, and isComplete flag

**Building the OpenAI message array:**
```typescript
const messages = [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'user', content: `ビジネスアイデアの元の内容：\n\n${pastedText}` },
  ...chatHistory.map(msg => ({
    role: msg.role === 'agent' ? 'assistant' : 'user',
    content: msg.content,
  })),
  { role: 'user', content: message },
]
```

**Return:**
```json
{
  "message": "次の質問または締めくくりメッセージ",
  "options": [...] or null,
  "isComplete": true or false
}
```

**When isComplete is true**, the agent message should be a warm wrap-up, for example:
```
ありがとうございます！十分お話を聞けました。
アイデアをきれいにまとめますね。下のボタンを押してください。
```

---

## 4. Replace Finalize Route

**File:** `src/app/api/ideas/finalize/route.ts`

Method: POST  
Body: `{ sessionId: string, chatHistory: Message[], pastedText: string }`

This route:

a. Authenticates the user via Clerk `auth()`  
b. Looks up the user's row in Supabase (by `clerk_id`)  
c. Calls OpenAI with a summarisation prompt (different from the chat prompt)  
d. Saves the result to Supabase  
e. Returns `{ ideaId, title, summary, suggestions, nextStep }`

**Summarisation system prompt:**
```
あなたは江口ファミリーの専用AIビジネスコーチです。
会話の内容をもとに、ビジネスアイデアを整理してまとめてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "title": "アイデアの短いタイトル（20文字以内）",
  "summary": "アイデアの整理された説明（150文字程度、ポジティブなトーンで）",
  "suggestions": [
    "具体的な提案1（実行しやすいもの）",
    "具体的な提案2",
    "具体的な提案3"
  ],
  "nextStep": "今すぐできる最初のアクション（1つだけ、具体的に）"
}
```

**Summarisation user message:**
```
以下の会話をもとに、ビジネスアイデアをまとめてください。

元のアイデア：
[pastedText]

会話の内容：
[chatHistory をテキスト形式に変換]

例：
コーチ: [agent message]
ユーザー: [user message]
...
```

**Supabase insert:**
```typescript
const { data } = await supabase
  .from('ideas')
  .insert({
    user_id: user.id,
    title: parsed.title,
    original_paste: pastedText,
    polished_content: parsed.summary,
    ai_suggestions: parsed, // store full JSON
    is_upgraded: false,
  })
  .select()
  .single()
```

**Return:**
```json
{
  "ideaId": "uuid-from-supabase",
  "title": "...",
  "summary": "...",
  "suggestions": ["...", "...", "..."],
  "nextStep": "..."
}
```

---

## 5. Create the Idea Result Page

**File:** `src/app/(app)/ideas/new-result/page.tsx`

Receives `ideaId` via URL query param: `/ideas/new-result?id=[ideaId]`  
Fetches the idea from Supabase on load using `createClientComponentClient()`.

Display:

- Back button: `← アイデア一覧に戻る` → `/ideas`
- Editable title input (pre-filled, user can rename)
- AI summary card (coral gradient header):
  - ✨ AIが整理しました
  - Summary text below
- AI suggestions section:
  - 💬 AIからの提案
  - Each suggestion with `→` prefix
- Next step card:
  - 👣 まずやること
  - The `nextStep` text
- Two buttons at the bottom:
  - Primary: `💾 アイデアを保存する`
    - On click: PATCH `/api/ideas/[id]` with updated title
    - After save: button changes to `✓ 保存しました！` in green
    - Reveal secondary button after save
  - Secondary (revealed after save): `🚀 プロジェクトに昇格する`
    - On click: navigate to `/ideas/[id]/upgrade`
    - (Upgrade flow is built in Phase 4)

---

## 6. Create the Idea Update API Route

**File:** `src/app/api/ideas/[id]/route.ts`

Method: PATCH  
Body: `{ title: string }`

- Authenticate user via Clerk `auth()`
- Verify the idea belongs to the current user (check `user_id`)
- Update the `title` and `updated_at` in Supabase
- Return `{ success: true }`

---

## 7. Create the Ideas List Page

**File:** `src/app/(app)/ideas/page.tsx`

- Client component
- Query all ideas for current user from Supabase ordered by `updated_at desc`
- Display:
  - Page title: `私のアイデア`
  - Privacy notice card: `🔒 このページはあなただけが見られます`
  - A card per idea:
    - 💡 [title]
    - [polished_content truncated to 60 chars]
    - 保存日: [formatted date in Japanese: 例 2024年3月10日]
    - On tap: navigate to `/ideas/[id]`
  - Floating action button (＋) fixed bottom-right → `/onboarding`
  - Empty state:
    - `まだアイデアがありません。最初のアイデアを追加しましょう！`
    - Button: `アイデアを追加する →` → `/onboarding`

---

## 8. Create the Individual Idea Detail Page

**File:** `src/app/(app)/ideas/[id]/page.tsx`

- Fetch the idea from Supabase using the `id` param
- If the idea does not belong to the current user: redirect to `/ideas`
- Display the same layout as `new-result` but read existing data from Supabase
- `ai_suggestions` stored as JSON — parse to get `suggestions` and `nextStep`

---

## File Structure After Phase 3

```
src/
├── lib/
│   └── openai.ts (new)
├── app/
│   ├── (app)/
│   │   ├── ideas/
│   │   │   ├── page.tsx (new — ideas list)
│   │   │   ├── new-result/
│   │   │   │   └── page.tsx (new — result after finalize)
│   │   │   └── [id]/
│   │   │       └── page.tsx (new — individual idea detail)
│   └── api/
│       └── ideas/
│           ├── chat/
│           │   ├── start/
│           │   │   └── route.ts (updated — real OpenAI)
│           │   └── message/
│           │       └── route.ts (updated — real OpenAI)
│           ├── finalize/
│           │   └── route.ts (updated — real OpenAI + Supabase save)
│           └── [id]/
│               └── route.ts (new — PATCH title)
```

---

## Important Notes for Cursor

- The UI from Phase 2 does not change. Only the API routes change.
- The client must send `pastedText` with every chat/message request so the API
  has full context without needing to store session state server-side.
- All OpenAI responses in the chat routes return JSON. Always strip markdown
  code fences before parsing:
  ```typescript
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  ```
- Never expose `OPENAI_API_KEY` to the client. All OpenAI calls happen in API routes only.
- The `ai_suggestions` column in Supabase is `jsonb` — store the full parsed object, not a string.
- Row Level Security is enabled. Always look up the user's Supabase `id` from their `clerk_id`
  before inserting or querying.
- All user-facing text must be in Japanese.
- Use `gpt-4o` as the model for all OpenAI calls.

---

## Testing Checklist

- [ ] Run `npm install openai` and confirm no dependency errors
- [ ] Complete the full onboarding flow to Step 3 and submit
- [ ] Chat opens and the agent asks a real first question (not mock data)
- [ ] Multiple choice options render correctly from real OpenAI response
- [ ] Tapping a pill sends the message and agent replies with next question
- [ ] Free text input works when agent returns `options: null`
- [ ] After 5 checklist items are covered, `isComplete` becomes true
- [ ] "アイデアをまとめる ✨" button appears when isComplete is true
- [ ] Clicking finalize calls OpenAI summarisation and saves to Supabase
- [ ] `/ideas/new-result?id=[id]` loads the saved idea correctly
- [ ] Title is editable and save button updates Supabase
- [ ] Ideas list shows the new idea
- [ ] Tapping an idea navigates to `/ideas/[id]`
- [ ] Idea detail page shows correct data and redirects if not the owner
- [ ] No ideas from other users are ever visible
- [ ] No TypeScript errors
- [ ] No console errors

---

---

# PHASE 4 — Projects + Living Documents

## Goal
Build the project upgrade flow, the public project list,
and the living document that updates over time.

## Cursor Prompt

```
This is Phase 4 of a multi-phase build of 江口ファミリーハブ.
Phases 0–3 are complete. Ideas can be saved. Now we build the upgrade-to-project
flow and the living document system.
Do only what is listed here.

1. Create the upgrade page
Path: src/app/(app)/ideas/[id]/upgrade/page.tsx
This page is where a user confirms they want to make their idea a public project.

Display:
  - Back button
  - Title: アイデアをプロジェクトに昇格する
  - Explanation card (amber background):
      🌟 プロジェクトにすると、アイデアが家族全員に公開されます。
      リビングドキュメントが作成され、追加のブレインストーミングで育てることができます。
  - Visibility selector:
      Option 1: 公開 — 家族全員が見られます (default)
      Option 2: 限定公開 — リンクを知っている人だけ
  - Confirm button: 🚀 プロジェクトを作成する
    On click: POST to /api/projects/create
    After success: navigate to /projects/[id]

2. Create the project creation API route
Path: src/app/api/projects/create/route.ts
Method: POST
Body: { ideaId: string, visibility: 'public' | 'unlisted' }

This route must:
  a. Authenticate the user
  b. Fetch the idea from Supabase (verify ownership)
  c. Create a new row in the projects table
  d. Call the Claude API to generate the first version of the living document:

  System prompt (same AI persona as Phase 3), user message:
  "以下のビジネスアイデアをもとに、リビングドキュメントの初版を作成してください。
  マークダウン形式で、以下のセクションを含めてください：
  ## 🎯 ビジョン
  ## 📦 製品・サービスアイデア
  ## 👥 ターゲット
  ## 🛒 販売・展開方法
  ## 📋 次のステップ（3つ）

  アイデア：[idea polished_content]"

  e. Save the generated document to living_documents table
     (version_number: 1, change_summary: '初版作成')
  f. Mark the idea as upgraded (is_upgraded: true)
  g. Return { projectId: string }

3. Create the Projects list page
Path: src/app/(app)/projects/page.tsx
Query all projects from Supabase with their owner's user info.
Display:
  - Page title: プロジェクト
  - Filter tabs: すべて / 進行中 / 計画中 / 完了
  - A card for each project:
      Emoji icon area (coloured by owner's member colour)
      Project title
      Short description (first 60 chars of living doc content)
      Owner avatar + name
      Status tag
      On tap: navigate to /projects/[id]
  - Empty state: まだプロジェクトはありません

4. Create the Project / Living Document page
Path: src/app/(app)/projects/[id]/page.tsx
Fetch the project and its most recent living_document from Supabase.

Display:
  - Back button
  - Visibility tag (公開 or 限定公開)
  - Owner avatar + name + 最終更新 [relative time]
  - Project title (large, bold)
  - Two tabs: 内容 / 更新履歴

  内容 tab:
    Render the living document markdown content.
    Use a simple markdown renderer (install remark or react-markdown).
    At the bottom (owner only):
      If showUpdateForm is false: button ＋ 新しい内容を追加して更新する
      If showUpdateForm is true: show a textarea and a submit button

  更新履歴 tab:
    List all versions from living_documents for this project, newest first.
    Each row: version tag, change_summary, relative date.

5. Create the living document update API route
Path: src/app/api/projects/[id]/update/route.ts
Method: POST
Body: { newContent: string }

This route must:
  a. Authenticate the user and verify they own the project
  b. Fetch the current latest living document
  c. Call Claude API:
     "以下のリビングドキュメントに、新しいブレインストーミングの内容を統合してください。
     既存の内容を改善しながら、新しい情報を自然に組み込んでください。
     変更の要約も1文で教えてください。

     既存のドキュメント：
     [current content]

     新しい内容：
     [newContent]

     JSON形式で返してください：
     { \"content\": \"更新されたドキュメント全文\", \"changeSummary\": \"変更の要約\" }"
  d. Insert a new row in living_documents with incremented version_number
  e. Return { success: true }

6. Install react-markdown
npm install react-markdown
Use it to render living document content on the project page.

Acceptance criteria:
- Upgrade flow creates a project and generates a first living document via Claude
- Projects list shows all projects with correct owner info and status
- Filter tabs work correctly
- Living document content renders as formatted markdown
- Version history tab shows all versions
- Update form is only visible to the project owner
- Updating the document calls Claude and creates a new version
- No TypeScript errors
- No console errors
```

## Test Before Continuing
- [ ] Upgrading an idea creates a project and a living document in Supabase
- [ ] Projects list shows the new project
- [ ] Filter tabs filter correctly
- [ ] Living document renders markdown
- [ ] Version history shows v1
- [ ] Updating the document creates v2 in the database
- [ ] Non-owners cannot see the update form
- [ ] No console errors

---

---

# PHASE 5 — Notifications

## Goal
Send a simple email notification to all family members
when someone updates their living document.

## Cursor Prompt

```
This is Phase 5 of a multi-phase build of 江口ファミリーハブ.
Phases 0–4 are complete. Now we add email notifications using Resend.
Do only what is listed here.

1. Set up the Resend client
Path: src/lib/resend.ts
Import Resend from 'resend'.
Export a singleton instance using RESEND_API_KEY from env.

2. Create an email template
Path: src/lib/emails/ProjectUpdatedEmail.tsx
A simple React Email component (install @react-email/components).
npm install @react-email/components

The email should show:
  Subject: 🌸 [member name]さんが「[project title]」を更新しました
  Body (in Japanese):
    - Greeting: 江口ファミリーの皆さんへ
    - "[name]さんが「[project title]」に新しい内容を追加しました。"
    - Change summary text
    - A button: プロジェクトを見る → [project URL]
  Keep it simple and warm. Use inline styles only (required for email).

3. Update the living document update API route
Path: src/app/api/projects/[id]/update/route.ts
After successfully saving the new document version, send the email:
  a. Query all users from the users table
  b. Exclude the user who made the update
  c. Send one email to each remaining member using the ProjectUpdatedEmail template
  d. Do not block the response waiting for emails — send them after returning success
     Use: Promise.all(emails.map(...)).catch(console.error) after the response

4. Create a simple notification preferences note
For MVP, all members receive all project update emails.
Add a comment in the code noting that per-user preferences can be added in a future phase.

Acceptance criteria:
- Updating a living document triggers an email to all other family members
- The email contains the project name, change summary, and a link
- The API response is not delayed by the email sending
- No TypeScript errors
- Test by updating a project and checking the recipient's inbox
```

## Test Before Continuing
- [ ] Update a living document
- [ ] All other family members receive an email
- [ ] Email contains correct project name and link
- [ ] API response time is not noticeably slower
- [ ] No console errors

---

---

# PHASE 6 — Family Showcase + Learning Hub

## Goal
Build the showcase page (all Eguchi businesses) and the learning hub
(curated resources by category and member).

## Cursor Prompt

```
This is Phase 6 of a multi-phase build of 江口ファミリーハブ.
Phases 0–5 are complete. Now we build the two remaining content pages.
Do only what is listed here.

1. Create the Family Showcase page
Path: src/app/(app)/showcase/page.tsx
Link to it from the menu page: src/app/(app)/menu/page.tsx

Seed the following businesses as static data (no database needed for MVP):
  { name: 'Ryo', title: 'ClinicPro', url: 'https://clinicpro.co.nz', emoji: '🏥', desc: 'クリニック向け予約・管理システム', live: true }
  { name: 'Ryo', title: 'Ahuru Candles', url: 'https://ahurucandles.co.nz', emoji: '🕯️', desc: 'NZのハンドメイドキャンドルブランド', live: true }
  { name: 'Ryo', title: 'Miozuki', url: 'https://miozuki.co.nz', emoji: '🌙', desc: '近日公開', live: true }
  { name: 'Yoko', title: 'Cloud9 Japan', url: 'https://cloud9japan.com', emoji: '🇯🇵', desc: '日本文化・旅行情報サイト', live: true }
  { name: 'Natsumi', title: 'ラッピングショップ', url: null, emoji: '🎁', desc: 'プレゼント用ラッピング用品 (準備中)', live: false }
  { name: 'Haruhi', title: 'はるひのプロジェクト', url: null, emoji: '🌸', desc: '近日公開', live: false }

Display:
  - Page title: 江口ファミリーのビジネス
  - Subtext: 家族のプロジェクトをすべて紹介します
  - A card for each business:
      Coloured emoji area (using member colour)
      Business title
      Description
      Owner avatar + name
      URL as a tappable link (if live: true)
      If live: false — show a dashed border and 準備中 tag
  Note: The 準備中 cards are motivational — they show Haruhi and Natsumi
  that there is a space ready for them when they launch.

2. Create the Learning Hub page
Path: src/app/(app)/learning/page.tsx
Link to it from the menu page.

Seed the following resources as static data for MVP.
These can be moved to the database in a future phase.

Resources:
  { title: 'HTMLとCSSの基本', category: 'HTML/CSS', url: 'https://developer.mozilla.org/ja/docs/Learn/HTML', target: 'Haruhi', level: '入門' }
  { title: 'はじめてのウェブサイト公開', category: 'HTML/CSS', url: 'https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web', target: 'Haruhi', level: '中級' }
  { title: 'Shopifyでネットショップを始める', category: 'EC', url: 'https://www.shopify.com/jp/blog/start-online-store', target: 'Natsumi', level: '入門' }
  { title: 'メルカリで販売を始める方法', category: 'EC', url: 'https://www.mercari.com/jp/help_center/', target: 'Natsumi', level: '入門' }
  { title: 'ChatGPTをビジネスに使う方法', category: 'AI', url: 'https://openai.com/blog', target: null, level: '入門' }
  { title: 'Claudeで文章を改善する', category: 'AI', url: 'https://claude.ai', target: null, level: '入門' }
  { title: 'SNSマーケティング基礎', category: 'ビジネス', url: 'https://www.instagram.com', target: 'Natsumi', level: '入門' }
  { title: 'ゼロからのビジネスプラン作成', category: 'ビジネス', url: 'https://j-net21.smrj.go.jp', target: null, level: '入門' }

Display:
  - Page title: 学習リソース
  - Horizontal scrollable filter chips: すべて / HTML/CSS / ビジネス / AI / EC
  - Filtered list of resource cards:
      Icon area (category-based emoji: 💻 HTML/CSS, 🛒 EC, 🤖 AI, 📖 ビジネス)
      Resource title
      Category tag
      Level tag
      If target is set: "[name]さんにおすすめ" tag in member colour
      On tap: open URL in new tab
  - Empty state if no resources match filter (shouldn't happen with seed data)

3. Update the Menu page
Path: src/app/(app)/menu/page.tsx
Display:
  - User profile card (avatar, name, email)
  - Navigation list:
      🏢 ファミリーショーケース → /showcase
      📚 学習リソース → /learning
  - Family members section:
      List all users from Supabase with avatar and name
      Show (あなた) next to the current user
  - Sign out button at the bottom (use Clerk's useClerk().signOut())

Acceptance criteria:
- Showcase page shows all 6 businesses
- Live businesses have clickable links
- Non-live businesses have dashed borders and 準備中 tags
- Learning hub shows all 8 resources
- Category filter works correctly
- Member colour tags appear for targeted resources
- Menu page links to showcase and learning hub
- Sign out works correctly
- No TypeScript errors
- No console errors
```

## Test Before Continuing
- [ ] Showcase shows all 6 businesses with correct styling
- [ ] Links open in new tab for live businesses
- [ ] Learning hub filter chips work
- [ ] Member-targeted resources show correct colour tags
- [ ] Menu links navigate correctly
- [ ] Sign out works
- [ ] No console errors

---

---

# PHASE 7 — Admin View

## Goal
Give Ryo a simple admin panel to manage family members
and monitor the app health.

## Cursor Prompt

```
This is Phase 7 of a multi-phase build of 江口ファミリーハブ.
Phases 0–6 are complete. Now we build the admin panel for Ryo only.
Do only what is listed here.

Context:
- Only the user whose clerk_id matches ADMIN_CLERK_ID in env can access this
- All other users get a 403 redirect
- Admin panel is accessible via /admin

1. Create admin middleware protection
In src/middleware.ts, add a check:
If the request path starts with /admin and the user's clerk_id does not match
ADMIN_CLERK_ID from env, redirect to /.

2. Create the admin layout
Path: src/app/admin/layout.tsx
Simple layout with:
  - Header: 🔧 管理パネル — Ryo only
  - Back link to main app: アプリに戻る →
  - No bottom navigation (this is separate from the main app)

3. Create the admin dashboard
Path: src/app/admin/page.tsx
Display four stat cards:
  - Total members
  - Total ideas
  - Total projects
  - Total living document versions

Query these from Supabase using the service role key (bypass RLS).
Use SUPABASE_SERVICE_ROLE_KEY for all admin queries.

4. Create the members management page
Path: src/app/admin/members/page.tsx
Display a table of all users:
  Name, email, role, created_at, idea count, project count
Add a button per row: ロールを変更 (toggle between 'member' and 'admin')
On click: PATCH /api/admin/members/[id]/role

5. Create the member role update API route
Path: src/app/api/admin/members/[id]/role/route.ts
Method: PATCH
Verify the requester is the admin.
Toggle the user's role in Supabase.
Return { success: true }

6. Create the AI health check page
Path: src/app/admin/health/page.tsx
A simple page with a button: AIをテストする
On click: POST to /api/admin/test-ai
Show the raw response from Claude.
This lets Ryo verify the AI is working without going through the full flow.

7. Create the AI test API route
Path: src/app/api/admin/test-ai/route.ts
Method: POST
Send a simple test message to Claude:
  "「テスト」とだけ日本語で返信してください。"
Return the response text.

Acceptance criteria:
- /admin is inaccessible to non-admin users (redirected to /)
- Dashboard shows real counts from Supabase
- Members page lists all users
- Role toggle works
- AI health check calls Claude and shows the response
- No TypeScript errors
- No console errors
```

## Test Before Continuing
- [ ] Non-admin users are redirected from /admin
- [ ] Dashboard stats are accurate
- [ ] Members list shows all users
- [ ] Role toggle updates in Supabase
- [ ] AI health check returns a response from Claude
- [ ] No console errors

---

---

# PHASE 8 — Polish + Vercel Deploy

## Goal
Final refinements, error handling, loading states,
and deployment to Vercel.

## Cursor Prompt

```
This is Phase 8 — the final phase of 江口ファミリーハブ.
Phases 0–7 are all complete and tested. Now we polish and deploy.
Do only what is listed here.

1. Add loading states
Every page that fetches from Supabase should show a loading skeleton.
Create a reusable SkeletonCard component in src/components/ui/SkeletonCard.tsx.
It should be a grey animated pulse placeholder (use Tailwind animate-pulse).
Use it on: home page, ideas list, projects list, living document page.

2. Add error boundaries
Create a reusable ErrorMessage component in src/components/ui/ErrorMessage.tsx.
Show it when a Supabase or Claude API call fails.
Message: 読み込みに失敗しました。ページを更新してみてください。
Include a retry button.

3. Add empty states to all list pages
Ideas list: まだアイデアがありません。最初のアイデアを追加しましょう！
Projects list: まだプロジェクトはありません。アイデアをプロジェクトに昇格させましょう！
Each empty state includes a relevant CTA button.

4. Confirm all Japanese copy is natural
Review every piece of UI text.
Avoid overly formal keigo. Aim for warm, casual Japanese as if speaking to a younger sibling.
Flag anything that sounds stiff.

5. Add a simple PWA manifest
Path: public/manifest.json
{
  "name": "江口ファミリーハブ",
  "short_name": "EguchiHub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFAF5",
  "theme_color": "#F97B6B",
  "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
}
Add a placeholder icon file at public/icon-192.png.
Link the manifest in app/layout.tsx.
This allows family members to install the app to their phone home screen.

6. Deploy to Vercel
  a. Push the repo to GitHub
  b. Import the project in Vercel
  c. Add all environment variables from .env.local to Vercel's environment settings
  d. Deploy
  e. After deploy, update NEXT_PUBLIC_APP_URL to the Vercel URL in production env vars

7. Smoke test on production
After deploy, test the following critical paths on a real mobile device:
  - Sign in
  - Complete onboarding flow
  - Idea is saved to Supabase
  - Project is created with living document
  - Email notification is received
  - Admin panel is accessible only to Ryo

Acceptance criteria:
- App deploys to Vercel without build errors
- All critical paths work on mobile
- Loading states show while data is fetching
- Errors are caught and show a user-friendly message
- PWA manifest is valid (test with Chrome DevTools → Application → Manifest)
```

## Test Before Continuing
- [ ] Vercel build succeeds with no errors
- [ ] Sign in works on production
- [ ] Full onboarding flow works on a mobile device
- [ ] Email is received after a project update
- [ ] PWA can be added to home screen on iOS and Android
- [ ] Admin panel works on production

---

---

# Summary Checklist

| Phase | Feature | Status |
|---|---|---|
| 0 | Project setup + dependencies | ☐ |
| 1 | Auth + layout + navigation | ☐ |
| 2 | Onboarding flow | ☐ |
| 3 | Claude API + idea save | ☐ |
| 4 | Projects + living documents | ☐ |
| 5 | Email notifications | ☐ |
| 6 | Showcase + learning hub | ☐ |
| 7 | Admin panel | ☐ |
| 8 | Polish + deploy | ☐ |

---

# Notes for Cursor

- This is a phased build. Complete and test each phase before starting the next.
- Never add features from a future phase into a current phase.
- All user-facing text must be in Japanese.
- The app is mobile-first. Max width 390px, centred on desktop.
- All design tokens (colours, border-radius, fonts) are defined in Phase 0. Use them consistently.
- The Claude API model is always claude-sonnet-4-5.
- Never expose ANTHROPIC_API_KEY or SUPABASE_SERVICE_ROLE_KEY to the client.
  All Claude and admin Supabase calls must happen in API routes (server-side only).
- Row Level Security is enabled on all sensitive tables. Respect it.
# 江口ファミリーハブ (Eguchi Family Hub)

A private, Japanese-language family workspace for the Eguchi family. Members brainstorm business ideas using free AI tools (ChatGPT, Claude, Perplexity), paste the output into the Hub, which polishes it using the Claude API and saves it as a private idea. Ideas can be upgraded into public living documents (projects) that update over time.

## Overview

This is a mobile-first, invite-only family workspace application built specifically for the Eguchi family. The app helps family members develop and refine business ideas through AI-assisted conversations, then share them as collaborative living documents.

**Family Members:** Ryo (admin), Yoko, Haruhi, Natsumi, Motoharu

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk (invite-only, no public signup) |
| Database + Storage | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o |
| Email | Resend |
| Deployment | Vercel |
| Icons | Lucide React |
| Fonts | Noto Sans JP (Google Fonts) |

## Features

- **Private Idea Management**: Each family member can create and manage their own private business ideas
- **AI-Powered Chat Agent**: Interactive chat interface that guides users through idea refinement using OpenAI GPT-4o
- **Living Documents**: Ideas can be upgraded to public projects with version-controlled living documents
- **Family Showcase**: Display all family businesses and projects
- **Learning Hub**: Curated resources for family members to learn and grow
- **Email Notifications**: Automatic notifications when projects are updated
- **Admin Panel**: Management interface for Ryo to oversee the family workspace

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Clerk account (for authentication)
- Supabase account (for database)
- OpenAI API key (for GPT-4o)
- Resend API key (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Eguchi-Family
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Set up the database schema in Supabase (see [Database Setup](#database-setup))

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_CLERK_ID=
```

**Important**: Never commit `.env.local` to version control. All API keys must remain private.

## Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables and Row Level Security policies:

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

## Design System

### Colours

- **Primary**: `#F97B6B` (coral — buttons, highlights)
- **Primary Light**: `#FDECEA`
- **Secondary**: `#F9C784` (amber — accents)
- **Background**: `#FFFAF5` (warm off-white)
- **Surface**: `#FFFFFF` (cards)
- **Text**: `#2D2D2D`
- **Muted**: `#9E9E9E`
- **Success**: `#7CC9A0`
- **Success Light**: `#EBF7F2`
- **Border**: `#F0E8DF`

### Member Avatar Colours

- Ryo: `#7CC9A0`
- Yoko: `#F9C784`
- Haruhi: `#B5A4E0`
- Natsumi: `#F97B6B`
- Motoharu: `#7BBFDC`

### Typography

- **Font**: Noto Sans JP (weights: 400, 600, 700, 800)
- **Border Radius**: 16px cards, 12px buttons, 24px modals

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── ideas/          # Private ideas management
│   │   ├── projects/       # Public projects and living documents
│   │   ├── onboarding/     # New member onboarding flow
│   │   ├── inspiration/    # Idea inspiration page
│   │   ├── showcase/       # Family business showcase
│   │   ├── learning/       # Learning resources hub
│   │   └── menu/           # User menu and settings
│   ├── admin/              # Admin panel (Ryo only)
│   ├── api/                # API routes
│   │   ├── ideas/          # Idea-related endpoints
│   │   ├── projects/       # Project-related endpoints
│   │   ├── auth/           # Authentication sync
│   │   └── admin/          # Admin endpoints
│   └── sign-in/            # Clerk sign-in page
├── components/
│   ├── home/               # Home page components
│   ├── layout/             # Layout components (Header, BottomNav)
│   └── ui/                 # Reusable UI components
└── lib/
    ├── supabase-client.ts  # Supabase client helpers
    ├── supabase-server.ts  # Server-side Supabase
    ├── supabase-admin.ts   # Admin Supabase (service role)
    ├── openai.ts           # OpenAI client
    ├── openai.ts           # OpenAI client (legacy)
    ├── resend.ts           # Resend email client
    └── emails/             # Email templates
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Development Notes

- The app is mobile-first with a maximum width of 390px, centred on desktop
- All user-facing text is in Japanese
- The app uses Row Level Security (RLS) in Supabase for data protection
- All AI API calls happen server-side only (never expose API keys to the client)
- The application was built in phases (see `Cursor AI Handoff Document.md` for details)

## Deployment

### Vercel Deployment

1. Push the repository to GitHub
2. Import the project in Vercel
3. Add all environment variables from `.env.local` to Vercel's environment settings
4. Deploy
5. After deployment, update `NEXT_PUBLIC_APP_URL` to the Vercel URL in production environment variables

### Post-Deployment Checklist

- [ ] Sign in works on production
- [ ] Complete onboarding flow works on a mobile device
- [ ] Ideas are saved to Supabase correctly
- [ ] Projects are created with living documents
- [ ] Email notifications are received
- [ ] Admin panel is accessible only to Ryo
- [ ] PWA can be added to home screen on iOS and Android

## Security

- All routes except `/sign-in` are protected by Clerk authentication
- Row Level Security (RLS) is enabled on all sensitive Supabase tables
- API keys are never exposed to the client
- Admin routes are protected by middleware checking `ADMIN_CLERK_ID`
- No public signup — only invited family members can access the app

## Contributing

This is a private family project. For development guidelines and phase-by-phase implementation details, refer to `Cursor AI Handoff Document.md`.

## License

Private — Family use only.

---

Built with ❤️ for the Eguchi family

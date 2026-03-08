# Family Workspace - Master Handoff Document

**Project:** Private family entrepreneurship web application  
**Client:** Eguchi Family (Ryo, Yoko, Motoharu, Haruhi, Natsumi)  
**Timeline:** 7 weeks to MVP  
**Deployment:** Vercel via GitHub

---

## 📋 READ THIS FIRST

This document is your entry point to building the Family Workspace. It references all other technical specifications and provides the context you need to implement this project successfully.

**Before writing any code:**
1. Read this entire document
2. Review all referenced documents below
3. Understand the user journey
4. Check the existing prototype codebase

---

## 🎯 Project Vision

### What We're Building

A private, mobile-first web app that helps family members:
1. **Discover** their entrepreneurial potential through AI-guided assessment
2. **Validate** business ideas through conversational AI
3. **Execute** projects with AI-generated milestones
4. **Collaborate** with family members for support and feedback

### Why It Exists

The Eguchi family wants to build businesses together but needs:
- Structured guidance without overwhelming complexity
- AI as a supportive partner (not a teacher)
- Privacy for early-stage ideas
- Family collaboration on active projects
- Continuous learning and adaptation

### Core Philosophy

**Speed over perfection.** Small wins. Always encouraging. No jargon. Invisible frameworks. AI adapts to the user, not vice versa.

---

## 👥 User Personas

### Primary Users

**Yoko (35)** - Designer, creative, time-limited
- Wants: Side income without quitting job
- Needs: Quick wins, visual feedback, encouragement
- Fears: Failure, wasting time, complexity

**Ryo (38)** - Developer, analytical, ambitious
- Wants: Scalable business, technical challenges
- Needs: Data, metrics, efficiency
- Fears: Getting stuck in details, scope creep

**Haruhi (15), Natsumi (13), Motoharu (11)** - Students
- Wants: Learn entrepreneurship, creative projects
- Needs: Age-appropriate guidance, support
- Fears: Making mistakes, being judged

### User Journey

```
NEW USER
   ↓
ONBOARDING (5-7 min assessment)
   ↓
PROFILE COMPLETE (superpower + ideas)
   ↓
IDEA EXPLORATION (AI chat, 5-10 min)
   ↓
BUSINESS SUMMARY (one-page validation)
   ↓
┌─ KEEP AS IDEA ──→ IDEAS LIST
│
└─ PROMOTE TO PROJECT
       ↓
   MILESTONE 1, 2, 3
       ↓
   WEEKLY REFLECTION (Friday 7pm)
       ↓
   AI INSIGHT + UPDATES
       ↓
   COMPLETE ALL MILESTONES
       ↓
   GENERATE NEXT 3 MILESTONES
       ↓
   REPEAT OR PIVOT
```

---

## 📚 Documentation Structure

### Core Documents (Read in Order)

1. **design-system.md** - Visual design, colors, typography, components
2. **database-schema.sql** - Tables, RLS policies, TypeScript types
3. **api-specification.md** - All API routes, request/response formats
4. **component-inventory.md** - React components to build
5. **implementation-order.md** - Build sequence, dependencies, checkpoints

### AI Prompts (Critical)

Located in `/lib/ai/prompts/`:

- **discovery.ts** - Generate superpower from assessment
- **validation.ts** - Conversational idea validation
- **milestones.ts** - Generate project milestones
- **reflection.ts** - Weekly reflection insights

**These prompts are the product's intelligence. Treat them as carefully as the UI.**

---

## 🛠 Technical Stack

### Current (Already in Repo)

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **NextAuth.js** (credentials auth)
- **Supabase** (PostgreSQL + Realtime)
- **Vercel** (hosting, deployed via GitHub)

### New Additions

- **Anthropic Claude SDK** (conversational AI)
- **OpenAI API** (structured JSON output)
- **web-push** (push notifications, NO Firebase)
- **date-fns** (date formatting)
- **zod** (validation)
- **@upstash/ratelimit** (rate limiting)

### DO NOT Add

- Redux/Zustand (use React hooks + Supabase Realtime)
- Firebase (use web-push directly)
- Additional UI libraries (build from design system)
- React Query (Supabase handles caching)

---

## 🎨 Design Principles

### Mobile-First

- **Base width:** 320px minimum
- **Target:** 390px (iPhone 14 Pro)
- **Desktop:** Show mobile container centered
- **NO responsive layouts** - mobile only

### Warm Earthy Aesthetic

**NOT generic AI purple/blue gradients.**

Colors:
- Primary: #E85D4A (terracotta)
- Secondary: #F4A259 (warm amber)
- Success: #2A9D5F (forest green)
- Background: #FFF8F0 (cream)

See `design-system.md` for complete palette.

### Distinctive UI Patterns

- **Asymmetric layouts** - Cards stagger 2-4px
- **Organic shapes** - 16px border radius, not perfectly aligned
- **Heavy emoji use** - Primary iconography
- **Warm gradients** - Terracotta → Amber
- **Generous whitespace** - Let it breathe

### Accessibility (WCAG AAA)

- Minimum contrast: 7:1
- Touch targets: 48×48px minimum
- Font size: 16px minimum (prevents iOS zoom)
- Focus states: Always visible
- Screen reader: Full support

---

## 🔐 Security & Privacy

### Row Level Security (RLS)

**Critical:** All Supabase tables have RLS enabled.

- **Ideas:** User can only see their own
- **Projects:** All family can see, only owner can edit
- **Comments:** All family can see/add, only author can edit
- **Activity Feed:** Public activities visible to all, private to owner only

Test RLS policies with multiple users before deployment.

### Authentication

- NextAuth.js session-based
- All API routes check `getServerSession()`
- No API keys in client code
- Rate limiting on AI endpoints

### Data Privacy

- Ideas remain private until promoted
- Family members see generic "exploring idea" in feed
- Comments are family-only, never public
- User profiles contain sensitive discovery data

---

## 🤖 AI Integration Strategy

### Two AI Providers

**Claude (Anthropic)** - For natural conversation:
- Discovery assessment → Superpower generation
- Idea validation chat
- Weekly reflection insights
- Living document updates

**OpenAI (GPT-4o)** - For structured data:
- Business summary JSON
- Milestone generation (array of objects)
- Framework selection

### Why Both?

- Claude: Better at empathy, conversational tone, writing
- OpenAI: Better at strict JSON, structured output
- Use the right tool for the job

### AI Prompt Engineering Rules

1. **Always start with role/persona**
   ```
   You are a supportive AI coach helping the Eguchi family...
   ```

2. **Provide context** - User profile, project history, constraints

3. **Set boundaries**
   - NO jargon
   - NO overwhelming complexity
   - ALWAYS encouraging tone
   - Suggest scaled-down versions

4. **Output format** - Specify JSON structure or conversational

5. **Examples** - Include 2-3 examples of good output

See each prompt file for detailed implementation.

### Cost Management

- **Rate limiting:** 20 AI calls per hour per user
- **Token limits:** Max 1000 tokens per response
- **Caching:** Store AI responses in database
- **Fallbacks:** Templates if AI fails

---

## 📊 Database Design

### Key Tables

- `user_profiles` - Discovery assessment data
- `ideas` - Private business ideas with chat history
- `projects` - Promoted ideas with milestones
- `milestones` - Project goals (not_started → in_progress → completed)
- `tasks` - Milestone sub-tasks
- `activity_feed` - Family activity stream
- `comments` - Project/milestone comments with threading
- `notifications` - Notification queue
- `reflections` - Weekly reflection responses

### State Machines

**Milestone Lifecycle:**
```
not_started → in_progress → completed
    ↑             ↓
    └─────────────┘
(only one in_progress at a time per project)
```

**Project Stages:**
```
planning → active → growing
              ↓
           paused → archived
              ↓
           active (reactivate)
```

### JSONB Fields

- `user_profiles.conversation_insights` - Array of AI observations
- `ideas.chat_messages` - Full conversation history
- `projects.living_document` - Dynamic strategy doc
- `activity_feed.metadata` - Flexible context

**Always validate JSONB structure with Zod before saving.**

---

## 🔄 Real-time Features

### Supabase Realtime

Subscribe to:
- `activity_feed` - New activities appear live
- `comments` - Comments update in real-time
- `notifications` - Notification bell updates

**Connection management:**
- Unsubscribe on component unmount
- Reconnect on network restore
- Max 1 subscription per channel per component

### Push Notifications

**Web Push API only** (NO Firebase):

```typescript
// Service worker: public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    data: { url: data.url }
  });
});
```

**Notification Rules:**
- Max 3 push notifications per week per user
- Quiet hours: 10pm - 8am
- User can opt-out entirely
- Weekly reflection: Friday 7pm

---

## 📝 Coding Standards

### TypeScript

- **Strict mode:** enabled
- **No `any` types** - Use `unknown` and narrow
- **Zod validation** - All user inputs, API responses
- **Export interfaces** - All component props

```typescript
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ children, onClick, disabled = false }: ButtonProps) {
  // ...
}

// Bad
export function Button(props: any) {
  // ...
}
```

### File Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth pages
│   ├── (authenticated)/        # Protected pages
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # Design system
│   ├── discovery/              # Feature components
│   ├── ideas/
│   ├── projects/
│   ├── feed/
│   ├── comments/
│   └── shared/
├── lib/
│   ├── ai/
│   │   ├── prompts/           # AI prompts (CRITICAL)
│   │   ├── claude.ts
│   │   └── openai.ts
│   ├── supabase.ts
│   ├── auth.ts
│   └── utils.ts
└── types/
    └── database.ts            # From schema
```

### Component Patterns

```typescript
// 1. Client components (default)
'use client';

// 2. Server components for data fetching
export default async function ProjectPage({ params }) {
  const project = await getProject(params.id);
  return <ProjectDetail project={project} />;
}

// 3. Use hooks for client-side state
function useProjectProgress(projectId: string) {
  const [progress, setProgress] = useState(0);
  // ...
}
```

### Error Handling

```typescript
// API routes
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // ... logic
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500 }
    );
  }
}

// Components
function ProjectCard({ project }) {
  if (!project) {
    return <EmptyState emoji="📁" title="プロジェクトが見つかりません" />;
  }
  // ... render
}
```

### Testing Strategy

**Manual testing checkpoints** - See implementation-order.md

No unit tests required initially. Focus on:
1. End-to-end user flows
2. Real device testing (iOS + Android)
3. Accessibility testing
4. Load testing AI endpoints

---

## 🚀 Deployment

### Environment Variables

Required in Vercel:

```bash
# Auth
NEXTAUTH_URL=https://family-workspace.vercel.app
NEXTAUTH_SECRET=[generated]

# Database
NEXT_PUBLIC_SUPABASE_URL=[from Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[from Supabase]

# AI
ANTHROPIC_API_KEY=sk-ant-[...]
OPENAI_API_KEY=sk-[...]

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=[generated]
VAPID_PRIVATE_KEY=[generated]

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=[from Upstash]
UPSTASH_REDIS_REST_TOKEN=[from Upstash]

# Email (existing)
RESEND_API_KEY=re_[...]
```

### Continuous Deployment

```bash
# On every push to main:
1. GitHub → Vercel auto-deploys
2. Vercel runs build
3. Environment variables injected
4. Deploy to production

# Branch deployments:
- feature/X → Preview URL
- Test before merging to main
```

### VAPID Key Generation

```bash
npx web-push generate-vapid-keys

# Copy output to .env.local and Vercel
```

---

## ✅ Pre-Implementation Checklist

Before you start coding:

- [ ] Read ALL handoff documents
- [ ] Understand user journey
- [ ] Review existing prototype
- [ ] Set up Supabase database (run migration)
- [ ] Configure environment variables
- [ ] Install new dependencies
- [ ] Update Tailwind config with design tokens
- [ ] Generate VAPID keys
- [ ] Create AI prompt files structure
- [ ] Test existing auth flow

---

## 🎬 Getting Started

### Step 1: Review Existing Codebase

The repo already has:
- Next.js 16 + React 19 configured
- NextAuth.js working
- Supabase connected (basic)
- Tailwind v4 configured
- Deployed to Vercel

**Don't break what's working.**

### Step 2: Run Database Migration

```bash
# 1. Go to Supabase dashboard
# 2. SQL Editor → New Query
# 3. Paste contents of database-schema.sql
# 4. Run migration
# 5. Verify tables created
# 6. Test RLS policies with test users
```

### Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk openai web-push date-fns zod @upstash/ratelimit @upstash/redis
```

### Step 4: Configure Design System

Update `tailwind.config.js` with design tokens from `design-system.md`.

### Step 5: Start with Phase 1

Follow `implementation-order.md` exactly:
1. Foundation (design system components)
2. Discovery (onboarding)
3. Ideas (validation)
4. Projects (execution)
5. Feed (collaboration)
6. Comments
7. Reflections
8. Notifications
9. Milestone generation
10. Polish

**Test at every checkpoint. Deploy frequently.**

---

## 🚨 Common Pitfalls to Avoid

### 1. Skipping RLS Testing

**Problem:** Database wide open, anyone can access anything  
**Solution:** Test with 2+ test accounts immediately

### 2. Hardcoding Colors

**Problem:** Inconsistent UI, hard to maintain  
**Solution:** Always use design tokens from Tailwind config

### 3. Over-engineering Components

**Problem:** Complex, reusable components that are used once  
**Solution:** Build for current needs, refactor when needed

### 4. Ignoring Mobile Performance

**Problem:** Slow on real devices, unresponsive  
**Solution:** Test on real iOS/Android frequently

### 5. AI Prompts as Afterthought

**Problem:** Generic, unhelpful AI responses  
**Solution:** Invest time in prompt engineering, include examples

### 6. No Error Handling

**Problem:** App crashes, user sees blank screen  
**Solution:** Error boundaries, graceful degradation, user-friendly messages

### 7. Forgetting Accessibility

**Problem:** Unusable for some users  
**Solution:** Test with screen reader, keyboard nav, contrast checker

---

## 📞 Support & Feedback

### During Development

If uncertain about:
- **Design decisions:** Reference prototype or ask client
- **Technical approach:** Check implementation-order.md
- **AI prompts:** Review existing examples, test thoroughly
- **Database schema:** Consult database-schema.sql

### After Each Phase

1. Deploy to Vercel
2. Test on real mobile devices
3. Get client feedback
4. Iterate if needed
5. Move to next phase

---

## 🎯 Success Criteria

### MVP Complete When:

- [x] User can complete discovery assessment
- [x] AI generates relevant superpower + ideas
- [x] User can validate idea through AI chat
- [x] Business summary is actionable
- [x] Project created with 3 meaningful milestones
- [x] Milestones can be started/completed
- [x] Activity feed shows family activities
- [x] Comments work with real-time updates
- [x] Weekly reflections generate insights
- [x] Push notifications work on mobile
- [x] All features mobile-optimized
- [x] WCAG AAA accessibility met
- [x] No critical bugs

### User Satisfaction When:

- "This actually helps me start a business"
- "The AI feels supportive, not overwhelming"
- "I'm making progress without stress"
- "My family's feedback is valuable"
- "I want to keep using this"

---

## 📖 Final Notes

This is a **family project**, not a corporate product. The tone, design, and features should reflect:

- **Warmth** over professionalism
- **Encouragement** over optimization
- **Progress** over perfection
- **Together** over alone

Build something the Eguchi family will **actually use and love.**

---

**Now go build something amazing. Good luck! 🌸**

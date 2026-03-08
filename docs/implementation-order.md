# Family Workspace - Implementation Order

**Current Status:** Phase 2 Complete, Phase 3 Partial  
**Next Focus:** AI Migration → Milestones → Reflections  
**Strategy:** Build from foundation up, test at each checkpoint  
**Deployment:** Continuous deployment to Vercel after each phase  

**📄 See CURRENT_STATUS.md for detailed implementation progress**

---

## 📊 Quick Status Overview

**✅ Phase 1: Foundation (COMPLETE)**  
**✅ Phase 2: Discovery + Ideas (COMPLETE)** - needs AI migration  
**🟡 Phase 3: Projects (60% COMPLETE)** - missing milestones UI  
**❌ Phase 4: Feed + Comments (NOT STARTED)**  
**❌ Phase 5: Reflections (NOT STARTED)**  
**❌ Phase 6: AI Agent Polish (NOT STARTED)**  

---

## Pre-Implementation Setup

### ✅ Environment & Dependencies (PARTIALLY COMPLETE)

**Already installed:**
```bash
✅ @supabase/supabase-js
✅ openai
✅ bcryptjs
✅ react-email
✅ resend
```

**Still needed:**
```bash
npm install @anthropic-ai/sdk       # Claude integration
npm install web-push                # Push notifications
npm install date-fns                # Date utilities
npm install zod                     # Validation
npm install @upstash/ratelimit      # Rate limiting
```

### ✅ Database Setup (PARTIALLY COMPLETE)

**Tables created:**
- ✅ users
- ✅ ideas  
- ✅ projects
- ✅ living_documents

**Tables needed:**
- ❌ milestones
- ❌ tasks
- ❌ reflections
- ❌ activity_feed
- ❌ comments
- ❌ reactions
- ❌ notifications
- ❌ push_subscriptions

**Action:** Run remaining migrations from database-schema.sql

---

## ✅ Phase 1: Foundation (COMPLETE)

**Status:** 100% implemented, working in production

### 1.1 Design System Components ✅
- ✅ Tailwind configured with design tokens
- ✅ Button, Card, Input, Textarea
- ✅ Avatar component
- ✅ ProgressBar, Badge
- ✅ SkeletonCard, ErrorMessage
- ✅ Loading states

**Checkpoint:** ✅ All components working

### 1.2 Layout Components ✅
- ✅ MobileContainer (390px max-width)
- ✅ Header with user menu
- ✅ BottomNav with active states
- ✅ App layout structure

**Checkpoint:** ✅ Shell app with navigation working

### 1.3 Database Connection ✅
- ✅ Supabase client (client + server)
- ✅ Admin client for migrations
- ✅ RLS policies working
- ✅ Test data created

**Checkpoint:** ✅ Database read/write working

### 1.4 Authentication ✅
- ✅ NextAuth.js configured
- ✅ Family member system
- ✅ Password-based auth
- ✅ Session management
- ✅ Protected routes

**Checkpoint:** ✅ Login flow complete

---

## ✅ Phase 2: Discovery + Ideas (COMPLETE)

**Status:** 100% UI/flow, needs AI migration to Claude

### 2.1 Onboarding Flow ✅
- ✅ 3-step process (tool → prompt → paste)
- ✅ AI tool selection (ChatGPT, Claude, Perplexity)
- ✅ Copy prompt feature
- ✅ Open external tool
- ✅ Paste result textarea

**Files:** `src/app/(app)/onboarding/page.tsx`

**Checkpoint:** ✅ Full onboarding working

### 2.2 Idea Chat Agent ⚠️ (NEEDS MIGRATION)
- ✅ Chat interface with bubbles
- ✅ Multiple choice options
- ✅ Free text input
- ✅ Loading states
- ⚠️ **Using OpenAI GPT-4o** (should be Claude)

**Files:** 
- `src/app/api/ideas/chat/start/route.ts`
- `src/app/api/ideas/chat/message/route.ts`

**Action Required:** Migrate to Claude Sonnet 4.6 (see MIGRATION_GUIDE.md)

### 2.3 Idea Finalization ✅
- ✅ AI summary generation (OpenAI - keep this)
- ✅ Structured JSON output
- ✅ Idea save to database
- ✅ Redirect to result page

**Files:** `src/app/api/ideas/finalize/route.ts`

**Checkpoint:** ✅ Can save ideas

### 2.4 Ideas Management ✅
- ✅ Ideas list page
- ✅ Idea detail page
- ✅ Edit title
- ✅ Upgrade to project flow
- ✅ Privacy (private to owner)

**Files:** `src/app/(app)/ideas/*`

**Checkpoint:** ✅ Full ideas CRUD working

---

## 🟡 Phase 3: Projects (60% COMPLETE)

**Status:** Basic project functionality working, missing milestones UI

### 3.1 Project Creation ✅
- ✅ Create from idea
- ✅ Visibility selection (public/unlisted)
- ✅ AI-generated living document (OpenAI - keep this)
- ✅ Initial version created

**Files:** `src/app/api/projects/create/route.ts`

**Checkpoint:** ✅ Can create projects

### 3.2 Project Pages ✅
- ✅ Project list page (all family projects)
- ✅ Project detail page
- ✅ Living document display (Markdown)
- ✅ Version history tab
- ✅ Owner info, last updated

**Files:** `src/app/(app)/projects/*`

**Checkpoint:** ✅ Can view projects

### 3.3 Living Document Updates ✅
- ✅ Update form (owners only)
- ✅ AI content merge (OpenAI - keep this)
- ✅ Version increment
- ✅ Change summary
- ✅ Email notifications to family

**Files:** `src/app/api/projects/[id]/update/route.ts`

**Checkpoint:** ✅ Can update living docs

### 3.4 Milestones UI ❌ (NOT STARTED)
- ❌ Milestone list display
- ❌ Milestone creation
- ❌ Task list per milestone
- ❌ Complete milestone flow
- ❌ Progress tracking
- ❌ Current milestone indicator

**Required:**
- Create database tables (milestones, tasks)
- Build MilestoneCard component
- Build TaskCheckbox component
- Implement completion logic

**Checkpoint:** NOT REACHED

### 3.5 Project Activity ❌ (NOT STARTED)
- ❌ Activity timeline
- ❌ Link to feed items
- ❌ Realtime updates

**Checkpoint:** NOT REACHED

---

## ❌ Phase 4: Feed + Comments (NOT STARTED)

**Status:** 0% implemented

### 4.1 Activity Feed ❌
- ❌ Feed page UI
- ❌ Feed item components
- ❌ Activity generation
- ❌ Realtime subscriptions
- ❌ Load more pagination

**Required:**
- activity_feed table
- Supabase Realtime setup
- FeedItem component
- Auto-generate on actions

### 4.2 Comments System ❌
- ❌ Comment form
- ❌ Comment list
- ❌ Threading (3 levels)
- ❌ @mentions
- ❌ Edit/delete
- ❌ Realtime updates

**Required:**
- comments table
- Comment component
- Mention detection
- RLS policies

### 4.3 Reactions ❌
- ❌ Reaction picker
- ❌ Reaction display
- ❌ Add/remove reactions
- ❌ Reaction counts

**Required:**
- reactions table
- ReactionPicker component

---

## ❌ Phase 5: Reflections + Notifications (NOT STARTED)

**Status:** 0% implemented

### 5.1 Weekly Reflection ❌
- ❌ Reflection form (3 questions)
- ❌ Submit flow
- ❌ Reflection history

**Required:**
- reflections table
- ReflectionForm component
- API route

### 5.2 AI Reflection Analysis ❌ (CLAUDE)
- ❌ Decision tree logic
- ❌ Insight generation
- ❌ Living doc updates from reflection
- ❌ Adaptive milestone generation

**Required:**
- Claude integration
- OpenAI for milestones
- /api/reflections/analyze endpoint

### 5.3 Notifications ❌
- ❌ In-app notification bell
- ❌ Notification list
- ❌ Mark as read
- ❌ Push notification setup
- ❌ Friday 7pm reminders

**Required:**
- notifications table
- push_subscriptions table
- web-push library
- VAPID keys

---

## ❌ Phase 6: AI Agent Polish (NOT STARTED)

**Status:** 0% implemented

### 6.1 Project Chat Interface ❌ (CLAUDE)
- ❌ Separate chat page
- ❌ Chat with Claude about project
- ❌ Web search integration
- ❌ Tool calling (get_project_details, search_web)
- ❌ Context management (25 messages)

**Required:**
- /api/projects/[id]/chat endpoint
- ChatInterface component
- Claude tools implementation

### 6.2 Living Doc Update Popup ❌
- ❌ Detect insights on chat close
- ❌ Show popup with proposed changes
- ❌ User confirms/skips
- ❌ Call update API

**Required:**
- Popup component
- Insight extraction logic
- Update confirmation flow

### 6.3 Context Management ❌
- ❌ Last 25 messages storage
- ❌ Anthropic compaction at 150K
- ❌ Session management
- ❌ Context loading

**Required:**
- Message storage (Supabase?)
- Compaction API integration
- Context retrieval logic

---

## 🎯 Revised Timeline

### **Weeks 1-2: AI Migration + Core Features**
- [ ] Migrate idea chat to Claude
- [ ] Create milestones database tables
- [ ] Build milestone UI components
- [ ] Implement milestone creation
- [ ] Test milestone completion

### **Weeks 3-4: Reflections + Activity**
- [ ] Build reflection form
- [ ] Implement Claude reflection analysis
- [ ] Create activity feed tables
- [ ] Build feed UI
- [ ] Add Realtime subscriptions

### **Weeks 5-6: Comments + Notifications**
- [ ] Build comment system
- [ ] Add threading (3 levels)
- [ ] Implement @mentions
- [ ] Set up push notifications
- [ ] Create weekly reminder job

### **Weeks 7+: Polish + Project Chat**
- [ ] Build project chat interface
- [ ] Add web search integration
- [ ] Implement living doc popup
- [ ] Context management
- [ ] Final testing & bug fixes

---

## 🚨 Critical Path

**Must do first:**
1. ✅ Migrate to Claude (better conversations)
2. ✅ Create missing database tables
3. ✅ Build milestones UI (core feature)
4. ✅ Implement reflections (core feature)
5. ✅ Add feed & comments (collaboration)

**Can do later:**
- Push notifications
- Project chat
- Context compaction

---

**Current focus: Complete AI migration, then build milestones UI**

### 2.2 AI Integration - Claude (Day 6-7)

1. ✅ Set up Anthropic SDK
2. ✅ Create discovery prompt (see prompts/discovery.ts)
3. ✅ API route: POST /api/discovery/assessment
4. ✅ Test superpower generation
5. ✅ Test idea suggestions

**Checkpoint:** Assessment generates meaningful superpower + ideas

### 2.3 Profile Storage (Day 7)

1. ✅ Save to user_profiles table
2. ✅ SuperpowerCard component
3. ✅ Confetti animation
4. ✅ Redirect to ideas after completion

**Checkpoint:** Profile saved, onboarding complete

---

## Phase 3: Ideas & Validation (Week 2)

**Goal:** Idea creation → AI chat → Business summary

### 3.1 Idea Management (Day 8-9)

1. ✅ Create idea form
2. ✅ IdeaCard component
3. ✅ Ideas list page
4. ✅ API routes: GET/POST /api/ideas

**Checkpoint:** Can create and view ideas

### 3.2 AI Chat Interface (Day 9-11)

1. ✅ IdeaChat component
2. ✅ Message bubbles (AI left, user right)
3. ✅ Quick reply buttons
4. ✅ API route: POST /api/ideas/[id]/chat
5. ✅ Claude conversation prompt
6. ✅ Chat history persistence

**Checkpoint:** Conversational AI validation working

### 3.3 Business Summary (Day 11-12)

1. ✅ API route: POST /api/ideas/[id]/complete
2. ✅ OpenAI structured output
3. ✅ Framework selection logic
4. ✅ BusinessSummary component
5. ✅ Reality check display

**Checkpoint:** Can generate and view business summary

### 3.4 Promote to Project (Day 12-13)

1. ✅ API route: POST /api/ideas/[id]/promote
2. ✅ Initial milestone generation (OpenAI)
3. ✅ Living document creation
4. ✅ Project creation flow

**Checkpoint:** Idea promoted creates project with 3 milestones

---

## Phase 4: Projects & Execution (Week 3)

**Goal:** Project management + milestones + tasks

### 4.1 Project List & Detail (Day 14-15)

1. ✅ ProjectCard component
2. ✅ Projects list page
3. ✅ ProjectHeader component
4. ✅ AtAGlanceCard component
5. ✅ API routes: GET /api/projects, GET /api/projects/[id]

**Checkpoint:** Can view projects and navigate to detail

### 4.2 Milestone Management (Day 15-17)

1. ✅ MilestoneCard component (3 states)
2. ✅ Task checkboxes
3. ✅ API routes:
   - POST /api/milestones/[id]/start
   - POST /api/milestones/[id]/complete
   - PATCH /api/tasks/[id]
4. ✅ Progress calculation
5. ✅ Milestone completion celebration

**Checkpoint:** Can start, complete milestones, check off tasks

### 4.3 Living Document (Day 17-18)

1. ✅ LivingDocument component
2. ✅ Framework-based sections
3. ✅ Inline editing (optional)
4. ✅ API route: PATCH /api/projects/[id]

**Checkpoint:** Living doc displays correctly, editable

### 4.4 Project Tabs (Day 18)

1. ✅ ProjectTabs component
2. ✅ Tab switching logic
3. ✅ URL state persistence

**Checkpoint:** All 3 tabs working

---

## Phase 5: Activity Feed (Week 3-4)

**Goal:** Family activity feed with privacy

### 5.1 Activity Feed Backend (Day 19-20)

1. ✅ API route: POST /api/activity-feed (internal)
2. ✅ Trigger on milestone completion
3. ✅ Trigger on project creation
4. ✅ Privacy logic (ideas are private)
5. ✅ API route: GET /api/activity-feed

**Checkpoint:** Activities created automatically

### 5.2 Activity Feed UI (Day 20-21)

1. ✅ ActivityCard component
2. ✅ StatsCards component
3. ✅ Feed page layout
4. ✅ Empty state
5. ✅ Infinite scroll (optional)

**Checkpoint:** Feed shows family activities

### 5.3 Supabase Realtime (Day 21)

1. ✅ useSupabaseRealtime hook
2. ✅ Subscribe to activity_feed table
3. ✅ Live update UI on new activities

**Checkpoint:** New activities appear without refresh

---

## Phase 6: Comments & Collaboration (Week 4)

**Goal:** Commenting system with threading

### 6.1 Comment Backend (Day 22-23)

1. ✅ API routes:
   - GET /api/comments
   - POST /api/comments
   - PATCH /api/comments/[id]
   - DELETE /api/comments/[id]
2. ✅ @mention extraction
3. ✅ Thread depth validation (max 3)

**Checkpoint:** Can create, edit, delete comments via API

### 6.2 Comment UI (Day 23-24)

1. ✅ CommentThread component
2. ✅ Nested display (3 levels)
3. ✅ CommentInput component
4. ✅ Edit/delete UI
5. ✅ @mention highlighting

**Checkpoint:** Can comment on projects, milestones

### 6.3 Reactions (Day 24-25)

1. ✅ API routes:
   - POST /api/comments/[id]/reactions
   - DELETE /api/comments/[id]/reactions/[emoji]
2. ✅ ReactionPicker component
3. ✅ Reaction counts display

**Checkpoint:** Can react to comments

### 6.4 Realtime Comments (Day 25)

1. ✅ Subscribe to comments table
2. ✅ Live update on new comments
3. ✅ Live update on reactions

**Checkpoint:** Comments appear in real-time

---

## Phase 7: Reflections (Week 5)

**Goal:** Weekly reflection system

### 7.1 Reflection Form (Day 26-27)

1. ✅ WeeklyReflectionForm component
2. ✅ API route: POST /api/reflections
3. ✅ Claude insight generation
4. ✅ Living doc update logic

**Checkpoint:** Can submit reflection, get AI insight

### 7.2 Reflection Scheduling (Day 27-28)

1. ✅ Scheduled job (Friday 7pm)
2. ✅ Notification trigger
3. ✅ Skip if already reflected this week

**Checkpoint:** Reflection prompt sent on Friday

### 7.3 Reflection Display (Day 28)

1. ✅ ReflectionInsight component
2. ✅ Reflection history view
3. ✅ Link to living doc updates

**Checkpoint:** Can view past reflections

---

## Phase 8: Notifications (Week 5-6)

**Goal:** In-app + push notifications

### 8.1 Notification Backend (Day 29-30)

1. ✅ API route: POST /api/notifications/send (internal)
2. ✅ Triggers:
   - Milestone completion
   - Comment on owned project
   - @mention in comment
   - Weekly reflection
   - Inactive nudge
3. ✅ API routes:
   - GET /api/notifications
   - PATCH /api/notifications/[id]/read
   - POST /api/notifications/mark-all-read

**Checkpoint:** Notifications created correctly

### 8.2 Notification UI (Day 30-31)

1. ✅ NotificationBell component
2. ✅ NotificationList component
3. ✅ useNotifications hook
4. ✅ Mark as read functionality

**Checkpoint:** Can view and manage notifications

### 8.3 Push Notifications (Day 31-33)

1. ✅ Generate VAPID keys
2. ✅ Service worker setup (public/sw.js)
3. ✅ PushPermissionPrompt component
4. ✅ usePushSubscription hook
5. ✅ API routes:
   - POST /api/push/subscribe
   - POST /api/push/unsubscribe
   - POST /api/push/send (internal)
6. ✅ Test on mobile device

**Checkpoint:** Push notifications working on real device

---

## Phase 9: Milestone Generation (Week 6)

**Goal:** AI generates next milestones

### 9.1 Generation Logic (Day 34-35)

1. ✅ API route: POST /api/milestones/generate
2. ✅ OpenAI structured output
3. ✅ Context from reflection/progress
4. ✅ Direction handling (grow/maintain/pivot)

**Checkpoint:** Can generate meaningful next milestones

### 9.2 UI Flow (Day 35)

1. ✅ Prompt when all milestones complete
2. ✅ Direction selection UI
3. ✅ Preview new milestones
4. ✅ Accept/regenerate

**Checkpoint:** Full cycle working (complete → generate → continue)

---

## Phase 10: Polish & Optimization (Week 7)

### 10.1 Rate Limiting (Day 36)

1. ✅ Upstash Redis setup
2. ✅ Rate limit middleware
3. ✅ Apply to AI endpoints
4. ✅ Apply to comment endpoints

**Checkpoint:** Rate limits enforced

### 10.2 Error Handling (Day 37)

1. ✅ Global error boundary
2. ✅ API error responses standardized
3. ✅ User-friendly error messages
4. ✅ Retry logic where appropriate

**Checkpoint:** Graceful error handling everywhere

### 10.3 Performance (Day 37-38)

1. ✅ Image optimization
2. ✅ Code splitting
3. ✅ Database query optimization
4. ✅ Realtime connection management

**Checkpoint:** Fast load times, smooth interactions

### 10.4 Accessibility (Day 38-39)

1. ✅ Screen reader testing
2. ✅ Keyboard navigation
3. ✅ Focus states
4. ✅ ARIA labels
5. ✅ Contrast verification

**Checkpoint:** WCAG AAA compliance

### 10.5 Mobile Testing (Day 39-40)

1. ✅ Test on real iOS device
2. ✅ Test on real Android device
3. ✅ 320px width testing
4. ✅ Notched phone testing
5. ✅ Push notification testing

**Checkpoint:** Perfect on all devices

---

## Testing Checkpoints by Feature

### Discovery Assessment
- [ ] All question types render correctly
- [ ] Progress bar updates
- [ ] AI generates relevant superpower
- [ ] Ideas suggestions make sense
- [ ] Profile saved to database
- [ ] Redirects to home after completion

### Idea Validation
- [ ] Can create new idea
- [ ] AI chat maintains context
- [ ] Quick reply buttons work
- [ ] Chat history persists
- [ ] Business summary generates
- [ ] Promote creates project + milestones

### Project Management
- [ ] Projects list shows all projects
- [ ] Can filter by stage
- [ ] Progress calculates correctly
- [ ] Milestones follow state machine
- [ ] Tasks update milestone progress
- [ ] Living doc updates

### Activity Feed
- [ ] Shows all family activities
- [ ] Ideas shown as private
- [ ] Real-time updates work
- [ ] Stats cards accurate

### Comments
- [ ] Can comment on projects
- [ ] Threading works (3 levels max)
- [ ] @mentions work
- [ ] Reactions work
- [ ] Edit within 24h works
- [ ] Soft delete works
- [ ] Real-time updates work

### Reflections
- [ ] Form validation works
- [ ] AI insight generated
- [ ] Living doc updates
- [ ] Weekly schedule triggers
- [ ] Can view history

### Notifications
- [ ] Created on milestone complete
- [ ] Created on new comment
- [ ] @mentions trigger notification
- [ ] Push notifications send
- [ ] Can mark as read
- [ ] Can mark all as read
- [ ] Links navigate correctly

---

## Deployment Strategy

### After Each Phase:
1. Git commit with descriptive message
2. Push to GitHub
3. Vercel auto-deploys
4. Test on staging
5. Tag stable versions

### Version Tags:
- v0.1 - Phase 1 (Foundation)
- v0.2 - Phase 2 (Discovery)
- v0.3 - Phase 3 (Ideas)
- v0.4 - Phase 4 (Projects)
- v0.5 - Phase 5 (Feed)
- v0.6 - Phase 6 (Comments)
- v0.7 - Phase 7 (Reflections)
- v0.8 - Phase 8 (Notifications)
- v0.9 - Phase 9 (Milestone Gen)
- v1.0 - Phase 10 (Polish)

---

## Critical Path Dependencies

```
Foundation (1)
    ↓
Discovery (2) ──→ Ideas (3) ──→ Projects (4)
                                    ↓
                            Activity Feed (5) ←─── Comments (6)
                                    ↓                   ↓
                            Reflections (7)     Notifications (8)
                                    ↓                   ↓
                            Milestone Gen (9) ←────────┘
                                    ↓
                            Polish (10)
```

**Cannot start:**
- Ideas without Discovery
- Projects without Ideas
- Feed without Projects
- Comments without Feed
- Reflections without Projects
- Notifications without Comments
- Milestone Gen without Reflections

---

## Risk Mitigation

### High Risk Items:
1. **AI API costs** - Implement rate limiting early
2. **Push notifications** - Test on real devices ASAP
3. **Realtime connections** - Monitor Supabase limits
4. **Mobile performance** - Test on real devices frequently

### Contingency Plans:
- AI fails → Fallback to templates
- Push fails → Email notifications only
- Realtime fails → Polling fallback
- Rate limit hit → Queue + retry

---

## Success Criteria

**Phase 1-3:** User can complete onboarding → create idea → get validation
**Phase 4-6:** User can manage project → see progress → get family support
**Phase 7-9:** System learns from user → generates relevant milestones → provides insights
**Phase 10:** App is fast, accessible, bug-free

---

**Follow this order strictly. Test at each checkpoint. Deploy frequently.**

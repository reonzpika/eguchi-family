# Family Workspace - Epics & User Stories

**Purpose:** Product backlog organized by epics with detailed user stories  
**Format:** Epic → User Stories → Acceptance Criteria  
**Status:** Based on current implementation + remaining features  
**Last Updated:** March 2026

---

## 📚 Epic Structure

**Total Epics:** 7  
**Story Points:** Using Fibonacci (1, 2, 3, 5, 8, 13)  
**Priority:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)

---

## Epic 1: Foundation & Authentication

**Goal:** Secure, family-member-based authentication  
**Status:** ✅ Complete  
**Total Points:** 21

---

### Story 1.1: Family Member Sign-In

**As a** family member  
**I want to** sign in with my name and password  
**So that** I can access my private workspace

**Acceptance Criteria:**
- [ ] I can select my name from a dropdown (5 family members)
- [ ] I can enter my password
- [ ] Invalid credentials show clear error in Japanese
- [ ] Successful login redirects to appropriate page (onboarding or home)
- [ ] Session persists across browser refreshes
- [ ] Sign out works correctly

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 1.2: First-Time vs Returning User Detection

**As the** system  
**I want to** detect if a user is new or returning  
**So that** I can show appropriate first experience

**Acceptance Criteria:**
- [ ] New users (0 ideas) see welcome + "Add idea" CTA
- [ ] Returning users see dashboard with their ideas/projects
- [ ] Detection happens on every login
- [ ] No flash of wrong content

**Points:** 3  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 1.3: Password Management

**As a** family member  
**I want to** set my password on first use  
**So that** my account is secure

**Acceptance Criteria:**
- [ ] First-time setup flow prompts for password creation
- [ ] Password must be 6+ characters
- [ ] Password is hashed (bcrypt) before storage
- [ ] Cannot set password twice for same member
- [ ] Admin can reset passwords if needed

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 1.4: Admin Panel Access

**As** Ryo (admin)  
**I want to** access admin functions  
**So that** I can manage the family workspace

**Acceptance Criteria:**
- [ ] Only Ryo can access /admin routes
- [ ] Admin dashboard shows key metrics (members, ideas, projects)
- [ ] Can view all family members
- [ ] Can toggle member roles (admin ↔ member)
- [ ] Can test AI health
- [ ] Non-admins get 403 error

**Points:** 8  
**Priority:** P1  
**Status:** ✅ Done

---

## Epic 2: Idea Discovery & Chat

**Goal:** Help users discover and develop business ideas through AI conversation  
**Status:** ✅ Complete (needs AI migration)  
**Total Points:** 34

---

### Story 2.1: AI Tool Selection

**As a** new user  
**I want to** choose which external AI tool to use  
**So that** I can use a tool I'm comfortable with

**Acceptance Criteria:**
- [ ] See 3 options: ChatGPT, Claude, Perplexity
- [ ] ChatGPT marked as recommended
- [ ] Each has emoji and name
- [ ] Selection stored in session
- [ ] Can change selection by going back
- [ ] Progress shows "Step 1/3"

**Points:** 3  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 2.2: Copy Prompt to External AI

**As a** new user  
**I want to** copy a pre-written prompt  
**So that** I can easily start with external AI

**Acceptance Criteria:**
- [ ] Prompt text displayed in read-only box
- [ ] [Copy] button copies to clipboard
- [ ] Success feedback shown (✓ コピーしました)
- [ ] [Open AI Tool] opens selected tool in new tab
- [ ] Can proceed to next step only after copying
- [ ] Progress shows "Step 2/3"

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 2.3: Paste External AI Output

**As a** user  
**I want to** paste my external AI conversation  
**So that** Family Workspace AI can process it

**Acceptance Criteria:**
- [ ] Large textarea for pasting
- [ ] Minimum 20 characters required
- [ ] Clear instructions in Japanese
- [ ] [Process] button disabled if too short
- [ ] Shows error if empty on submit
- [ ] Progress shows "Step 3/3"

**Points:** 3  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 2.4: AI Chat Interface

**As a** user  
**I want to** chat with Family Workspace AI about my idea  
**So that** I can refine and clarify my business concept

**Acceptance Criteria:**
- [ ] Chat bubbles (AI left, user right)
- [ ] AI messages in warm, encouraging Japanese
- [ ] Can type free text or select options
- [ ] Loading indicator while AI thinks
- [ ] Auto-scroll to latest message
- [ ] Can see full conversation history
- [ ] Clear when conversation is complete

**Points:** 8  
**Priority:** P0  
**Status:** ✅ Done (uses OpenAI, needs Claude migration)

---

### Story 2.5: AI Idea Refinement (Conversational)

**As the** AI agent  
**I want to** explore the user's idea naturally  
**So that** I understand their business concept fully

**Acceptance Criteria:**
- [ ] AI asks one question at a time
- [ ] Questions feel natural, not checklist-like
- [ ] AI acknowledges and builds on user responses
- [ ] AI explores 5 areas: type, customer, method, differentiation, revenue
- [ ] AI detects when exploration is complete
- [ ] No generic business jargon used
- [ ] Conversation tone is warm and encouraging

**Points:** 13  
**Priority:** P0  
**Status:** ⚠️ Partial (needs Claude migration for quality)

---

### Story 2.6: Generate Business Summary

**As a** user  
**I want to** get a structured summary of my idea  
**So that** I can see my concept clearly organized

**Acceptance Criteria:**
- [ ] AI generates title (≤20 chars)
- [ ] AI writes polished description (~150 chars)
- [ ] AI provides 2-3 specific suggestions
- [ ] AI suggests one immediate next step
- [ ] Summary feels personal, not generic
- [ ] Summary in warm, encouraging Japanese
- [ ] Generation takes <8 seconds

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done (OpenAI)

---

### Story 2.7: Save Idea

**As a** user  
**I want to** save my refined idea  
**So that** I can return to it later

**Acceptance Criteria:**
- [ ] Can edit title before saving
- [ ] All AI-generated content saved to database
- [ ] Idea associated with my user account
- [ ] Success message shown (✓ 保存しました)
- [ ] Can access from Ideas list later
- [ ] Timestamp recorded

**Points:** 3  
**Priority:** P0  
**Status:** ✅ Done

---

## Epic 3: Project Creation & Management

**Goal:** Convert ideas into trackable projects with living documents  
**Status:** 🟡 Partial (60% complete)  
**Total Points:** 55

---

### Story 3.1: Upgrade Idea to Project

**As a** user  
**I want to** upgrade my idea to a project  
**So that** my family can see and I can track progress

**Acceptance Criteria:**
- [ ] [Upgrade] button appears after save
- [ ] Explanation of what upgrading means
- [ ] Can choose visibility (public or unlisted)
- [ ] Confirmation screen before creating
- [ ] Project created within 8 seconds
- [ ] Idea marked as "upgraded"
- [ ] Cannot upgrade same idea twice

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 3.2: Generate Living Document

**As the** system  
**I want to** create initial living document from idea  
**So that** user has professional starting point

**Acceptance Criteria:**
- [ ] AI generates Markdown with standard sections:
  * 🎯 Vision
  * 📦 Product/Service
  * 👥 Target Customer
  * 🛒 Sales Method
  * 📋 Next Steps (3 items)
- [ ] Content based on idea summary
- [ ] Tone is warm and encouraging
- [ ] All sections populated
- [ ] Version number = 1
- [ ] Change summary = "初版作成"

**Points:** 8  
**Priority:** P0  
**Status:** ✅ Done (OpenAI)

---

### Story 3.3: View Living Document

**As a** user  
**I want to** see my project's living document  
**So that** I understand my project's current state

**Acceptance Criteria:**
- [ ] Markdown rendered beautifully
- [ ] Mobile-friendly formatting
- [ ] Headers, lists, emphasis work
- [ ] Easy to read on small screens
- [ ] Can switch to version history tab
- [ ] Shows last updated time
- [ ] Shows owner info

**Points:** 5  
**Priority:** P0  
**Status:** ✅ Done

---

### Story 3.4: Update Living Document

**As a** project owner  
**I want to** add new brainstorming content  
**So that** my living document evolves

**Acceptance Criteria:**
- [ ] [Add content] button visible to owner only
- [ ] Textarea for new content
- [ ] AI merges intelligently (no duplication)
- [ ] New version created (v2, v3, etc.)
- [ ] Change summary generated automatically
- [ ] Can cancel without saving
- [ ] Email sent to family on update

**Points:** 8  
**Priority:** P1  
**Status:** ✅ Done (OpenAI)

---

### Story 3.5: View Version History

**As a** user  
**I want to** see how the document evolved  
**So that** I can track changes over time

**Acceptance Criteria:**
- [ ] List all versions (v1, v2, v3...)
- [ ] Each shows change summary
- [ ] Each shows timestamp
- [ ] Sorted newest first
- [ ] Can't edit past versions (future: compare)

**Points:** 3  
**Priority:** P2  
**Status:** ✅ Done

---

### Story 3.6: Create Initial Milestones

**As a** new project owner  
**I want to** get suggested first milestones  
**So that** I know where to start

**Acceptance Criteria:**
- [ ] 3 milestones created automatically
- [ ] Each milestone has title and description
- [ ] Each milestone has 2-4 tasks
- [ ] Milestones in logical order
- [ ] First milestone is simplest
- [ ] All milestones marked "not started"

**Points:** 8  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 3.7: View Milestones

**As a** user  
**I want to** see project milestones  
**So that** I can track my progress

**Acceptance Criteria:**
- [ ] Milestones tab on project page
- [ ] Current milestone highlighted
- [ ] Progress ring shows % complete
- [ ] Can see all tasks for each milestone
- [ ] Visual distinction: not started, in progress, complete
- [ ] Mobile-friendly layout

**Points:** 8  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 3.8: Complete Tasks

**As a** user  
**I want to** check off completed tasks  
**So that** I can see my progress

**Acceptance Criteria:**
- [ ] Checkbox for each task
- [ ] Checked state persists
- [ ] Progress updates automatically
- [ ] Completion celebrated (visual feedback)
- [ ] Cannot uncheck if milestone complete

**Points:** 5  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 3.9: Complete Milestone

**As a** user  
**I want to** mark milestone complete  
**So that** I can move to next phase

**Acceptance Criteria:**
- [ ] All tasks must be checked first
- [ ] [Complete] button appears
- [ ] Confirmation prompt
- [ ] Milestone marked complete
- [ ] Next milestone becomes current
- [ ] Activity feed updated
- [ ] Celebration moment (confetti?)

**Points:** 5  
**Priority:** P1  
**Status:** ❌ Not started

---

## Epic 4: Weekly Reflections

**Goal:** Regular check-ins with AI coaching  
**Status:** ❌ Not started  
**Total Points:** 34

---

### Story 4.1: Reflection Form

**As a** user  
**I want to** submit weekly reflection  
**So that** I can think about my progress

**Acceptance Criteria:**
- [ ] 3 questions displayed:
  1. 今週うまくいったことは？
  2. 小さな勝利はありましたか？
  3. 何かブロックしてることはありますか？
- [ ] Each question optional (can skip)
- [ ] Textarea for each answer
- [ ] Mobile-friendly layout
- [ ] Can save and submit
- [ ] Previous reflections visible

**Points:** 5  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 4.2: AI Reflection Analysis

**As the** system  
**I want to** analyze reflection with Claude  
**So that** I can provide personalized insight

**Acceptance Criteria:**
- [ ] Claude receives reflection answers
- [ ] Claude reviews past 4 reflections
- [ ] Claude checks milestone status
- [ ] Decision tree executed:
  * All done → ask direction
  * Stuck 3+ weeks → simplify
  * Progress → encourage
  * Insight → note
- [ ] Analysis completes <8 seconds

**Points:** 13  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 4.3: Generate AI Insight

**As a** user  
**I want to** receive personalized AI insight  
**So that** I feel understood and supported

**Acceptance Criteria:**
- [ ] Insight references specific details from my reflection
- [ ] Celebrates effort (even if no progress)
- [ ] Gives ONE actionable suggestion
- [ ] 3-4 sentences, warm tone
- [ ] In natural Japanese
- [ ] Never generic ("Good job!")

**Points:** 8  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 4.4: Adaptive Milestone Generation

**As the** system  
**I want to** generate new milestones when needed  
**So that** user always has next steps

**Acceptance Criteria:**
- [ ] Triggered when all milestones complete
- [ ] Or when stuck 3+ weeks (simplify)
- [ ] OpenAI generates 3 new milestones
- [ ] Each has appropriate tasks
- [ ] Difficulty matches user state
- [ ] Saves to database automatically

**Points:** 8  
**Priority:** P1  
**Status:** ❌ Not started

---

## Epic 5: Activity Feed & Collaboration

**Goal:** Family can see and support each other's projects  
**Status:** ❌ Not started  
**Total Points:** 47

---

### Story 5.1: View Projects List

**As a** family member  
**I want to** see all family projects  
**So that** I know what everyone is working on

**Acceptance Criteria:**
- [ ] All public projects visible
- [ ] Filter by status (all, active, planning, complete)
- [ ] Each shows: title, owner, description, status
- [ ] Sorted by recent activity
- [ ] Tapping opens project detail
- [ ] Mobile grid layout

**Points:** 5  
**Priority:** P1  
**Status:** ✅ Done

---

### Story 5.2: Activity Feed

**As a** user  
**I want to** see recent family activity  
**So that** I stay connected

**Acceptance Criteria:**
- [ ] Feed shows recent actions:
  * Project created
  * Milestone completed
  * Living doc updated
  * Reflection submitted
  * Comment added
- [ ] Each item shows: who, what, when
- [ ] Tapping item opens relevant page
- [ ] Realtime updates (Supabase)
- [ ] Infinite scroll or pagination

**Points:** 13  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 5.3: Comment on Projects

**As a** family member  
**I want to** comment on projects  
**So that** I can encourage and support

**Acceptance Criteria:**
- [ ] Comment box on project page
- [ ] Comments visible to all family
- [ ] Can reply to comments (threading, 3 levels max)
- [ ] Can edit/delete own comments
- [ ] Timestamps shown
- [ ] Owner notified of new comments
- [ ] Markdown supported (bold, italic, links)

**Points:** 13  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 5.4: @Mentions

**As a** user  
**I want to** mention family members in comments  
**So that** I can get their attention

**Acceptance Criteria:**
- [ ] Type "@" shows family member list
- [ ] Selecting inserts @Name
- [ ] Mentioned person gets notification
- [ ] @mentions highlighted in comments
- [ ] Works in comment replies too

**Points:** 8  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 5.5: Reactions

**As a** user  
**I want to** add quick reactions  
**So that** I can show support easily

**Acceptance Criteria:**
- [ ] 5 reaction types: 👍❤️🎉💡🤔
- [ ] Can react to: projects, milestones, comments
- [ ] Can add/remove own reactions
- [ ] Count shown for each reaction type
- [ ] Who reacted visible on hover/tap

**Points:** 8  
**Priority:** P2  
**Status:** ❌ Not started

---

## Epic 6: Notifications

**Goal:** Keep users informed and engaged  
**Status:** ❌ Not started  
**Total Points:** 34

---

### Story 6.1: In-App Notifications

**As a** user  
**I want to** see notifications in the app  
**So that** I know what's happening

**Acceptance Criteria:**
- [ ] Bell icon in header shows count
- [ ] Tapping opens notifications list
- [ ] Shows: comments, mentions, reactions, updates
- [ ] Each has clear action (tappable)
- [ ] Mark as read individually
- [ ] Mark all as read option
- [ ] Unread indicator

**Points:** 13  
**Priority:** P1  
**Status:** ❌ Not started

---

### Story 6.2: Push Notifications Setup

**As a** user  
**I want to** enable push notifications  
**So that** I'm reminded on my phone

**Acceptance Criteria:**
- [ ] Permission prompt (web-push)
- [ ] VAPID keys configured
- [ ] Subscription stored in database
- [ ] Can enable/disable per device
- [ ] Settings page for preferences

**Points:** 13  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 6.3: Weekly Reflection Reminder

**As a** user  
**I want to** be reminded to reflect  
**So that** I don't forget

**Acceptance Criteria:**
- [ ] Push notification every Friday 7pm
- [ ] Message: "📝 今週のReflectionの時間です"
- [ ] Tapping opens reflection form
- [ ] Can snooze (not in MVP)
- [ ] Only sent if project active

**Points:** 8  
**Priority:** P2  
**Status:** ❌ Not started

---

## Epic 7: Project Chat (Advanced AI)

**Goal:** Conversational AI support for active projects  
**Status:** ❌ Not started  
**Total Points:** 55

---

### Story 7.1: Project Chat Interface

**As a** user  
**I want to** chat with AI about my project  
**So that** I can get help and ideas

**Acceptance Criteria:**
- [ ] Chat tab on project page
- [ ] Separate from living doc
- [ ] Claude has full project context
- [ ] Natural conversation
- [ ] Can ask anything about project
- [ ] Web search available if needed

**Points:** 13  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 7.2: Web Search Integration

**As** Claude  
**I want to** search the web  
**So that** I can help user with current information

**Acceptance Criteria:**
- [ ] Claude can call search_web tool
- [ ] Search triggered automatically when helpful
- [ ] Results integrated naturally in response
- [ ] User sees "調べてみました..." message
- [ ] Sources cited when relevant

**Points:** 13  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 7.3: Living Doc Update Popup

**As a** user  
**I want to** approve living doc updates from chat  
**So that** I control my document

**Acceptance Criteria:**
- [ ] After 10+ chat messages
- [ ] On chat close, popup appears
- [ ] Shows: "今日の会話で学んだこと"
- [ ] Lists 2-4 key insights
- [ ] Shows what will be updated
- [ ] [更新する] [スキップ] buttons
- [ ] If approved → OpenAI merges content

**Points:** 13  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 7.4: Context Management

**As the** system  
**I want to** manage conversation context  
**So that** Claude remembers our discussion

**Acceptance Criteria:**
- [ ] Last 25 messages kept raw
- [ ] Older messages compacted (Anthropic API)
- [ ] Compaction triggers at 150K tokens
- [ ] Context loaded fresh each turn
- [ ] Session persists during chat
- [ ] No memory between sessions (for now)

**Points:** 13  
**Priority:** P2  
**Status:** ❌ Not started

---

### Story 7.5: Tool Calling Framework

**As** Claude  
**I want to** use tools to help user  
**So that** I can provide better assistance

**Tools needed:**
- [ ] get_conversation_context
- [ ] get_project_details
- [ ] get_reflection_history
- [ ] search_web
- [ ] update_user_profile
- [ ] update_living_document (popup only)

**Points:** 21  
**Priority:** P2  
**Status:** ❌ Not started

---

## 📊 Epic Summary

| Epic | Status | Stories | Points | Priority |
|------|--------|---------|--------|----------|
| 1. Foundation | ✅ Complete | 4 | 21 | P0 |
| 2. Idea Discovery | ⚠️ Partial | 7 | 34 | P0 |
| 3. Projects | 🟡 60% | 9 | 55 | P0-P1 |
| 4. Reflections | ❌ Not started | 4 | 34 | P1 |
| 5. Feed & Collaboration | ❌ Not started | 5 | 47 | P1 |
| 6. Notifications | ❌ Not started | 3 | 34 | P1-P2 |
| 7. Project Chat | ❌ Not started | 5 | 55 | P2 |
| **Total** | **~40%** | **37** | **280** | |

---

## 🎯 Sprint Planning

### **Sprint 1-2: AI Migration (Current)**
- Story 2.5 (migrate to Claude)
- Points: 13
- Duration: 2 weeks

### **Sprint 3-4: Milestones**
- Stories 3.6-3.9
- Points: 26
- Duration: 2 weeks

### **Sprint 5-6: Reflections**
- Epic 4 (all stories)
- Points: 34
- Duration: 2 weeks

### **Sprint 7-8: Collaboration**
- Epic 5 (all stories)
- Points: 47
- Duration: 2 weeks

### **Sprint 9+: Notifications & Chat**
- Epics 6-7
- Points: 89
- Duration: 3-4 weeks

---

**Total estimated time to complete all epics: 11-13 weeks (2.5-3 months)**

**Current progress: ~100 points complete (~35%), 180 points remaining**

---

## 🌸 Story Writing Principles

All stories follow:
- **User-centric:** Written from user perspective
- **Valuable:** Each delivers user value
- **Testable:** Clear acceptance criteria
- **Small enough:** Can complete in 1-2 days
- **Independent:** Not blocked by other stories
- **Japanese-aware:** UI text in Japanese

**Ready to build! 頑張って！ 🌸**

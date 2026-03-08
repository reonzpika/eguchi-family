# Execution & Tracking Phase - Design Document

## Overview
The daily operational heart of the app. Where projects come alive through milestones, tasks, progress tracking, and family engagement. This phase keeps family members motivated, accountable, and celebrated as they build their businesses.

---

## Core Principles

1. **Visibility drives accountability** - Family sees each other's progress
2. **Progress is celebrated** - Every win, big or small, gets recognized
3. **AI as semi-active coach** - Helpful without being annoying
4. **Living documents evolve** - Strategy adapts as project grows
5. **Momentum over perfection** - Keep them moving forward

---

## Homepage: Family Activity Feed

### The Heart of the App

**Purpose:** Create positive peer pressure, inspiration, and community support.

**Feed Location:** Main homepage, first thing users see when they open the app.

**What Appears in Feed:**

#### Project Activities (Public)
- ✨ "Yoko started a new project: Handmade Candles 🕯️" (2h ago)
- 🎉 "Haruhi completed Milestone 1: Validate the Idea!" (1d ago)
- 🎯 "Ryo reached Milestone 3 of ClinicPro" (3d ago)
- 💰 "Natsumi's project got its first customer!" (5d ago)
- 🚀 "Motoharu upgraded an idea to a project!" (1w ago)

#### Idea Activities (Private - Generic Only)
- 💡 "Yoko started exploring a new idea!" (4h ago)
- ⬆️ "Haruhi moved an idea to a project!" (2d ago)

**NO title, NO details** - just celebration that someone is thinking/creating.

#### AI Insights (Weekly)
- 🌸 "3 active projects this week - family momentum is strong!"
- 📊 "Family completed 7 milestones this month! 🎊"
- 🔥 "Yoko is on a 4-week streak of weekly updates!"

### Feed Design

```
┌────────────────────────────────────────┐
│  🌸 江口ファミリーハブ         [Avatar] │
├────────────────────────────────────────┤
│                                        │
│  家族の活動                            │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🎉 Yoko                           │ │
│  │ Completed Milestone 1!            │ │
│  │ "Handmade Candles"                │ │
│  │ 2時間前                           │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💡 Haruhi                         │ │
│  │ Started exploring a new idea!     │ │
│  │ 5時間前                           │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🌸 AI Insight                     │ │
│  │ 3 active projects this week!      │ │
│  │ Family momentum is strong 💪      │ │
│  │ 1日前                             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Load more...]                        │
│                                        │
└────────────────────────────────────────┘
```

### Feed Behavior

**Chronological order** - newest first  
**Infinite scroll** - loads more as you scroll  
**No comments on feed** - keeps it simple (comments on project pages)  
**Click to navigate** - tap any item to see full project/profile

**Notifications trigger feed items:**
- Milestone completion → Feed item created
- Project creation → Feed item created
- Idea started → Feed item created (if user opts in to sharing idea activity)

---

## Project Page Structure

### Layout Hierarchy

```
PROJECT PAGE:

┌─────────────────────────────────────────┐
│ [Back] 📁 Handmade Candles              │
│ by Yoko · Planning → Active → Growing  │
├─────────────────────────────────────────┤
│                                         │
│  AT A GLANCE                            │
│  ┌─────────────────────────────────┐   │
│  │ 🎯 Current Focus                │   │
│  │ Milestone 2: Get First Customer │   │
│  │ ✅ 2 of 3 tasks done            │   │
│  │                                 │   │
│  │ Overall Progress:               │   │
│  │ ████████░░░░ 67%               │   │
│  │                                 │   │
│  │ 💡 AI Insight:                  │   │
│  │ "Great progress! You're on track│   │
│  │  to complete this by Saturday." │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TABS: [Milestones] Living Doc Activity│
│                                         │
│  MILESTONES (Default Tab)               │
│                                         │
│  🎯 Milestone 2: First Customer         │
│     ⏳ IN PROGRESS                      │
│     ┌───────────────────────────────┐  │
│     │ ✅ Created samples            │  │
│     │ ✅ Posted on Instagram        │  │
│     │ ☐ Get first order             │  │
│     └───────────────────────────────┘  │
│                                         │
│  ☐ Milestone 3: Scale to 10 customers  │
│     NOT STARTED                         │
│                                         │
│  [+ Add Custom Milestone]               │
│                                         │
│  ✅ COMPLETED (2)                       │
│  > Milestone 1: Validate ✅             │
│  > Milestone 0: Setup ✅                │
│                                         │
└─────────────────────────────────────────┘
```

### At A Glance Section

**Always visible, never scrolls away.**

Shows:
1. **Current milestone** - which one is active
2. **Task progress** - X of Y tasks done
3. **Overall progress bar** - % of all milestones completed
4. **AI insight** - encouragement, reminder, or suggestion

**Progress calculation:**
```
Total progress = (Completed milestones + Current milestone task %) / Total milestones

Example:
- Milestone 1: ✅ Done (100%)
- Milestone 2: ⏳ 2/3 tasks (67%)
- Milestone 3: ☐ Not started (0%)

Progress = (100 + 67 + 0) / 3 = 56%
```

**AI Insight examples:**
- "Great progress! You're on track to complete this by Saturday."
- "It's been 5 days since your last update. Need help with anything?"
- "You're moving fast! Consider pausing to get customer feedback."
- "Milestone 2 is taking longer than expected. Want to adjust the timeline?"

**Insight updates:**
- After every milestone completion
- After weekly reflection
- If project goes inactive >1 week
- When user asks for help

---

## Milestone Management

### Milestone Structure

```javascript
Milestone {
  id: string
  project_id: string
  title: string
  description: string
  order_number: number (1, 2, 3...)
  status: "not_started" | "in_progress" | "completed"
  target_date: date (optional)
  completed_at: date | null
  tasks: Task[]
}

Task {
  id: string
  milestone_id: string
  title: string
  description: string (optional)
  is_completed: boolean
  order_number: number
  completed_at: date | null
}
```

### Milestone States

**NOT STARTED** (☐)
- Grayed out
- Tasks not visible until milestone becomes active
- Can't check off tasks

**IN PROGRESS** (⏳)
- Highlighted
- Tasks visible and interactive
- Progress bar shows task completion
- Only ONE milestone can be "in progress" at a time

**COMPLETED** (✅)
- Moved to bottom "Completed" section
- Collapsed by default
- Click to expand and see completed tasks
- Shows completion date

### Milestone Flow

**Automatic activation:**
When user completes all tasks in current milestone:
1. AI celebrates: 🎉 "You completed Milestone 2!"
2. Current milestone → Status: Completed
3. Next milestone → Status: In Progress (auto-activated)
4. Feed item created
5. Push notification sent
6. Living document updated

**Manual activation:**
User can manually activate a milestone even if previous isn't done:
- Click "Start working on this"
- Confirmation: "This will pause Milestone 2. Continue?"
- Previous milestone → Not Started (if no tasks done) or In Progress (if some done)

### AI-Generated vs User-Created Milestones

**AI-Generated (Initial):**
- 3 milestones created when project starts
- Based on business type and user profile
- Calibrated to confidence + time availability
- Can be edited/deleted by user

**User-Created:**
- User clicks "+ Add Custom Milestone"
- Enters title and description
- AI suggests appropriate tasks
- AI asks: "Where should this go in the sequence?"

**AI Auto-Generation (When completing all milestones):**
When user completes final milestone, AI asks:

```
🎉 Congratulations! You've completed all milestones!

What's next for this project?

[Keep Growing]  → AI generates growth milestones
[Maintain]      → AI generates sustainability milestones  
[Pivot]         → AI asks about new direction
[Pause Project] → Move to "On Hold"
```

**AI-generated next milestones** are contextual:
- **Keep Growing:** Scale to more customers, new products, marketing
- **Maintain:** Systems, automation, quality consistency
- **Pivot:** New target market, different approach, new revenue stream

---

## Living Document

### Purpose
The project's strategic reference - **why it exists, how it works, where it's going.**

**Not a todo list.** That's what milestones/tasks are for.

### AI-Maintained Evolution

Living document is **semi-static** - doesn't change daily, but evolves as project pivots.

**AI updates living doc when:**
- ✅ Milestone completed → Updates "Current Status"
- 📝 Weekly reflection → Adds "Recent Wins" or "Learnings"
- 🔄 Project pivot → Rewrites relevant sections
- 💰 First customer → Updates "Phase" and adds testimonial
- 📊 User shares metrics → Updates "Key Metrics" section

**User can:**
- ✏️ Edit any section manually
- 💬 Add notes/thoughts
- 📌 Pin important insights

### Living Document Structure

Based on framework selected in Phase 2 (invisible to user).

**Example: Physical Product (Lean Canvas framework)**

```markdown
# Handmade Candles

## 🌟 Vision
Build a sustainable side income creating eco-friendly candles that bring calm to people's homes.

## 🎯 Problem
People want natural, non-toxic candles but can't find affordable options locally.

## 👥 Customer Segments
- Young professionals (25-35) in Auckland
- Eco-conscious homeowners
- Gift shoppers

## ✨ Unique Value Proposition
Locally made, 100% soy wax candles with unique NZ-inspired scents at accessible prices.

## 💡 Solution
Handcrafted small-batch candles sold online and at local markets.

## 📣 Channels
- Instagram (primary)
- Weekend markets
- Word of mouth

## 💰 Revenue Streams
- Direct sales: ¥3,000-5,000 per candle
- Subscription boxes (future)

## 💸 Cost Structure
- Materials: ¥800 per candle
- Packaging: ¥200 per candle
- **Profit margin:** ¥2,000-4,000 per unit

## 🏆 Unfair Advantage
Unique scent blends from NZ botanicals + Yoko's design background for beautiful packaging.

## 📊 Key Metrics
- Units sold: 12 (as of Mar 7)
- Customer return rate: 33%
- Average order value: ¥4,200
- Instagram followers: 147

## 🚀 Current Status
**Phase:** Active - Got first customers!  
**Started:** Feb 1, 2025  
**Last Updated:** Mar 7, 2025

**Recent Wins:**
- First market stall went great - sold 8 candles!
- Customer feedback: "Amazing lavender scent"

**Current Challenge:**
Need to speed up production to keep up with demand.

## 📋 Active Milestone
Milestone 2: Scale to 10 customers (2/3 tasks done)
```

**Living Doc Tab on Project Page:**
- Rendered as clean, readable markdown
- Sections collapsible for easy scanning
- "Last updated by AI: 2 days ago"
- Edit button opens markdown editor

---

## Weekly Reflection System

### The Engagement Driver

**Purpose:** Keep projects active, build momentum, create accountability.

**Timing:** Every Friday at 7:00 PM local time

**Delivery:**
1. Push notification: "Time for your weekly project reflection! 🌸"
2. In-app prompt when they open app
3. Email reminder (if push denied)

### Reflection Flow

**Conversational, not a form.**

AI asks 3 questions (one at a time):

**Q1: "What did you work on this week?"**
- Open text response
- AI acknowledges: "Nice! Sounds like good progress on..."

**Q2: "Any wins, even small ones?"**
- Open text response  
- AI celebrates: "That's awesome! 🎉"
- This becomes a feed item if significant

**Q3: "What's blocking you or slowing you down?"**
- Open text response
- Options: "Nothing!", "Time", "Money", "Skills", "Motivation", "Something else"
- AI offers help based on answer:
  - Time → "Want to adjust milestone timeline?"
  - Skills → "Need resources on X?"
  - Motivation → "That's normal! Remember why you started..."

**After reflection:**
- AI updates living document ("Recent Wins", "Current Challenge")
- AI adjusts milestone difficulty if needed
- AI generates insight for project page
- User gets summary: "Thanks! I've updated your project."

**If user skips reflection:**
- No pressure, no guilt
- Gentle reminder next week
- After 3 weeks skipped → "How's the project going? Need help?"

---

## Progress Tracking Mechanics

### Overall Project Progress

**Formula:**
```
Progress % = (
  (Completed milestones * 100) + 
  (Current milestone task completion %)
) / Total milestones
```

**Visual:**
- Progress bar with percentage
- Color gradient: 0-33% (red), 34-66% (yellow), 67-100% (green)
- Updates in real-time as tasks are checked

**Milestone completion triggers:**
- ✅ All tasks checked → Milestone auto-completes
- 🎊 Celebration modal
- 📢 Feed item created
- 🔔 Family notified (if they have push enabled)
- 📝 Living doc updated

### Task Management

**Task actions:**
- ☐ → ✅ Click to complete
- ✅ → ☐ Click to uncomplete (mistakes happen)
- 🗑️ Delete task
- ✏️ Edit task
- ➕ Add new task to milestone

**AI task suggestions:**
When user adds custom milestone, AI suggests tasks:
- "For 'Launch online store', you might need:"
  - Set up Shopify account
  - Add product photos
  - Configure payment
- User can accept all, pick some, or ignore

---

## AI Semi-Active Coaching

### What AI Does (Active)

**✅ Weekly reflection prompt** (Friday 7pm)
**✅ Celebrate milestone completions** (immediately)
**✅ Update living document** (after reflection, milestone completion)
**✅ Generate new milestones** (when current ones done)
**✅ Gentle inactive nudge** (after 2 weeks no activity)

**Inactive project handling:**

**After 2 weeks no activity:**
- Push notification: "How's [project name] going? 💭"
- In-app: AI shows on project page: "Been quiet here! Need help with anything?"

**After 4 weeks no activity:**
- AI asks: "Still working on this? Want to:"
  - Pause project (moves to "On Hold")
  - Get help (AI suggests reducing scope)
  - Delete project

**After 6 weeks no activity:**
- Auto-archive suggestion: "Want to put this on hold? You can reactivate anytime."

**On Hold projects:**
- Don't show in feed
- Don't count for stats
- Can be reactivated with one click
- Not deleted - kept for future

### What AI Doesn't Do (Passive)

**❌ Daily check-ins** (annoying)
**❌ Nag about tasks** (no pressure)
**❌ Compare family members** (no competition)
**❌ Send unsolicited advice** (only when asked)
**❌ More than 3 notifications/week** (frequency limit)

### AI Insight Generation

**On project page "At a Glance" section.**

**Types of insights:**

**Encouraging:**
- "Great progress! You're on track to complete this by Saturday."
- "You've been consistent for 3 weeks - momentum is building!"
- "This milestone is moving faster than expected 🚀"

**Helpful:**
- "Stuck on this task? Want me to break it down further?"
- "This milestone is taking longer than expected. Adjust the timeline?"
- "You mentioned time constraints - want to simplify the scope?"

**Celebratory:**
- "First customer! That's a huge milestone 🎉"
- "You've completed 50% of your project!"
- "3 milestones done - you're really doing this!"

**Checking in:**
- "It's been 5 days since your last update. How's it going?"
- "Need help with anything this week?"

**Insight update frequency:**
- After milestone completion (immediate)
- After weekly reflection (next day)
- After 1 week inactive (gentle)
- After user asks question (responsive)

---

## Push Notification Strategy

### Permission Request

**When:** Immediately on sign-in (first time only)

**How:**
```
┌────────────────────────────────────┐
│  🔔 Stay Connected                 │
│                                    │
│  Get notified when:                │
│  • Family completes milestones     │
│  • It's reflection time            │
│  • Your project needs attention    │
│                                    │
│  [Enable Notifications] [Not Now]  │
└────────────────────────────────────┘
```

**If denied:**
- Don't ask again
- Fall back to email notifications
- In-app banner: "Enable notifications in settings to stay updated"

### Notification Types & Frequency

**High Priority (Always Send):**
1. **Milestone celebration** (yours)
   - "🎉 You completed Milestone 2!"
   - Links to project page

2. **Weekly reflection** (Friday 7pm)
   - "Time for your weekly reflection! 🌸"
   - Links to reflection prompt

3. **Family milestone** (opt-in)
   - "Yoko completed a milestone! 🎊"
   - Links to activity feed

**Medium Priority (User Toggle):**
4. **Inactive project nudge** (after 2 weeks)
   - "How's [project] going? 💭"
   - Links to project page

5. **New family project** (opt-in)
   - "Haruhi started a new project!"
   - Links to activity feed

**Frequency Limit:**
- Maximum 3 notifications per week
- No notifications between 10pm - 8am
- User can customize quiet hours

**User settings:**
```
Notification Preferences:

✅ My milestone completions
✅ Weekly reflection reminders
✅ Family activity updates
☐ Inactive project nudges
☐ AI insights

Quiet Hours: 10pm - 8am
```

---

## Activity Tab (Per Project)

**Shows project-specific timeline:**

```
ACTIVITY TAB:

Mar 7, 2025
• Yoko completed Milestone 2 🎉
• AI updated living document

Mar 6, 2025  
• Yoko checked off "Posted on Instagram"

Mar 5, 2025
• Yoko completed weekly reflection
• AI insight: "Great momentum this week!"

Mar 1, 2025
• Yoko completed Milestone 1
• AI created Milestone 2

Feb 28, 2025
• Yoko added custom task
```

**Purpose:**
- Project history/journal
- See velocity over time
- Accountability for self

**Not for family comments** - that's Phase 4.

---

## Technical Implementation Notes

### Database Schema

```sql
-- Projects (already exists, updates needed)
projects:
  - id
  - user_id
  - idea_id
  - title
  - status (planning, active, growing, maintenance, on_hold)
  - visibility (public, unlisted)
  - framework_type
  - created_at
  - last_activity_at -- NEW
  - progress_percentage -- NEW (calculated)

-- Milestones (already sketched in Phase 2)
milestones:
  - id
  - project_id
  - title
  - description
  - order_number
  - status (not_started, in_progress, completed)
  - target_date (optional)
  - is_ai_generated (boolean)
  - created_at
  - completed_at
  
-- Tasks
tasks:
  - id
  - milestone_id
  - title
  - description (optional)
  - is_completed (boolean)
  - order_number
  - created_at
  - completed_at

-- Activity Feed Items (NEW)
activity_feed:
  - id
  - user_id (who did the action)
  - project_id (nullable - if project-related)
  - idea_id (nullable - if idea-related)
  - type (milestone_complete, project_created, idea_started, etc.)
  - content (JSON - flexible data)
  - created_at

-- Weekly Reflections (NEW)
reflections:
  - id
  - project_id
  - user_id
  - week_of (date - start of week)
  - worked_on (text)
  - wins (text)
  - blockers (text)
  - ai_response (text)
  - created_at

-- Living Documents (already exists)
living_documents:
  - id
  - project_id
  - content (markdown)
  - version_number
  - change_summary
  - updated_by (ai or user)
  - created_at
```

### Real-time Updates

**Use Supabase Realtime for:**
- Activity feed updates (when family does something)
- Milestone completion notifications
- Task check-off (if multiple people viewing same project)

**Websocket subscription:**
```javascript
supabase
  .channel('activity-feed')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'activity_feed' },
    (payload) => {
      // Add new item to feed in real-time
    }
  )
  .subscribe()
```

### Push Notification Implementation

**Web Push API** (service worker required)

```javascript
// Request permission
const permission = await Notification.requestPermission()

// Subscribe to push
const registration = await navigator.serviceWorker.register('/sw.js')
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
})

// Send to server
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify(subscription)
})
```

**Server sends push:**
```javascript
import webpush from 'web-push'

webpush.sendNotification(subscription, JSON.stringify({
  title: "🎉 You completed Milestone 2!",
  body: "Great work on Handmade Candles",
  icon: "/icon-192.png",
  url: "/projects/abc123"
}))
```

### AI Processing Pipeline

**Weekly Reflection Processing:**
```
1. User submits reflection
   ↓
2. AI analyzes responses
   ↓
3. AI updates living document
   - Add to "Recent Wins"
   - Update "Current Challenge"
   - Adjust "Current Status"
   ↓
4. AI generates insight for project page
   ↓
5. AI determines if milestone difficulty needs adjustment
   ↓
6. Store reflection in DB
   ↓
7. Show summary to user
```

**Milestone Completion Processing:**
```
1. User checks last task in milestone
   ↓
2. Milestone auto-completes
   ↓
3. Celebration modal shown
   ↓
4. Activity feed item created
   ↓
5. Push notification sent to user + family (opt-in)
   ↓
6. Living document updated (phase, status)
   ↓
7. Next milestone activated
   ↓
8. If no next milestone: AI prompts for direction
```

---

## Success Metrics

### Engagement Metrics
- Daily active users (family-level)
- Weekly reflection completion rate
- Average time between milestone completions
- Task completion rate
- App session duration

### Progress Metrics
- Projects created per user
- Milestones completed per project
- Average project lifespan before completion/pause
- % of projects that reach Milestone 3

### Social Metrics
- Activity feed engagement (clicks, views)
- Family notification response rate
- Cross-project inspiration (did viewing feed lead to action?)

### AI Effectiveness
- Reflection quality (response length, detail)
- Milestone difficulty calibration (too easy vs too hard)
- Inactive project recovery rate (after nudge)
- AI insight relevance (user feedback)

---

## Edge Cases & Failure Modes

### User Overwhelmed by Milestones
**Symptom:** Tasks pile up, nothing gets done  
**AI Response:** "This seems like a lot. Want to pause some milestones and focus on one?"  
**Action:** Help user hide all but current milestone

### User Completes Tasks Too Quickly
**Symptom:** All 3 milestones done in 3 days  
**AI Response:** "Wow, fast mover! These milestones might be too easy."  
**Action:** Next auto-generated milestones are more challenging

### User Never Does Weekly Reflection
**Symptom:** Skips 4+ weeks in a row  
**AI Response:** Don't nag. After 4 weeks: "Reflections not your thing? Want to try monthly instead?"  
**Action:** Offer monthly check-in alternative

### Push Notifications Denied
**Symptom:** User denies browser permission  
**Action:** Fall back to email, show subtle in-app banner, don't harass

### Multiple Projects Active
**Symptom:** User has 3+ active projects  
**AI Response:** "You're ambitious! Focus is power. Want help prioritizing?"  
**Action:** Suggest putting 1-2 on hold

### Family Not Engaging with Feed
**Symptom:** No one clicks feed items  
**Action:** AI creates more engaging feed items, highlights wins differently

---

## UI/UX Principles

### Progress Visualization
- Always show percentage (concrete)
- Use color psychology (green = good, yellow = caution, red = action needed)
- Animate progress bar changes (satisfying)
- Show trend arrows (↗️ speeding up, → steady, ↘️ slowing)

### Task Management
- One-click check-off (no confirmation)
- Undo available (mistakes happen)
- Drag to reorder (if they want)
- Batch actions (check all, delete all completed)

### Mobile-First Design
- Large tap targets (44px minimum)
- Swipe gestures (swipe task to delete)
- Bottom sheets for forms (easier thumb access)
- Optimize for one-handed use

### Celebration Moments
- Confetti animation on milestone completion
- Haptic feedback (if device supports)
- Sound option (toggle-able)
- Share option ("Share your win!")

---

## Next Phase Connections

### Feeds Into Collaboration (Phase 4)
- Activity feed is foundation for comments
- Living document becomes collaboration space
- Milestones can have family helpers

### Feeds Back to Validation (Phase 2)
- Completed projects inform new idea validation
- Success patterns identified by AI
- User profile updated with new skills learned

### Feeds Back to Discovery (Phase 1)
- "You're good at social media" → Added to skills
- Time spent reveals true time availability
- Confidence grows with milestones → Profile updated

---

## Open Questions for Later

1. Should users be able to share specific milestones/tasks with family for help?
2. Can family members "cheer" or "react" to feed items?
3. Should there be project templates for common business types?
4. Can users set custom reflection schedules (not just weekly)?
5. Should AI create milestone completion certificates/badges?
6. Export project as PDF report for external use?

---

## Design Inspiration

- **GitHub Issues** - clean task management
- **Linear** - beautiful progress tracking
- **Strava** - social fitness feed that motivates
- **Notion** - flexible living document
- **Asana** - milestone/task hierarchy

---

**Document Status:** Complete, ready for Phase 4 discussion  
**Last Updated:** 2025-03-07  
**Next Topic:** Collaboration & Comments (Phase 4)

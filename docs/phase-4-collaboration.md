# Collaboration & Comments Phase - Design Document

## Overview
Family support system through encouragement, advice, and collaboration. Comments create community, accountability, and shared learning across all projects.

---

## Core Principles

1. **Encouragement first** - Comments should feel supportive, not critical
2. **Threaded conversations** - Deep discussions without clutter
3. **Notification-driven** - Always know when family engages with your work
4. **Public by default** - All projects visible to all family (no secrets)
5. **Low friction** - Commenting should be easy and quick

---

## Where Comments Appear

### 1. Project Page (Overall)
**Location:** Main project page, below "At a Glance" section

**Use case:**
- General encouragement: "This looks amazing! 🎉"
- Overall advice: "Have you considered selling at the night markets too?"
- Questions: "How's this going for you?"

**Visual:**
```
┌─────────────────────────────────────┐
│ [Project Page Content]              │
│                                     │
│ TABS: Milestones [Comments] ...    │
│                                     │
│ COMMENTS (24)                       │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 👤 Haruhi · 2h ago           │   │
│ │ This is so cool! Love the    │   │
│ │ packaging design 😍          │   │
│ │                              │   │
│ │ ↪️ Yoko · 1h ago             │   │
│ │   Thanks! Spent ages on it   │   │
│ │                              │   │
│ │ [Reply]                      │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 👤 Ryo · 1d ago              │   │
│ │ Have you thought about bulk  │   │
│ │ pricing for corporate gifts? │   │
│ │                              │   │
│ │ [Reply]                      │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Add Comment...]                    │
└─────────────────────────────────────┘
```

---

### 2. Milestone-Specific Comments
**Location:** Each milestone has its own comment section

**Use case:**
- Specific advice for that milestone: "For your first customer, try reaching out to X"
- Encouragement on progress: "You're moving fast on this one!"
- Offering help: "I can introduce you to someone who needs this"

**Visual:**
```
┌─────────────────────────────────────┐
│ 🎯 Milestone 2: Get First Customer  │
│    ⏳ IN PROGRESS (2/3 tasks)       │
│                                     │
│ [Show Tasks ▼]                      │
│                                     │
│ 💬 Comments (3)                     │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 👤 Motoharu · 4h ago         │   │
│ │ My friend runs a gift shop.  │   │
│ │ Want an intro?               │   │
│ │                              │   │
│ │ ↪️ Yoko · 3h ago             │   │
│ │   Yes please! 🙏             │   │
│ │                              │   │
│ │   ↪️ Motoharu · 2h ago       │   │
│ │      DMing you her contact   │   │
│ │                              │   │
│ │ [Reply]                      │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Add Comment...]                    │
└─────────────────────────────────────┘
```

**Behavior:**
- Comments appear below milestone tasks
- Collapsed by default (shows count)
- Click "Comments (3)" to expand
- Can comment without expanding tasks

---

### 3. Living Document Comments
**Location:** Inline comments on specific sections

**Use case:**
- Question about strategy: "Why target this age group?"
- Suggestion: "Have you considered X for your pricing?"
- Validation: "This value prop is really strong!"

**Visual:**
```
┌─────────────────────────────────────┐
│ LIVING DOCUMENT                     │
│                                     │
│ ## 👥 Customer Segments             │
│ Young professionals (25-35)         │
│ in Auckland                         │
│                                     │
│ 💬 2 comments                       │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 👤 Ryo · 2d ago              │   │
│ │ Why 25-35 specifically?      │   │
│ │                              │   │
│ │ ↪️ Yoko · 2d ago             │   │
│ │   They have disposable       │   │
│ │   income and care about      │   │
│ │   eco-friendly products      │   │
│ │                              │   │
│ │ [Reply]                      │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Comment on this section...]        │
│ ────────────────────────────────────│
│                                     │
│ ## ✨ Unique Value Proposition      │
│ Locally made, 100% soy wax...       │
│                                     │
│ 💬 0 comments                       │
│ [Comment on this section...]        │
└─────────────────────────────────────┘
```

**Implementation:**
- Each markdown section (## heading) is comment-able
- Comments appear below the section
- Section-specific, not document-wide
- AI-generated sections can be questioned/discussed

---

### 4. Activity Feed Item Comments
**Location:** Directly on feed items

**Use case:**
- Quick reactions: "Congrats! 🎉"
- Questions: "How did you do this so fast?"
- Encouragement: "Keep going! 💪"

**Visual:**
```
┌────────────────────────────────────┐
│  ACTIVITY FEED                     │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 🎉 Yoko                       │ │
│  │ Completed Milestone 2!        │ │
│  │ "Handmade Candles"            │ │
│  │ 2時間前                       │ │
│  │                               │ │
│  │ 💬 5 comments                 │ │
│  │                               │ │
│  │ ┌────────────────────────┐   │ │
│  │ │ 👤 Haruhi · 1h ago      │   │ │
│  │ │ Congrats!! 🎊           │   │ │
│  │ │                         │   │ │
│  │ │ ↪️ Yoko · 45m ago       │   │ │
│  │ │   Thank you! 😊         │   │ │
│  │ └────────────────────────┘   │ │
│  │                               │ │
│  │ [Add comment...]              │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**Behavior:**
- Comments appear inline on feed items
- Collapsed by default (shows count)
- Click to expand
- Quick input field always visible

---

## Comment Structure & Threading

### Comment Data Model

```javascript
Comment {
  id: string
  user_id: string (who wrote it)
  
  // Context - ONE of these is set
  project_id: string | null
  milestone_id: string | null
  living_doc_section: string | null (section heading)
  activity_feed_item_id: string | null
  
  // Threading
  parent_comment_id: string | null (if reply)
  thread_depth: number (0 = top-level, 1 = reply, 2 = reply to reply)
  
  // Content
  content: string
  mentions: string[] (user_ids mentioned with @)
  
  // Metadata
  created_at: timestamp
  updated_at: timestamp
  is_edited: boolean
  is_deleted: boolean (soft delete - shows [deleted])
}
```

### Threading Rules

**Maximum depth: 3 levels**
- Level 0: Top-level comment
- Level 1: Reply to comment
- Level 2: Reply to reply
- Level 3+: Not allowed (flatten to level 2)

**Why limit depth?**
- Mobile UI gets cramped with deep nesting
- Conversations should stay focused
- Forces new top-level comment if topic changes

**Visual threading:**
```
Comment A (Level 0)
├─ Reply to A (Level 1)
│  └─ Reply to reply (Level 2)
│     └─ Further reply (Level 2 - flattened)
└─ Another reply to A (Level 1)
```

**Thread collapse:**
- Threads with 5+ replies auto-collapse
- Show: "👤 Name and 4 others replied"
- Click to expand full thread

---

## Comment Features

### 1. Mentions (@username)

**Behavior:**
- Type "@" triggers family member dropdown
- Select name to mention
- Mentioned user gets notification

**Visual:**
```
┌─────────────────────────────────┐
│ @Ryo what do you think about    │
│ this pricing strategy?          │
│                                 │
│ [Post Comment]                  │
└─────────────────────────────────┘
```

**Notification:**
```
🔔 Yoko mentioned you in a comment
"@Ryo what do you think about this pricing strategy?"

[View Comment]
```

### 2. Reactions (Optional - Keep Simple)

**Quick emotional responses without typing:**

**Available reactions:**
- 👍 Agree / Like
- ❤️ Love / Support
- 🎉 Celebrate
- 💡 Great idea
- 🤔 Thinking

**Visual:**
```
┌─────────────────────────────────┐
│ 👤 Haruhi · 2h ago               │
│ This packaging design is amazing!│
│                                  │
│ 👍 3  ❤️ 2  🎉 1                 │
│                                  │
│ [Reply] [👍 React]               │
└─────────────────────────────────┘
```

**Implementation:**
- Reactions stored separately (not as comments)
- Click to add/remove reaction
- Shows who reacted (hover tooltip)
- No notification for reactions (too noisy)

### 3. Rich Text (Minimal)

**Supported formatting:**
- **Bold** (`**text**`)
- *Italic* (`*text*`)
- `Code` (`` `text` ``)
- Links (auto-detected)
- Line breaks

**Not supported:**
- Images (can link to images)
- Headers
- Lists
- Tables

**Why minimal?**
Comments should be quick and conversational, not blog posts.

### 4. Edit & Delete

**Edit:**
- Only your own comments
- Within 24 hours of posting
- Shows "edited" indicator
- No edit history (keep simple)

**Delete:**
- Only your own comments
- Soft delete: shows "[deleted]" instead of content
- Replies remain (thread structure intact)
- Project owner can delete any comment on their project

**Visual:**
```
┌─────────────────────────────────┐
│ 👤 Yoko · 3h ago (edited)        │
│ Actually, I changed my mind...   │
│                                  │
│ [Reply] [Edit] [Delete]          │
└─────────────────────────────────┘
```

---

## Notification System for Comments

### Who Gets Notified?

**1. Project Owner**
- Gets notified for ALL comments on their project
- Regardless of where (project, milestone, living doc, feed)

**2. Mentioned Users (@username)**
- Get notified when mentioned in any comment
- Highest priority notification

**3. Thread Participants**
- If you commented in a thread, you get notified of new replies
- Can opt out per thread ("Mute thread")

**4. Milestone Participants**
- If you commented on a milestone, get notified of milestone completion
- "Milestone you commented on was completed!"

### Notification Delivery

**Push Notification (if enabled):**
```
🔔 Haruhi commented on your project
"This packaging design is amazing!"

[View Comment]
```

**In-App Notification Bell:**
```
┌────────────────────────────────┐
│ 🔔 Notifications (3)           │
├────────────────────────────────┤
│ 💬 Haruhi commented            │
│    "This packaging design..."  │
│    2h ago                      │
├────────────────────────────────┤
│ 💬 Ryo mentioned you           │
│    "@Yoko what do you think.." │
│    4h ago                      │
├────────────────────────────────┤
│ 🎉 Milestone completed         │
│    You commented on this!      │
│    1d ago                      │
└────────────────────────────────┘
```

**Email Digest (Opt-in):**
- Daily or weekly summary
- "You have 5 unread comments"
- Links to each comment

### Notification Settings

**User can control:**
```
Comment Notifications:

✅ Comments on my projects
✅ Mentions (@me)
✅ Replies to my comments
☐ All family comments (noisy!)

Delivery:
✅ Push notifications
✅ In-app notifications
☐ Email digest (daily)
```

---

## Comment Use Cases & Examples

### Use Case 1: Encouragement

**Context:** Yoko completed Milestone 1

**Feed item:**
> 🎉 Yoko completed Milestone 1: Validate the Idea!

**Comments:**
```
👤 Haruhi · 1h ago
Congrats Yoko!! So proud of you 🎉

👤 Ryo · 45m ago  
Nice! What was the feedback like from the 3 people you talked to?

  ↪️ Yoko · 30m ago
  All positive! Two said they'd buy immediately at ¥4,000

    ↪️ Ryo · 20m ago
    That's strong validation. You might be able to price higher!

👤 Motoharu · 10m ago
🔥🔥🔥
```

---

### Use Case 2: Advice

**Context:** Comment on Living Doc section

**Section:** ## 💰 Revenue Streams

**Comments:**
```
👤 Ryo · 2d ago
Have you considered subscription boxes? Monthly candle delivery 
could create recurring revenue.

  ↪️ Yoko · 2d ago
  Interesting! But I'd need consistent production capacity first.

    ↪️ Ryo · 1d ago
    Fair point. Maybe a "candle of the month club" once you're 
    producing 20+ per week?

  ↪️ Haruhi · 1d ago
  I'd subscribe to that! 😍
```

---

### Use Case 3: Offering Help

**Context:** Comment on Milestone

**Milestone:** Get First Customer

**Comments:**
```
👤 Motoharu · 4h ago
My friend runs a gift shop in Ponsonby. Want an intro?

  ↪️ Yoko · 3h ago
  Yes please! 🙏 That would be amazing

  ↪️ Motoharu · 2h ago
  DMing you her contact now. Tell her I sent you!

  ↪️ Yoko · 1h ago
  Just emailed her. Thank you so much!! ❤️
```

---

### Use Case 4: Asking Questions

**Context:** Comment on Project Page

**Comments:**
```
👤 Haruhi · 5h ago
How long does it take you to make one candle?

  ↪️ Yoko · 4h ago
  About 30 minutes once I have everything set up. But the 
  cooling takes 4 hours.

    ↪️ Haruhi · 3h ago
    So you could batch-make like 10 at once?

    ↪️ Yoko · 2h ago
    Exactly! That's the plan for scaling
```

---

### Use Case 5: Celebration Thread

**Context:** Feed item - First customer milestone

**Comments:**
```
👤 Ryo · 1h ago
FIRST CUSTOMER!! 🎊🎉🥳

👤 Haruhi · 55m ago
OMG YES!! Who bought it??

  ↪️ Yoko · 50m ago
  A woman at the weekend market! She bought 3 candles!

👤 Motoharu · 45m ago
That's awesome! Did you get her feedback?

  ↪️ Yoko · 40m ago
  She loved the lavender scent. Already wants to order more!

👤 Natsumi · 30m ago
This is so inspiring! 😊

👤 Ryo · 20m ago
@Yoko you should post about this on Instagram with her 
permission. Social proof!

  ↪️ Yoko · 15m ago
  Great idea! I'll ask her
```

---

## AI Role in Comments

### What AI Does NOT Do:
❌ Comment on projects itself (would feel fake)  
❌ Moderate/filter comments (family should be trusted)  
❌ Suggest comment topics  
❌ Auto-reply on user's behalf

### What AI CAN Do:
✅ **Summarize comment themes** in living doc updates:
   - "Family suggests: subscription model, bulk pricing"
   
✅ **Highlight helpful advice** in project insights:
   - "💡 Ryo suggested a subscription model in comments - worth exploring?"

✅ **Detect when question is asked** in comments:
   - Shows on project page: "Unanswered question from Haruhi in comments"

✅ **Comment analytics** (private to project owner):
   - "You've received 15 comments this week - family is engaged!"
   - "Most discussed topic: Pricing strategy"

---

## Technical Implementation

### Database Schema

```sql
-- Comments
comments:
  - id (uuid)
  - user_id (uuid) -- who wrote it
  
  -- Context (ONE of these is non-null)
  - project_id (uuid, nullable)
  - milestone_id (uuid, nullable)
  - living_doc_section (text, nullable) -- section heading
  - activity_feed_item_id (uuid, nullable)
  
  -- Threading
  - parent_comment_id (uuid, nullable)
  - thread_depth (int, default 0)
  
  -- Content
  - content (text)
  - mentions (uuid[], array of mentioned user_ids)
  
  -- Metadata
  - created_at (timestamp)
  - updated_at (timestamp)
  - is_edited (boolean)
  - is_deleted (boolean)

-- Reactions (optional)
reactions:
  - id (uuid)
  - comment_id (uuid)
  - user_id (uuid)
  - type (enum: thumbs_up, heart, celebrate, idea, thinking)
  - created_at (timestamp)

-- Notifications
notifications:
  - id (uuid)
  - user_id (uuid) -- who receives it
  - type (enum: comment, mention, reply, milestone_comment_completed)
  - comment_id (uuid, nullable)
  - is_read (boolean)
  - created_at (timestamp)
```

### Real-time Comment Updates

**Supabase Realtime subscription:**

```javascript
// Subscribe to comments on a project
supabase
  .channel(`project:${projectId}:comments`)
  .on('postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'comments',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      // Add new comment to UI in real-time
      addCommentToUI(payload.new)
    }
  )
  .subscribe()
```

**Optimistic UI:**
- Show comment immediately when user posts
- Gray out while sending
- Confirm when saved
- Remove if failed (with retry option)

---

## Comment UI/UX Details

### Input Field Design

**Simple textarea with formatting buttons:**

```
┌─────────────────────────────────────┐
│ Add a comment...                    │
│                                     │
│ [B] [I] [@] [🔗]                    │
│                                     │
│ [Cancel] [Post Comment]             │
└─────────────────────────────────────┘
```

**Features:**
- Auto-expand as you type
- @ autocomplete for mentions
- Markdown shortcuts (** for bold, * for italic)
- Ctrl/Cmd+Enter to submit
- Auto-save draft (don't lose work)

### Mobile Considerations

**Tap targets:**
- Minimum 44px for all buttons
- Easy to hit "Reply" even on small screens

**Swipe gestures:**
- Swipe left on comment → Edit/Delete (if yours)
- Swipe right → Quick react (👍)

**Bottom sheet for compose:**
- Full-screen comment composer on mobile
- Easier to write longer comments
- Preview before posting

### Comment Ordering

**Default: Chronological (oldest first)**
- Makes conversations flow naturally
- Threading maintains context

**Option: Newest first**
- See latest activity quickly
- User preference setting

**Pinned comments (optional):**
- Project owner can pin important comment to top
- Example: "Update: Pivoting to corporate clients based on feedback"

---

## Privacy & Safety

### Who Can See Comments?

**All family members can see:**
- Comments on public projects (all projects are public to family)
- Comments on activity feed items

**Comment visibility rules:**
- Cannot see comments on ideas (ideas are private)
- When idea → project, idea comments don't carry over
- Comments are always family-only (never public outside family)

### Comment Moderation

**Self-moderation model:**
- Family is small and trusted
- No automated moderation needed
- Project owner can delete comments on their project
- Admin (Ryo) can delete any comment if needed

**Report feature (future):**
- If family grows, add "Report comment" option
- Sends notification to admin
- Admin reviews and takes action

### Data Retention

**Comments are permanent** (unless deleted by user/owner)

**Deleted comments:**
- Show "[deleted]" instead of content
- Preserve thread structure
- Username removed
- Timestamp remains

**Edited comments:**
- Show "(edited)" indicator
- No edit history (keep simple)
- 24-hour edit window

---

## Success Metrics

### Engagement Metrics
- Comments per project (average)
- % of projects with at least 1 comment
- % of family members who comment regularly
- Average response time to comments

### Social Metrics
- Thread depth (are conversations happening?)
- Mention usage (are people @-ing each other?)
- Reaction usage (quick engagement)
- Cross-project commenting (does Yoko comment on Haruhi's project?)

### Impact Metrics
- Do commented-on projects complete faster?
- Do comments lead to pivots/changes?
- Family sentiment (are comments positive?)
- Help offers in comments → actual help given

---

## Edge Cases & Failure Modes

### Negative Comments
**Symptom:** Someone writes discouraging comment  
**Response:** Project owner can delete, family culture should self-correct  
**Prevention:** Family is small and supportive - unlikely scenario

### Comment Spam
**Symptom:** Too many comments in short time  
**Response:** Rate limit (max 10 comments/5 minutes)  
**Prevention:** Family size makes this unlikely

### Notification Overload  
**Symptom:** User gets 20 notifications in one day  
**Response:** Batch notifications (group by project)  
**Prevention:** Notification settings let users control frequency

### Dead Threads
**Symptom:** Question asked in comment, never answered  
**Response:** AI surfaces unanswered questions to project owner  
**Action:** "Haruhi asked a question 3 days ago - want to respond?"

### Threading Confusion
**Symptom:** User replies to wrong comment in thread  
**Response:** UI makes parent comment context clear  
**Prevention:** Visual threading indicators

---

## Future Enhancements (Phase 5+)

### Comment Features to Consider Later:
- 📸 Image attachments in comments
- 🎥 Video replies (Loom-style)
- 🔖 Save/bookmark important comments
- 📊 Comment analytics dashboard
- 🔍 Search comments across all projects
- 🏷️ Tag comments by topic (#pricing, #marketing)
- 📌 Pin multiple comments (not just one)
- 👥 Tag team members in comments (when family grows)

### Collaboration Features:
- 🤝 "Helper" role on projects (family can volunteer)
- 📋 Shared tasks (assign to family member)
- 📅 Shared calendar (family project events)
- 💬 Direct messaging (1:1 vs public comments)

---

## UI/UX Design Inspiration

- **GitHub Issues** - clean threading, mentions
- **Notion** - inline comments on content
- **Slack** - emoji reactions, threading
- **Linear** - minimalist comment UI
- **Figma** - contextual comments on specific elements

---

## Open Questions for Later

1. Should there be a "mark as helpful" for advice comments?
2. Can users save/bookmark particularly useful comments?
3. Should AI analyze comment sentiment over time?
4. Private comments (DM) vs public comments on project?
5. Comment templates for common encouragement?
6. Can comments turn into tasks/milestones?

---

**Document Status:** Complete - All 4 core phases documented  
**Last Updated:** 2025-03-07  
**Next Steps:** Architecture planning, implementation roadmap

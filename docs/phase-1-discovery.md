# Discovery & Ideation Phase - Design Document

## Overview
A mandatory onboarding experience that helps family members discover their entrepreneurial potential through an exciting, conversational AI assessment.

---

## Core Principles

1. **Conversation, not interrogation** - Feel like talking to a supportive coach
2. **Excitement, not intimidation** - Celebrate strengths, show possibilities
3. **Personal, not generic** - Reference their actual life and context
4. **Quick wins** - Show value immediately, not after weeks

---

## Initial Assessment Flow

### Duration: 5-7 minutes
### When: Mandatory before accessing any other app features
### Tone: Warm, encouraging, personal

### Question Sequence

#### 1. Natural Strengths
**Question:** "What's something you're naturally good at that people often ask you for help with?"
- **Type:** Open text input
- **Why:** Makes them think of real moments, not abstract skills
- **AI Response:** Acknowledges and reframes as potential strength

#### 2. Energy & Interests  
**Question:** "When you have free time, what do you find yourself doing?"
- **Type:** Quick pick buttons + "something else" option
- **Options:** Creative projects, Learning new things, Helping others, Making things, Organizing/planning, Social activities, Something else...
- **Why:** Reveals interests without directly asking

#### 3. Time Reality
**Question:** "How much time could you realistically spend on a side project each week?"
- **Type:** Button selection
- **Options:** 
  - 2-5 hours
  - 5-10 hours  
  - 10+ hours
  - Not sure yet
- **Why:** Sets realistic expectations, prevents overwhelm

#### 4. Problem Sensing
**Question:** "What frustrates you in daily life? What do you wish was easier?"
- **Type:** Open text input
- **Why:** Great entrepreneurs solve problems they personally feel
- **AI Response:** "That's a great observation..." + explores if it's a common problem

#### 5. Learning Preference
**Question:** "How do you prefer to learn new things?"
- **Type:** Multi-select buttons
- **Options:** Watching videos, Reading articles, Hands-on doing, Talking to people
- **Why:** AI adjusts teaching style in future interactions
- **Storage:** Affects how AI presents information later

#### 6. Success Vision
**Question:** "If this project works out, what would success look like for you?"
- **Type:** Multi-select buttons
- **Options:**
  - Extra income for the family
  - Creative outlet
  - Helping others  
  - Learning new skills
  - Building something lasting
  - Being my own boss
- **Why:** Reveals true motivation beyond money

#### 7. Confidence Check
**Question:** "On a scale of 1-5, how confident are you about starting a business?"
- **Type:** 1-5 scale with emojis
- **Scale:** 😰 → 😟 → 😐 → 🙂 → 😊
- **Why:** Calibrates AI's level of encouragement and handholding
- **Effect:** 
  - 1-2: More handholding, simpler first steps
  - 4-5: More challenge, faster pace

---

## Assessment Completion

### AI Generates Immediately:

#### 1. Warm Summary
"Here's what I learned about you, [Name]..."
- Highlights 2-3 key strengths
- Acknowledges their situation (time, confidence level)
- Sets encouraging tone

#### 2. Your Superpower
A highlighted card showing one reframed strength:
- Example: "Organizing" → "You're a Systems Thinker - you see how to make chaos into clarity"
- Makes them feel capable
- Screenshot-worthy visual moment

#### 3. Initial Business Ideas (2-3)
Tailored specifically to their profile:
- Not generic ideas
- References their actual skills/interests
- Shows quick feasibility check for each
- Format: "Based on your [skill] and interest in [topic], you could..."

#### 4. Next Step Invitation
"Want to explore one of these ideas together?"
- Clear call to action
- Low pressure
- Starts their first idea conversation

### Visual Celebration
- Confetti animation 🎉
- "Your entrepreneurial profile is ready! 🌸"
- Shareable superpower card
- Smooth transition to idea exploration

---

## User Profile Structure

### Stored Data (invisible to user):

```javascript
{
  // Core Attributes
  skills: ["cooking", "organizing", "teaching"],
  interests: ["gardening", "vintage fashion", "helping neighbours"],
  
  // Resources & Constraints
  resources: {
    time_per_week: "5-10 hours",
    budget_level: "low", // inferred from conversation
    available_space: null // learned later
  },
  constraints: [
    "needs flexible hours",
    "no physical store",
    "limited startup capital"
  ],
  
  // Learning & Communication
  learning_style: ["visual", "hands-on"],
  confidence_level: 2,
  
  // Motivation & Goals
  success_drivers: ["extra income", "creative outlet"],
  
  // Evolution Data
  business_ideas_explored: [
    { id: "...", title: "...", status: "exploring" }
  ],
  conversation_insights: [
    {
      date: "2025-03-07",
      insight: "Mentioned frustration with expensive organic produce",
      relevance: "potential business opportunity"
    },
    {
      date: "2025-03-08", 
      insight: "Lights up when talking about helping neighbours",
      relevance: "motivation indicator"
    }
  ],
  
  // Profile Metadata
  created_at: "2025-03-07",
  last_updated: "2025-03-08",
  completeness: 0.7 // how much AI knows about them
}
```

---

## Profile Evolution Mechanisms

### 1. During Idea Conversations
- AI extracts new skills mentioned
- Notes constraints that come up
- Identifies hidden interests
- Updates confidence if they take action

### 2. During Project Updates
AI notices patterns:
- "You've been consistent with social media - that's a new skill!"
- "You mentioned budget concerns 3 times - let's talk about low-cost strategies"

### 3. Natural Clarifying Questions
AI asks when context is missing:
- "You mentioned you like teaching - have you ever taught anything before?"
- "When you say 'organizing', what kinds of things do you organize?"

### 4. Explicit Profile Updates
User can update their profile directly:
- "Actually, I have more time now" → AI adjusts recommendations
- "I learned X skill recently" → AI incorporates immediately

---

## Excitement Factors

### Immediate Wins
✅ See unique strengths right away (not in 3 weeks)  
✅ Get personalized ideas instantly  
✅ Permission to start: "You don't need an MBA to do this"  
✅ See possibilities, not obstacles

### Visual Moments
🎨 Confetti on completion  
🎨 "Superpower" card (screenshot-worthy)  
🎨 Business ideas as exciting cards, not boring lists  
🎨 Progress indication that feels good, not stressful

### Emotional Tone
❤️ Warm, not clinical  
❤️ "I notice you..." not "Users typically..."  
❤️ Encouraging, not pushy  
❤️ "This could work because..." not "You should..."  
❤️ Celebrate every input: "That's a great observation about..."

### What We Skip (Boring Parts)
❌ No "Rate yourself 1-10 on communication skills"  
❌ No long dropdown menus  
❌ No "What's your target demographic?" (they don't know yet!)  
❌ No business jargon  
❌ No overwhelming frameworks at this stage

---

## Technical Implementation Notes

### AI Model Requirements
- Conversational tone (not robotic)
- Context retention across questions
- Ability to probe deeper when answers are vague
- Pattern recognition in responses
- Profile synthesis capability

### Data Storage
- Profile data stored in Supabase
- Incremental updates, not overwrites
- Insights tagged with dates and relevance
- Privacy: only user can see their own profile

### User Experience
- Single-page flow (no page refreshes)
- Auto-save progress (can resume if interrupted)
- Skip option for sensitive questions (with gentle encouragement)
- Clear visual progress indicator
- Mobile-first design (family uses phones)

---

## Success Metrics for Discovery Phase

### Completion Metrics
- % of users who complete full assessment
- Average time to complete
- Drop-off points (which question loses them)

### Engagement Metrics  
- Quality of text responses (length, detail)
- Do they explore suggested business ideas?
- Do they come back to add more to profile?

### Outcome Metrics
- % who start an idea conversation immediately after
- % who create their first project within 7 days
- Family feedback: "Did this feel helpful?"

---

## Next Phase Connections

### Feeds Into Validation & Planning
- Profile data powers AI business model coaching
- Skills inform feasibility analysis
- Constraints shape realistic first steps
- Motivation affects how AI frames challenges

### Feeds Into Execution & Tracking
- Learning style affects how progress is presented
- Time availability sets milestone pace
- Confidence level determines support frequency

---

## Open Questions for Later

1. Should profile be visible to family members? (Probably not - keeps it safe)
2. How often should AI suggest re-assessment? (6 months? Annual?)
3. Can users manually trigger profile updates anytime?
4. Should there be a "Profile Strength" indicator visible to user?
5. How do we handle profile data if someone doesn't use app for months?

---

## Design Inspiration

- Duolingo's playful onboarding
- Calm app's gentle question flow
- Notion's setup wizard that feels productive
- 16Personalities test results page (celebrates your type)

---

**Document Status:** Foundation complete, ready for next phase discussion  
**Last Updated:** 2025-03-07  
**Next Topic:** Business Frameworks & Validation Phase

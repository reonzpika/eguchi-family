# Family Workspace AI System - Complete Overview

**Purpose:** This document explains how AI works throughout the entire Family Workspace app  
**Audience:** Developers, product managers, anyone implementing AI features  
**Last Updated:** March 2026

---

## 🎯 AI Philosophy

### **Core Principle**
The AI is a **warm, supportive family coach** - not a consultant, not a teacher, not a task manager.

**Think:** Your encouraging aunt who believes in you  
**Not:** A business professor grading your work

---

## 🧠 Two AI Systems (Hybrid Architecture)

### **System 1: Claude Sonnet 4.6 (Conversational)**

**What it's for:** Natural, empathetic conversations

**Use cases:**
- Idea exploration chat (helping user think through ideas)
- Project Q&A chat (answering questions, giving advice)
- Weekly reflection analysis (understanding user's progress)

**Why Claude:**
- ✅ Better at natural dialogue
- ✅ More empathetic and supportive
- ✅ Superior context retention (200K tokens)
- ✅ Excellent tool calling
- ✅ Adaptive conversation flow

**Example:**
```
User: "I'm not sure if people would buy this..."

Claude: "それは大事な質問ですね。実際に、友達や知り合いに
「これ、¥3,000で買う？」って聞いてみましたか？
本当の反応を聞くのが一番確実ですよ。"
```

---

### **System 2: OpenAI GPT-4o (Structured Output)**

**What it's for:** Generating structured data

**Use cases:**
- Business summary generation (JSON with specific fields)
- Living document creation (Markdown with sections)
- Living document updates (content merging)
- Milestone generation (array of milestones with tasks)

**Why OpenAI:**
- ✅ Excellent at JSON output
- ✅ Reliable formatting
- ✅ Good at structured tasks
- ✅ Fast for one-shot generation

**Example:**
```json
{
  "title": "ハンドメイドキャンドル販売",
  "target_customer": "30-40代の女性、自然派志向",
  "problem": "市販のキャンドルは添加物が多い",
  "solution": "100%天然素材のキャンドルを手作り",
  "pricing": "¥2,500-3,500/個",
  "next_immediate_step": "友達3人に試作品を見せて反応を確認"
}
```

---

## 📊 AI Decision Matrix

**When to use which AI:**

| Feature | AI System | Why |
|---------|-----------|-----|
| Idea exploration chat | Claude | Open conversation, adaptive questions |
| Business summary | OpenAI | Structured JSON output |
| Project creation | OpenAI | Markdown document with sections |
| Project Q&A chat | Claude | Natural conversation, context retention |
| Living doc updates | OpenAI | Content merging, reliable formatting |
| Weekly reflection | Claude | Understanding user state, empathy |
| Milestone generation | OpenAI | Array of structured objects |

**Rule of thumb:**
- Need conversation? → Claude
- Need structured data? → OpenAI

---

## 🗺️ AI Journey Map

### **Phase 1: Discovery (Not AI-powered in current implementation)**

**Current:** External AI tool (ChatGPT/Claude/Perplexity)  
**Flow:** User pastes external AI conversation → Family Workspace AI processes it

**Why external AI first:**
- Removes dependency on our AI quota
- Lets user choose familiar tool
- Still gets benefits of our processing

---

### **Phase 2: Idea Exploration (Claude)**

**Entry point:** User pastes external AI output  
**What happens:**

1. **Start conversation** (`/api/ideas/chat/start`)
   - Claude receives pasted text
   - Asks first clarifying question
   - Natural, warm tone
   - No forced checklist

2. **Continue conversation** (`/api/ideas/chat/message`)
   - Claude maintains context
   - Explores 5 key areas naturally:
     * Business type
     * Target customer
     * Sales method
     * Differentiation
     * Revenue model
   - User drives the conversation
   - Claude adapts to responses

3. **Finalize idea** (`/api/ideas/finalize`)
   - OpenAI generates structured summary
   - Extracts key information as JSON
   - Creates title, description, suggestions
   - Suggests next immediate step

**User experience:**
- Feels like talking to a supportive friend
- Not interrogation or checklist
- AI asks follow-up questions naturally
- Conversation ends when ready

---

### **Phase 3: Project Creation (OpenAI)**

**Entry point:** User clicks "Upgrade to Project"  
**What happens:**

**Living Document Generation** (`/api/projects/create`)
- OpenAI receives idea summary
- Generates initial living document (Markdown)
- Structured sections:
  * 🎯 Vision
  * 📦 Product/Service
  * 👥 Target Customer
  * 🛒 Sales Method
  * 📋 Next Steps (3 items)
- Warm, encouraging tone
- Specific to their idea

**User experience:**
- Instant living document
- Professional but warm
- Actionable next steps
- Ready to start

---

### **Phase 4: Project Updates (OpenAI)**

**Entry point:** User adds new brainstorming content  
**What happens:**

**Content Merging** (`/api/projects/[id]/update`)
- OpenAI receives:
  * Existing living document
  * New content from user
- Intelligently merges:
  * Preserves existing structure
  * Adds new insights
  * Updates relevant sections
  * Generates change summary
- Creates new version

**User experience:**
- Living document evolves naturally
- No duplicate information
- Clear version history
- Seamless updates

---

### **Phase 5: Weekly Reflections (Claude + OpenAI)**

**Entry point:** User submits weekly reflection (3 questions)  
**What happens:**

**Step 1: Analysis** (`/api/reflections/analyze` - Claude)
- Claude receives:
  * Reflection answers
  * Past 4 weeks of reflections
  * Current project state
  * Current milestones
- Analyzes using decision tree:
  * All milestones done? → Ask direction
  * Stuck 3+ weeks? → Simplify approach
  * Good progress? → Encourage
  * Learning shared? → Update living doc

**Step 2: Action** (depends on analysis)
- **If milestones needed** → OpenAI generates new milestones
- **If insight found** → Claude updates living doc
- **If stuck** → Claude suggests simpler approach

**Step 3: Response**
- Claude generates warm, personal insight
- References specific things user mentioned
- Celebrates effort (even if no progress)
- Gives ONE actionable suggestion

**User experience:**
- Feels heard and understood
- Gets personalized coaching
- Not judged for slow progress
- Clear next step

---

### **Phase 6: Project Chat (Claude)**

**Entry point:** User opens project chat (separate from living doc)  
**What happens:**

**Conversational Support** (`/api/projects/[id]/chat`)
- Claude receives:
  * Project context
  * Living document
  * Recent reflections
  * User's message
- Responds naturally:
  * Answers questions
  * Offers perspectives
  * Can search web for data
  * Helps user think

**Living Doc Update Flow:**
1. User chats with Claude (10+ messages)
2. User closes chat
3. **Popup appears:** "Living Documentを更新しますか？"
4. Shows what Claude learned
5. User clicks [更新する] or [スキップ]
6. If confirmed → OpenAI merges insights

**User experience:**
- Separate from living doc updates
- Chat for thinking, popup for updating
- User always in control
- No surprise document changes

---

## 🛠️ AI Tools & Capabilities

### **Claude's Tools (Conversational)**

**1. get_conversation_context**
- Loads user profile, project state, conversation history
- Called at start of every conversation
- Ensures Claude has full context

**2. get_user_profile**
- Fetches user strengths, interests, time, confidence
- Used to personalize responses

**3. get_project_details**
- Retrieves project state, milestones, living doc
- Gives Claude full project context

**4. get_reflection_history**
- Past 4 weeks of reflections
- Helps detect patterns, stuck states

**5. search_web**
- Claude can search for market data
- Helps user validate ideas
- No permission needed (Claude decides)

**6. update_user_profile**
- Learn new skills/constraints during conversation
- Example: User mentions "I know how to code" → add skill
- Profile gets smarter over time

**7. update_idea**
- Save insights from conversation
- Example: "Target local customers only"
- Captured for later use

**8. update_living_document**
- Only called via popup confirmation (not during chat)
- User must approve changes

---

### **OpenAI's Structured Tasks**

**1. Generate Business Summary**
- Input: Conversation history + pasted text
- Output: JSON with title, description, suggestions, next step
- Reliable, consistent format

**2. Create Living Document**
- Input: Idea summary
- Output: Markdown with standard sections
- Professional but warm tone

**3. Update Living Document**
- Input: Current doc + new content
- Output: Merged document + change summary
- Intelligent merging

**4. Generate Milestones**
- Input: Project state + direction (keep_growing/simplify/pivot)
- Output: Array of 3 milestones with tasks
- Adaptive to user's situation

---

## 🎭 AI Personality & Tone

### **Core Personality Traits:**

**Warm & Genuine**
- Like a supportive family member
- Uses casual but respectful Japanese (です/ます form)
- 1-2 emojis per response (not excessive)

**Optimistic but Realistic**
- Hopeful about possibilities
- Honest about challenges
- Always finds the scaled-down version

**Curious & Patient**
- Asks to understand, not interrogate
- Lets user think
- Doesn't rush to solutions

**Celebratory**
- Makes wins feel meaningful
- Celebrates tiny progress
- "That's great!" not "Good job."

---

### **What AI Never Does:**

❌ Use business jargon (MVP, TAM, CAC)  
❌ Compare family members  
❌ Discourage ideas  
❌ Rush to solutions  
❌ Update documents without permission (except via popup)  
❌ Make assumptions  
❌ Use emotes (*smiles*, *nods*)  

---

### **What AI Always Does:**

✅ Get context first (call tools)  
✅ Acknowledge input warmly  
✅ Ask one question at a time  
✅ Give specific examples  
✅ End with clear next action  
✅ Be transparent about updates  
✅ Search web when helpful  
✅ Update profile when learning  

---

## 💬 Conversation Examples

### **Example 1: Idea Exploration**

```
User: "友達がキャンドル欲しいって言ってて..."

Claude: "それいいですね！その友達、他にも欲しい人いると思いますか？
それとも、まず作り方から調べたい？"

User: "作り方は大丈夫。でも売れるかわからない"

Claude: [calls update_user_profile - adds candle making skill]
"作れるのは強いですね！じゃあ、その友達に「買う？」って
直接聞いてみました？値段も一緒に伝えると反応がわかりますよ。"

User: "まだ聞いてない"

Claude: "それなら次のステップですね。¥3,000くらいで考えてる？
それとも値段も悩んでます？"
```

**What's happening:**
- Natural flow, not checklist
- Claude learns (candle making skill)
- One question at a time
- Specific, actionable suggestions

---

### **Example 2: Project Chat**

```
User: "正直、続けるか迷ってる"

Claude: [calls get_project_details]
"そうですか。何が一番心配ですか？"

User: "友達に聞いたけど、みんな買わない"

Claude: "それ辛いですね。値段を伝えましたか？"

User: "¥3,000って言ったら高いって..."

Claude: [calls search_web("handmade candle pricing NZ")]
"ちょっと調べてみました。
NZだと¥2,000-4,000が相場ですね。
Yokoさんの¥3,000は真ん中です。

材料費下げるより、価値を伝える方がいいかも。
「何だったら¥3,000出す？」って聞いてみる？"

User: "それいいかも"

Claude: "いいですね！次のReflectionで教えてください 😊"

[User closes chat]
[POPUP: "今日の会話で学んだこと: 価格設定に不安、
市場調査が必要 → Living Documentを更新する？"]
```

**What's happening:**
- Claude gets full context first
- Listens before solving
- Searches web to help (no permission needed)
- Focus on conversation, not doc updates
- Popup asks about updates on exit

---

### **Example 3: Weekly Reflection**

```
Reflection submitted:
- What worked: "友達3人に話を聞いた"
- Wins: "2人が「買いたい」って言ってくれた"
- Blockers: "値段を決められない"

Claude analyzes:
- Current milestone: In progress (not stuck)
- Progress: Good validation (2/3 interested)
- Issue: Pricing decision

Claude generates insight:
"3人に話を聞けたのは素晴らしい！👏
2人が「買いたい」と言ったのは強い検証です。

値段は、その2人に「いくらなら出せる？」って
直接聞いてみるのが一番早いですよ。"

Actions: None (good progress, no intervention needed)
```

**What's happening:**
- Claude references specific details
- Celebrates effort
- Gives concrete next step
- No milestones generated (not needed)

---

## 🔧 Technical Implementation

### **Context Management**

**Strategy:**
- Keep last 25 messages raw (industry best practice)
- Use Anthropic compaction at 150K tokens
- Each conversation turn loads fresh context

**Context includes:**
```typescript
{
  system_prompt: string,           // ~5K tokens
  user_profile: UserProfile,       // ~1K tokens
  entity_context: Idea | Project,  // ~2K tokens
  raw_messages: Message[],         // Last 25 messages
  conversation_summary?: string,   // If compacted
  recent_reflections?: Reflection[] // Optional
}
```

**Total: ~60-120K tokens used, leaving 80-140K for response**

---

### **Error Handling**

**All AI calls wrapped in try-catch:**
```typescript
try {
  const response = await anthropic.messages.create({...});
  // Extract content
  // Return to user
} catch (error) {
  console.error("AI error:", error);
  return NextResponse.json(
    { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
    { status: 500 }
  );
}
```

**User-friendly errors in Japanese, technical details in logs**

---

### **Rate Limiting**

**Strategy:**
- Trust Anthropic/OpenAI API rate limits
- Add application-level limits in future (Phase 6+)
- Monitor costs via API dashboards

---

### **System Prompts**

**Stored in:** `src/lib/ai/prompts/`
- `discovery.ts` - Not used (external AI)
- `validation.ts` - Idea exploration (Claude)
- `project-chat.ts` - Project Q&A (Claude)
- `reflection.ts` - Weekly reflection (Claude)
- `summary.ts` - Business summary (OpenAI)
- `living-doc.ts` - Document generation (OpenAI)
- `milestones.ts` - Milestone generation (OpenAI)

**All prompts in Japanese, all instructions explicit**

---

## 📊 Success Metrics

### **Conversation Quality:**
- Average messages per idea chat
- Completion rate (% who finish)
- User satisfaction (qualitative feedback)

### **AI Effectiveness:**
- % of ideas that become projects
- % of users who complete reflections
- Living doc update acceptance rate

### **Technical:**
- AI response time (<5s)
- Error rate (<1%)
- Token usage vs budget

---

## 🚀 Future Enhancements

### **Phase 6+ Ideas:**

**1. Proactive Insights**
- AI notices patterns across weeks
- "You've been stuck on pricing 3 times - want to discuss?"

**2. Family Comparisons (Careful)**
- "Haruhi solved a similar problem - want to see?"
- Never competitive, always supportive

**3. Skill Detection**
- Auto-update profile from conversations
- "Noticed you mentioned teaching - adding to skills"

**4. Smart Suggestions**
- "Based on your progress, maybe try..."
- Timing-aware (not pushy)

**5. Voice Mode**
- Talk instead of type
- Especially for reflections

---

## ✅ AI Quality Checklist

**Every AI interaction should:**
- [ ] Feel warm and supportive
- [ ] Be in natural Japanese
- [ ] Reference user's specific context
- [ ] Give one clear next step
- [ ] Never use business jargon
- [ ] Celebrate progress (even tiny)
- [ ] Be transparent about tools used
- [ ] Handle errors gracefully

---

## 🎯 Summary

**The AI is designed to be:**
- A warm coach, not a stern teacher
- Conversational (Claude), not robotic
- Structured when needed (OpenAI)
- Adaptive to each person
- Always encouraging
- Transparently helpful

**The AI never:**
- Forces a path
- Judges progress
- Uses jargon
- Updates without permission
- Compares family members
- Gives up on ideas

**The family should feel:**
- Supported, not managed
- Encouraged, not pressured
- Understood, not analyzed
- Capable, not inadequate

---

**This AI system makes entrepreneurship feel possible for everyone in the Eguchi family. 🌸**

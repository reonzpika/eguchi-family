# Family Workspace - User Flows

**Purpose:** Complete user journey from first login to active project collaboration  
**Format:** Step-by-step flows with screens, decisions, and outcomes  
**Last Updated:** March 2026

---

## 🗺️ Primary User Flows

### **Flow 1: First-Time User → First Idea**

**Goal:** Get from sign-up to having their first saved idea  
**Duration:** 15-20 minutes  
**Success:** User has 1 saved idea and feels excited

---

#### **1.1 Sign In**

**Screen:** Sign-in page  
**Elements:**
- 🌸 Family Workspace logo
- Family member dropdown selector
- Password field
- [サインイン] button

**User actions:**
1. Select name from dropdown (Ryo, Yoko, Haruhi, Natsumi, Motoharu)
2. Enter password
3. Click [サインイン]

**System:**
- Validates credentials
- Creates session
- Redirects based on user state

**Decision point:**
- If first time → Onboarding
- If returning → Home page

---

#### **1.2 First-Time Home**

**Screen:** New member welcome  
**Elements:**
- Welcome message: "ようこそ、[Name]さん！"
- Explanation: "アイデアを形にするお手伝いをします"
- Large CTA button: "アイデアを追加する →"
- Inspiration link: "🌟 アイデアのヒント"

**User actions:**
1. Clicks "アイデアを追加する"

**System:**
- Navigates to /onboarding
- Starts idea creation flow

---

#### **1.3 Onboarding Step 1: AI Tool Selection**

**Screen:** Choose AI tool  
**Elements:**
- Title: "AIツールを選んでください"
- Explanation: "無料のAIツールでアイデアを育てます"
- 3 tool cards:
  * 🤖 ChatGPT (★ おすすめ)
  * ✨ Claude
  * 🔍 Perplexity
- Progress: "ステップ 1 / 3"

**User actions:**
1. Taps one tool card
2. Clicks [次へ →]

**System:**
- Stores selected tool in sessionStorage
- Advances to step 2

---

#### **1.4 Onboarding Step 2: Copy Prompt**

**Screen:** Copy prompt  
**Elements:**
- Title: "プロンプトをコピーしてください"
- Instructions: "下のボタンを押してコピーし、AIツールに貼り付けてください"
- Prompt text box (read-only):
  ```
  私はビジネスアイデアを考えているのですが、
  まだはっきりとした形になっていません。
  一度に一つずつ質問しながら、私のアイデアを
  一緒に整理してもらえますか？
  
  まず最初に「どんなビジネスをやってみたいか、
  一言で教えてください」と聞いてください。
  ```
- [プロンプトをコピーする] button
- [AIツールを開く ↗] button
- Progress: "ステップ 2 / 3"

**User actions:**
1. Clicks [プロンプトをコピーする]
2. Clicks [AIツールを開く] (opens external tool)
3. Uses external AI to explore idea (5-10 min)
4. Copies full conversation
5. Returns to Family Workspace
6. Clicks [AIと話し終わりました → 次へ]

**System:**
- Copies prompt to clipboard (shows ✓)
- Opens external AI in new tab
- Enables [次へ] button after copy

---

#### **1.5 Onboarding Step 3: Paste Result**

**Screen:** Paste AI output  
**Elements:**
- Title: "AIの返答を貼り付けてください"
- Instructions: "AIとの会話の結果をここに貼り付けてください。あとはFamily WorkspaceのAIがサポートします！"
- Large textarea (min 20 characters)
- [AIに整理してもらう ✨] button
- Progress: "ステップ 3 / 3"

**User actions:**
1. Pastes external AI conversation
2. Clicks [AIに整理してもらう]

**System:**
- Validates text length (min 20 chars)
- Calls `/api/ideas/chat/start`
- Claude analyzes pasted text
- Generates first question
- Transitions to chat interface

---

#### **1.6 Idea Chat**

**Screen:** Chat with Claude  
**Elements:**
- Title: "江口AIコーチ 🌸"
- Subtitle: "アイデアを一緒に育てましょう"
- Chat bubbles (agent on left, user on right)
- Input field or multiple choice buttons
- [送信] button

**Conversation flow:**
```
Claude: "ハンドメイドキャンドル、いいですね！
どんなきっかけで考えたんですか？"

[User types response]

Claude: "なるほど。その友達、他にも欲しい人いると
思いますか？それとも、まず作り方から調べたい？"

[User types response]

Claude: [adapts questions naturally]
...

[After exploring 5 key areas:]
Claude: "それでは、このアイデアをまとめましょう！"
```

**User actions:**
- Answers Claude's questions
- Types freely or selects options
- Continues until Claude says complete

**System:**
- Calls `/api/ideas/chat/message` for each turn
- Maintains conversation history
- Detects completion ("まとめましょう")
- Shows [アイデアをまとめる ✨] button

---

#### **1.7 Finalize Idea**

**Screen:** Processing  
**Elements:**
- Loading spinner
- "処理中..." message

**System:**
- Calls `/api/ideas/finalize`
- OpenAI generates structured summary
- Creates idea in database
- Redirects to result page

**Duration:** 3-5 seconds

---

#### **1.8 Idea Result**

**Screen:** Idea summary  
**Elements:**
- Title input (editable)
- AI summary card:
  * "✨ AIが整理しました"
  * Polished description
- AI suggestions (if any):
  * "💬 AIからの提案"
  * 2-3 suggestions
- Next step card:
  * "👣 まずやること"
  * One immediate action
- [💾 アイデアを保存する] button

**User actions:**
1. Edits title if needed
2. Reads summary
3. Clicks [保存する]

**System:**
- Updates idea title
- Shows success: "✓ 保存しました！"
- Reveals [🚀 プロジェクトに昇格する] button

---

#### **1.9 Upgrade Decision**

**Screen:** Same (idea result)  
**New element:** [🚀 プロジェクトに昇格する] button

**User actions:**
- **Option A:** Click [プロジェクトに昇格] → Flow 2
- **Option B:** Navigate away → End flow

**End state:** User has saved idea ✓

---

### **Flow 2: Idea → Project**

**Goal:** Turn saved idea into active project  
**Duration:** 3-5 minutes  
**Success:** Project created with living document

---

#### **2.1 Upgrade Confirmation**

**Screen:** Upgrade page  
**Elements:**
- Title: "アイデアをプロジェクトに昇格する"
- Explanation card:
  * "🌟 プロジェクトにすると、アイデアが家族全員に公開されます"
  * "リビングドキュメントが作成され、追加のブレインストーミングで育てることができます"
- Visibility selector:
  * ⚪ "公開 — 家族全員が見られます"
  * ⚪ "限定公開 — リンクを知っている人だけ"
- [🚀 プロジェクトを作成する] button

**User actions:**
1. Select visibility (default: public)
2. Click [作成する]

**System:**
- Calls `/api/projects/create`
- OpenAI generates living document
- Creates project in database
- Marks idea as upgraded
- Redirects to project page

**Duration:** 5-8 seconds

---

#### **2.2 Project Created**

**Screen:** Project detail page  
**Elements:**
- Back button
- Visibility badge (公開 or 限定公開)
- Owner info with avatar
- Project title (from idea)
- Tabs: [内容] [更新履歴]
- Living document (Markdown rendered):
  ```markdown
  ## 🎯 ビジョン
  [AI generated vision]
  
  ## 📦 製品・サービスアイデア
  [AI generated description]
  
  ## 👥 ターゲット
  [AI generated target customer]
  
  ## 🛒 販売・展開方法
  [AI generated sales method]
  
  ## 📋 次のステップ
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
  ```
- [＋ 新しい内容を追加して更新する] button (if owner)

**User experience:**
- Sees professional living document
- Clear next steps
- Feels productive

**End state:** Active project created ✓

---

### **Flow 3: Project Updates**

**Goal:** Add new brainstorming to living document  
**Duration:** 3-5 minutes  
**Success:** Living document updated with new version

---

#### **3.1 Add Content**

**Screen:** Project detail (owner view)  
**User actions:**
1. Clicks [＋ 新しい内容を追加して更新する]

**System:**
- Expands update form

---

#### **3.2 Update Form**

**Screen:** Same page (form expanded)  
**Elements:**
- Textarea: "新しいブレインストーミングの内容を入力してください..."
- [キャンセル] [更新する] buttons

**User actions:**
1. Types new insights (e.g., "市場調査の結果...")
2. Clicks [更新する]

**System:**
- Calls `/api/projects/[id]/update`
- OpenAI merges content intelligently
- Creates new version (v2, v3, etc.)
- Generates change summary
- Sends email to family members
- Reloads page

---

#### **3.3 Updated View**

**Screen:** Project detail (refreshed)  
**Elements:**
- Updated living document
- Version history shows new entry:
  * "v2"
  * Change summary
  * Timestamp

**End state:** Living document evolved ✓

---

### **Flow 4: Weekly Reflection**

**Goal:** Check in on project progress, get AI coaching  
**Duration:** 2-3 minutes  
**Success:** Reflection submitted, insight received

---

#### **4.1 Reflection Trigger**

**Trigger:** Friday 7pm push notification (future)  
**Current:** User navigates to project manually

**Notification:**
- "📝 今週のReflectionの時間です"
- "Tap to open"

---

#### **4.2 Reflection Form**

**Screen:** Reflection form  
**Elements:**
- Title: "今週のReflection"
- 3 questions:
  1. "今週うまくいったことは？"
  2. "小さな勝利はありましたか？"
  3. "何かブロックしてることはありますか？"
- Each: Textarea (optional)
- [送信] button

**User actions:**
1. Answers 1-3 questions (some can be blank)
2. Clicks [送信]

**System:**
- Calls `/api/reflections/submit`
- Stores reflection
- Calls `/api/reflections/analyze` (Claude)

---

#### **4.3 AI Insight**

**Screen:** Reflection result  
**Elements:**
- "✨ AIからのインサイト"
- Claude's personalized response:
  * References specific details
  * Celebrates effort
  * Gives one actionable suggestion
  * ~3-4 sentences
- Possible actions:
  * Living doc updated (if insight found)
  * New milestones generated (if stuck or complete)

**Example:**
```
3人に話を聞けたのは素晴らしい！👏
2人が「買いたい」と言ったのは強い検証です。

値段は、その2人に「いくらなら出せる？」って
直接聞いてみるのが一番早いですよ。
```

**End state:** Reflection complete, user encouraged ✓

---

### **Flow 5: Family Collaboration**

**Goal:** See and comment on family member's project  
**Duration:** 2-5 minutes  
**Success:** Supportive comment added

---

#### **5.1 Browse Projects**

**Screen:** Projects list  
**Elements:**
- Title: "プロジェクト"
- Filter tabs: [すべて] [進行中] [計画中] [完了]
- Project cards:
  * Emoji icon
  * Project title
  * Description (60 chars)
  * Owner avatar + name
  * Status badge

**User actions:**
1. Browses projects
2. Taps interesting project

---

#### **5.2 View Project**

**Screen:** Project detail (viewer, not owner)  
**Elements:**
- Same as owner view, but:
  * No [更新する] button
  * Can see all content
  * Can access comments tab

**User actions:**
1. Reads living document
2. Switches to [コメント] tab (future)

---

#### **5.3 Add Comment** (Future - Phase 4)

**Screen:** Comments tab  
**Elements:**
- Comment thread
- Comment input box
- [送信] button

**User actions:**
1. Types encouraging comment
2. Clicks [送信]

**System:**
- Saves comment
- Sends notification to owner
- Updates activity feed

**End state:** Family support expressed ✓

---

## 🔄 Secondary User Flows

### **Flow 6: Returning User**

**Screen:** Home page  
**Elements:**
- Welcome back: "[Name]さん、おかえりなさい！"
- Your ideas: 2-3 recent ideas
- Your projects: Active projects
- Family feed: Recent activity
- [アイデアを追加] FAB button

**User can:**
- Continue existing idea
- Check project progress
- See family activity
- Start new idea

---

### **Flow 7: Inspiration**

**Screen:** Inspiration page  
**Elements:**
- Title: "アイデアのヒント"
- 3 prompt cards:
  * 🌟 "自分が得意なことで、よく頼まれることは？"
  * 💭 "毎日の生活で「これ不便だな」と感じることは？"
  * ❤️ "好きなことや趣味で、世界と共有したいものは？"
- Each leads to onboarding

**User actions:**
- Reads prompts
- Feels inspired
- Clicks [このテーマでAIと話す →]

---

### **Flow 8: Admin Functions**

**Screen:** Admin dashboard (Ryo only)  
**Elements:**
- Stats cards (members, ideas, projects, docs)
- Links:
  * 👥 メンバー管理
  * 🤖 AIヘルスチェック

**Admin can:**
- View all statistics
- Change member roles
- Test AI systems
- Monitor usage

---

## 📊 Flow Metrics

### **Success Metrics per Flow:**

**Flow 1 (First Idea):**
- Completion rate: Target >70%
- Time to complete: Target 15-20 min
- Drop-off point: Monitor each step

**Flow 2 (Upgrade):**
- Conversion rate: Target >50%
- Time to decide: Track hesitation

**Flow 3 (Updates):**
- Update frequency: Target 1/week
- Content quality: Length, detail

**Flow 4 (Reflections):**
- Response rate: Target >80%
- Insight quality: User feedback

**Flow 5 (Collaboration):**
- Comment rate: Target 2/project
- Positive sentiment: Qualitative

---

## 🎯 Critical User Moments

**Moment 1: First AI Response**
- Make it warm and personalized
- Sets tone for entire experience

**Moment 2: Seeing Summary**
- "AI understood me!"
- Must feel accurate and encouraging

**Moment 3: Living Document**
- "This looks professional"
- Pride in what they created

**Moment 4: AI Insight**
- "AI knows my situation"
- Personal, not generic

**Moment 5: Family Comment**
- "They support me"
- Encouragement, not pressure

---

**All flows designed for mobile-first, 320px-390px screens. 🌸**

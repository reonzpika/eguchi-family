# AI Migration Guide: OpenAI → Claude Hybrid

**Current:** OpenAI GPT-4o for all AI operations  
**Target:** Claude Sonnet 4.6 (conversational) + OpenAI GPT-4o (structured)  
**Priority:** High (better conversation quality)  
**Estimated Time:** 1-2 weeks

---

## 🎯 Migration Strategy

### **Why Migrate to Claude?**

**Claude Sonnet 4.6 strengths:**
- ✅ Better at natural conversations
- ✅ Superior tool calling
- ✅ 200K context window (vs 128K)
- ✅ Built-in context compaction
- ✅ More empathetic, supportive tone
- ✅ Better at open-ended exploration

**OpenAI GPT-4o strengths:**
- ✅ Excellent structured JSON output
- ✅ Reliable formatting
- ✅ Fast generation
- ✅ Good for one-shot tasks

**Decision:** Use each AI for what it does best.

---

## 📊 Current vs Target Architecture

### **Current (OpenAI Only):**
```typescript
/api/ideas/chat/start        → OpenAI GPT-4o (JSON response)
/api/ideas/chat/message      → OpenAI GPT-4o (JSON response)
/api/ideas/finalize          → OpenAI GPT-4o (JSON summary)
/api/projects/create         → OpenAI GPT-4o (Markdown doc)
/api/projects/[id]/update    → OpenAI GPT-4o (Markdown merge)
```

### **Target (Claude Hybrid):**
```typescript
// CONVERSATIONAL AI → Claude Sonnet 4.6
/api/ideas/chat/start        → Claude (with tools, natural flow)
/api/ideas/chat/message      → Claude (with tools, adaptive)
/api/projects/[id]/chat      → Claude (NEW: separate chat)
/api/reflections/analyze     → Claude (decision tree logic)

// STRUCTURED GENERATION → OpenAI GPT-4o  
/api/ideas/finalize          → OpenAI (keep, works well)
/api/projects/create         → OpenAI (keep, reliable)
/api/projects/[id]/update    → OpenAI (keep, good merge)
/api/reflections/milestones  → OpenAI (NEW: array generation)
```

---

## 🔧 Step-by-Step Migration

### **Step 1: Install Claude SDK**

```bash
npm install @anthropic-ai/sdk
```

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

### **Step 2: Create Claude Client**

Create `src/lib/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;
```

---

### **Step 3: Migrate Idea Chat (Start)**

**Current:** `src/app/api/ideas/chat/start/route.ts`

**Replace entire file with:**

```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import anthropic from "@/lib/claude";
import { authOptions } from "@/lib/auth";

const SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
家族のメンバーがビジネスアイデアを育てるのを温かくサポートするのがあなたの役割です。

【役割】
- 丁寧だけど堅くならず、温かみのある日本語で話す
- 否定せず、まず良いところを見つけて伝える
- 一度に一つだけ質問する
- 専門用語は使わず、誰にでもわかる言葉を使う

【会話の目標】
以下の5項目を自然な会話で明らかにしてください：
1. ビジネスの種類（商品/サービス/教える/その他）
2. ターゲット顧客（誰のためか）
3. 販売・提供方法（オンライン/対面/SNSなど）
4. 差別化ポイント（強み、他との違い）
5. 収益の仕組み（どう稼ぐか）

すべて明らかになったら、自然に会話を終わらせてください。

【返答形式】
- 選択肢がある場合: 2-4個の選択肢を提示
- 自由回答の場合: 開かれた質問をする
- 会話を終える場合: 温かく締めくくる`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pastedText } = body;

    if (!pastedText || typeof pastedText !== "string") {
      return NextResponse.json(
        { error: "pastedText is required" },
        { status: 400 }
      );
    }

    // Call Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `以下のビジネスアイデアについて、最初の質問をしてください：\n\n${pastedText}`,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました" },
        { status: 500 }
      );
    }

    // Generate session ID
    const sessionId = randomUUID();

    // Store initial context (you can use Supabase or memory)
    // For now, we'll keep it simple

    return NextResponse.json({
      sessionId,
      firstMessage: textContent.text,
      options: null, // Claude will naturally suggest options in text
      isComplete: false,
    });
  } catch (error) {
    console.error("Error in chat/start:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
```

---

### **Step 4: Migrate Idea Chat (Message)**

**Current:** `src/app/api/ideas/chat/message/route.ts`

**Replace entire file with:**

```typescript
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/claude";
import { authOptions } from "@/lib/auth";

const SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
家族のメンバーがビジネスアイデアを育てるのを温かくサポートするのがあなたの役割です。

【役割】
- 丁寧だけど堅くならず、温かみのある日本語で話す
- 否定せず、まず良いところを見つけて伝える
- 一度に一つだけ質問する
- 専門用語は使わず、誰にでもわかる言葉を使う

【会話の目標】
以下の5項目を自然な会話で明らかにしてください：
1. ビジネスの種類（商品/サービス/教える/その他）
2. ターゲット顧客（誰のためか）
3. 販売・提供方法（オンライン/対面/SNSなど）
4. 差別化ポイント（強み、他との違い）
5. 収益の仕組み（どう稼ぐか）

5項目すべてが明らかになったら、「それでは、このアイデアをまとめましょう！」と言って会話を終えてください。

【チェックリスト管理】
内部でチェックリストを管理し、各項目が明らかになったらチェックしてください。
すべて完了したら、上記のメッセージで締めくくってください。`;

type Message = {
  role: "agent" | "user";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message, chatHistory, pastedText } = body;

    if (!sessionId || !message || !chatHistory || !pastedText) {
      return NextResponse.json(
        { error: "sessionId, message, chatHistory, and pastedText are required" },
        { status: 400 }
      );
    }

    // Build conversation history for Claude
    const claudeMessages = [
      {
        role: "user" as const,
        content: `ビジネスアイデアの元の内容：\n\n${pastedText}`,
      },
      ...chatHistory.map((msg: Message) => ({
        role: msg.role === "agent" ? ("assistant" as const) : ("user" as const),
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました" },
        { status: 500 }
      );
    }

    // Check if conversation is complete
    const isComplete =
      textContent.text.includes("まとめましょう") ||
      textContent.text.includes("整理しましょう");

    return NextResponse.json({
      message: textContent.text,
      options: null,
      isComplete,
    });
  } catch (error) {
    console.error("Error in chat/message:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
```

---

### **Step 5: Keep OpenAI for Finalize**

**No changes needed** to `/api/ideas/finalize/route.ts` - OpenAI is perfect for structured JSON summary.

---

### **Step 6: Test Migration**

1. **Test idea chat flow:**
   ```bash
   # Start new idea
   # Go through onboarding
   # Paste external AI output
   # Chat with Claude
   # Should feel more natural
   ```

2. **Verify finalize still works:**
   - Summary should still be structured JSON
   - Title, suggestions, nextStep all present

3. **Check error handling:**
   - What happens if Claude API fails?
   - Does it gracefully fall back?

---

## 🔧 Advanced: Claude with Tools (Phase 6)

Once basic migration works, add tool calling for Phase 6:

```typescript
// In /api/ideas/chat/message
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2000,
  system: SYSTEM_PROMPT,
  messages: claudeMessages,
  tools: [
    {
      name: "update_user_profile",
      description: "Update user profile when learning new skills or constraints",
      input_schema: {
        type: "object",
        properties: {
          new_skills: {
            type: "array",
            items: { type: "string" },
            description: "New skills user mentioned"
          }
        }
      }
    },
    {
      name: "search_web",
      description: "Search web for market data or validation",
      input_schema: {
        type: "object",
        properties: {
          query: { type: "string" },
          context: { type: "string" }
        },
        required: ["query"]
      }
    }
  ]
});

// Handle tool calls
if (response.stop_reason === "tool_use") {
  const toolUse = response.content.find(block => block.type === "tool_use");
  // Process tool, return result, continue conversation
}
```

---

## 📊 Migration Checklist

### **Phase 1: Basic Claude Integration (Week 1)**
- [ ] Install @anthropic-ai/sdk
- [ ] Create src/lib/claude.ts
- [ ] Update /api/ideas/chat/start
- [ ] Update /api/ideas/chat/message
- [ ] Test conversation quality
- [ ] Compare with old OpenAI version

### **Phase 2: Keep OpenAI for Structure (Week 1)**
- [x] Keep /api/ideas/finalize (OpenAI)
- [x] Keep /api/projects/create (OpenAI)
- [x] Keep /api/projects/[id]/update (OpenAI)
- [ ] Document why each uses which AI

### **Phase 3: New Features with Claude (Week 2)**
- [ ] Create /api/projects/[id]/chat (Claude)
- [ ] Create /api/reflections/analyze (Claude)
- [ ] Add tool calling support
- [ ] Add context management

### **Phase 4: New Features with OpenAI (Week 2)**
- [ ] Create /api/reflections/milestones (OpenAI)
- [ ] Structured milestone array generation

---

## 🎯 Success Criteria

**Migration is successful when:**

✅ Idea chat feels more natural and conversational  
✅ AI asks better follow-up questions  
✅ AI remembers context better  
✅ Finalize still produces structured JSON  
✅ Living docs still generate correctly  
✅ No increase in errors  
✅ Response time <5 seconds  

---

## 🚨 Common Issues & Solutions

### **Issue 1: Claude response not structured**
**Solution:** That's okay! Claude is for conversation. Use OpenAI for structure.

### **Issue 2: Conversation feels too long**
**Solution:** Adjust system prompt to guide completion faster.

### **Issue 3: Claude tool calling not working**
**Solution:** Check tool schema matches Anthropic format, not OpenAI format.

### **Issue 4: Context window exceeded**
**Solution:** Implement compaction (Phase 6 feature).

---

## 📚 Resources

- **Anthropic Docs:** https://docs.anthropic.com
- **Claude API Reference:** https://docs.anthropic.com/en/api/messages
- **Tool Use Guide:** https://docs.anthropic.com/en/docs/tool-use
- **System Prompts:** https://docs.anthropic.com/en/docs/system-prompts

---

**Ready to migrate? Start with Step 1 and test each change incrementally.**

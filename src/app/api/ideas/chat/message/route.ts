import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import {
  getDiscoveryProfileForUser,
  formatProfileForPrompt,
} from "@/lib/discovery-profile";

const IDEA_CONTEXT_USAGE_RULE = [
  "【重要】上記アイデア情報はあなただけが参照する情報です。",
  "ユーザーにアイデアの内容を言い返したり要約したりしないでください。",
  "このアイデアについて続きの会話をしているので、文脈に沿った質問や提案をしてください。",
].join("\n");

function formatIdeaContextForPrompt(idea: {
  title: string | null;
  polished_content: string | null;
  chat_summary: string | null;
}): string {
  const parts: string[] = ["【このアイデアの情報（参照用・ユーザーに言い返さない）】"];
  if (idea.title) parts.push(`- タイトル: ${idea.title}`);
  if (idea.polished_content) parts.push(`- まとめ: ${idea.polished_content.slice(0, 800)}`);
  if (idea.chat_summary) parts.push(`- これまでの話の要約: ${idea.chat_summary}`);
  parts.push("", IDEA_CONTEXT_USAGE_RULE);
  return parts.join("\n");
}

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
  options?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, ideaId, message, chatHistory } = body;

    const useIdea = Boolean(ideaId);
    if (!message || !Array.isArray(chatHistory)) {
      return NextResponse.json(
        { error: "message and chatHistory are required" },
        { status: 400 }
      );
    }
    if (!useIdea && !sessionId) {
      return NextResponse.json(
        { error: "sessionId or ideaId is required" },
        { status: 400 }
      );
    }

    let ideaContextBlock = "";
    if (useIdea) {
      const supabase = createAdminClient();
      const { data: idea, error: fetchError } = await supabase
        .from("ideas")
        .select("id, user_id, chat_history, title, polished_content, chat_summary")
        .eq("id", ideaId)
        .single();

      if (fetchError || !idea) {
        return NextResponse.json(
          { error: "アイデアが見つかりませんでした。" },
          { status: 404 }
        );
      }
      if (idea.user_id !== session.user.id) {
        return NextResponse.json(
          { error: "このアイデアを編集する権限がありません。" },
          { status: 403 }
        );
      }
      ideaContextBlock = formatIdeaContextForPrompt({
        title: idea.title,
        polished_content: idea.polished_content,
        chat_summary: idea.chat_summary,
      });
    }

    // Profile for background only; AI must not echo profile to user (see discovery-profile.ts)
    const profile = await getDiscoveryProfileForUser(session.user.id);
    const profileBlock = formatProfileForPrompt(profile);
    let systemPrompt = SYSTEM_PROMPT + "\n\n" + profileBlock;
    if (ideaContextBlock) {
      systemPrompt += "\n\n" + ideaContextBlock;
    }

    const claudeMessages = [
      ...chatHistory.map((msg: Message) => ({
        role: msg.role === "agent" ? ("assistant" as const) : ("user" as const),
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const isComplete =
      textContent.text.includes("まとめましょう") ||
      textContent.text.includes("整理しましょう");

    if (useIdea && ideaId) {
      const updatedHistory = [
        ...chatHistory.map((msg: Message) => ({
          role: msg.role,
          content: msg.content,
          ...(msg.options && { options: msg.options }),
        })),
        { role: "user" as const, content: message },
        {
          role: "agent" as const,
          content: textContent.text,
          options: null,
        },
      ];
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from("ideas")
        .update({
          chat_history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId);

      if (updateError) {
        console.error("Error updating idea chat_history:", updateError);
      }
    }

    return NextResponse.json({
      message: textContent.text,
      options: null,
      isComplete,
    });
  } catch (error) {
    console.error("Error in chat/message:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}

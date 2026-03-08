import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
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
    const { sessionId, message, chatHistory, pastedText } = body;

    if (!sessionId || !message || !chatHistory || !pastedText) {
      return NextResponse.json(
        { error: "sessionId, message, chatHistory, and pastedText are required" },
        { status: 400 }
      );
    }

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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
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

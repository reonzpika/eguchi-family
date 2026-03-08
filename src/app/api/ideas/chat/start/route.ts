import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
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

すべて明らかになったら、自然に会話を終わらせてください。

【返答形式】
- 選択肢がある場合: 2-4個の選択肢を提示
- 自由回答の場合: 開かれた質問をする
- 会話を終える場合: 温かく締めくくる`;

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
    const { pastedText } = body;

    if (!pastedText || typeof pastedText !== "string") {
      return NextResponse.json(
        { error: "pastedText is required" },
        { status: 400 }
      );
    }

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
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const sessionId = randomUUID();

    return NextResponse.json({
      sessionId,
      firstMessage: textContent.text,
      options: null,
      isComplete: false,
    });
  } catch (error) {
    console.error("Error in chat/start:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}

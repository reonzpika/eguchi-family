import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import openai from "@/lib/openai";
import { authOptions } from "@/lib/auth";

const SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
家族のメンバーがビジネスアイデアを育てるのを温かくサポートするのがあなたの役割です。

話し方のルール：
- 丁寧だけど堅くならず、温かみのある日本語で話す
- 否定せず、まず良いところを見つけて伝える
- 一度に一つだけ質問する
- 専門用語は使わず、誰にでもわかる言葉を使う
- 質問は短くシンプルに

あなたは会話を通じて、以下の5項目のチェックリストを完成させる必要があります。
このチェックリストはユーザーには見せません。内部で管理してください。

チェックリスト：
1. ビジネスの種類 — 商品販売 / サービス提供 / 教える / その他
2. ターゲット顧客 — 誰のためのビジネスか
3. 販売・提供方法 — オンライン / 対面 / SNS など
4. 差別化ポイント — 他と何が違うか、強みは何か
5. 収益の仕組み — どうやって収入を得るか

各項目が会話の中で自然に明らかになったらチェックしてください。
すべての項目が完了したら、isComplete を true にしてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "message": "エージェントのメッセージ（日本語）",
  "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"] または null,
  "isComplete": false
}

options は、ユーザーが選びやすい選択肢がある場合のみ配列を返してください。
自由回答が適切な場合は null にしてください。
isComplete はチェックリストがすべて完了した場合のみ true にしてください。`;

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

    // Call OpenAI
    const userMessage = `以下のビジネスアイデアについて教えてください：

${pastedText}

まず最初の質問をしてください。`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if present
    const clean = responseText.replace(/```json|```/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // Generate session ID
    const sessionId = randomUUID();

    return NextResponse.json({
      sessionId,
      firstMessage: parsed.message,
      options: parsed.options,
      isComplete: parsed.isComplete || false,
    });
  } catch (error) {
    console.error("Error in chat/start:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}

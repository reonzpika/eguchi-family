import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

const VALIDATE_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
以下のビジネスアイデアをもとに、「プロジェクトに昇格する前の現実チェック」を
温かく前向きなトーンで、日本語のマークダウンで作成してください。

必ず以下のセクションを含めてください：

## ✅ うまくいきそうなところ
（2〜4個の箇条書き。具体的で励ましになるように）

## ⚠️ 気をつけたいところ
（1〜3個。問題点と「どうすればいいか」を簡潔に）

## 💰 最初の1ヶ月の現実チェック
（売上・コスト・時間の簡単な試算と「現実的か」の一言）

## 🎯 立ち上げ前にやっておくとよいこと
（具体的な1つのアクション。検証や準備の提案）

温かく、正直に、でも前向きに書いてください。`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: ideaId } = await params;
    if (!ideaId) {
      return NextResponse.json(
        { error: "idea id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("id, title, polished_content, user_id")
      .eq("id", ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: "アイデアが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (idea.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このアイデアを参照する権限がありません。" },
        { status: 403 }
      );
    }

    const userMessage = `アイデアのタイトル: ${idea.title}\n\nアイデアの内容・まとめ:\n${idea.polished_content || "(まとめなし)"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: VALIDATE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const content = responseText.replace(/```markdown|```/g, "").trim();

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Validate API error:", err);
    return NextResponse.json(
      { error: "エラーが発生しました。" },
      { status: 500 }
    );
  }
}

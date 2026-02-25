import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createServerComponentClient } from "@/lib/supabase-server";

const SUMMARISATION_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
会話の内容をもとに、ビジネスアイデアを整理してまとめてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "title": "アイデアの短いタイトル（20文字以内）",
  "summary": "アイデアの整理された説明（150文字程度、ポジティブなトーンで）",
  "suggestions": [
    "具体的な提案1（実行しやすいもの）",
    "具体的な提案2",
    "具体的な提案3"
  ],
  "nextStep": "今すぐできる最初のアクション（1つだけ、具体的に）"
}`;

type Message = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, chatHistory, pastedText } = body;

    if (!sessionId || !chatHistory || !pastedText) {
      return NextResponse.json(
        { error: "sessionId, chatHistory, and pastedText are required" },
        { status: 400 }
      );
    }

    // Look up user in Supabase
    const supabase = await createServerComponentClient();
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !dbUser) {
      console.error("Error finding user:", userError);
      return NextResponse.json(
        { error: "ユーザーが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // Format chat history for OpenAI
    const chatHistoryText = chatHistory
      .map((msg: Message) => {
        const role = msg.role === "agent" ? "コーチ" : "ユーザー";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    // Call OpenAI for summarization
    const userMessage = `以下の会話をもとに、ビジネスアイデアをまとめてください。

元のアイデア：
${pastedText}

会話の内容：
${chatHistoryText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SUMMARISATION_SYSTEM_PROMPT },
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

    // Insert into Supabase
    const { data: idea, error: insertError } = await supabase
      .from("ideas")
      .insert({
        user_id: dbUser.id,
        title: parsed.title,
        original_paste: pastedText,
        polished_content: parsed.summary,
        ai_suggestions: parsed, // store full JSON as jsonb
        is_upgraded: false,
      })
      .select()
      .single();

    if (insertError || !idea) {
      console.error("Error inserting idea:", insertError);
      return NextResponse.json(
        { error: "アイデアの保存に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ideaId: idea.id,
      title: parsed.title,
      summary: parsed.summary,
      suggestions: parsed.suggestions,
      nextStep: parsed.nextStep,
    });
  } catch (error) {
    console.error("Error in finalize:", error);
    return NextResponse.json(
      { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}

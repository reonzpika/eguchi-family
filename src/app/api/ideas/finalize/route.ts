import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, chatHistory: bodyChatHistory, ideaId } = body;

    const supabase = createAdminClient();
    let chatHistory = bodyChatHistory;

    if (ideaId) {
      const { data: idea, error: fetchError } = await supabase
        .from("ideas")
        .select("id, user_id, chat_history")
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
      const history = idea.chat_history;
      if (!Array.isArray(history) || history.length === 0) {
        return NextResponse.json(
          { error: "会話履歴がありません。" },
          { status: 400 }
        );
      }
      chatHistory = history;
    } else {
      if (!sessionId || !chatHistory) {
        return NextResponse.json(
          { error: "sessionId and chatHistory are required when not finalizing an existing idea" },
          { status: 400 }
        );
      }
    }

    // Format chat history for OpenAI
    const chatHistoryText = chatHistory
      .map((msg: Message) => {
        const role = msg.role === "agent" ? "コーチ" : "ユーザー";
        return `${role}: ${msg.content}`;
      })
      .join("\n");

    // Call OpenAI for summarization (conversation only; no pastedText)
    const userMessage = `以下の会話をもとに、ビジネスアイデアをまとめてください。

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

    if (ideaId) {
      const { data: idea, error: updateError } = await supabase
        .from("ideas")
        .update({
          polished_content: parsed.summary,
          ai_suggestions: parsed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId)
        .select()
        .single();

      if (updateError || !idea) {
        console.error("Error updating idea:", updateError);
        return NextResponse.json(
          { error: "アイデアの保存に失敗しました。" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ideaId: idea.id,
        title: idea.title,
        summary: parsed.summary,
        suggestions: parsed.suggestions,
        nextStep: parsed.nextStep,
      });
    }

    const { data: idea, error: insertError } = await supabase
      .from("ideas")
      .insert({
        user_id: session.user.id,
        title: parsed.title,
        original_paste: null,
        polished_content: parsed.summary,
        ai_suggestions: parsed,
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

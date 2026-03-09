import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/activity-feed";
import { generateFullSummary, type Message } from "@/lib/ideas-summary";

const TITLE_AND_SUMMARY_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
会話の内容から、アイデアの短いタイトルと、これまでの話の要約（1〜2文）を出してください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "title": "アイデアの短いタイトル（20文字以内）",
  "summary": "これまでの話の要約（1〜2文、ユーザーが続きから話せるように）"
}`;

async function getTitleAndChatSummary(
  chatHistory: Message[]
): Promise<{ title: string; chatSummary: string | null }> {
  let title = "新しいアイデア";
  let chatSummary: string | null = null;

  if (chatHistory.length === 0) {
    return { title, chatSummary };
  }

  const chatHistoryText = chatHistory
    .map((msg) => {
      const role = msg.role === "agent" ? "コーチ" : "ユーザー";
      return `${role}: ${msg.content}`;
    })
    .join("\n");

  const userMessage = `以下の会話から、タイトルと要約を出してください。

会話の内容：
${chatHistoryText}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: TITLE_AND_SUMMARY_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (responseText) {
    const clean = responseText.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      if (parsed.title && typeof parsed.title === "string") {
        title = parsed.title.slice(0, 100);
      }
      if (parsed.summary && typeof parsed.summary === "string") {
        chatSummary = parsed.summary.slice(0, 500);
      }
    } catch {
      // keep defaults
    }
  }

  return { title, chatSummary };
}

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
    const { chatHistory, ideaId } = body;

    if (!Array.isArray(chatHistory)) {
      return NextResponse.json(
        { error: "chatHistory must be an array" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { title, chatSummary } = await getTitleAndChatSummary(chatHistory as Message[]);

    if (ideaId) {
      const { data: idea, error: fetchError } = await supabase
        .from("ideas")
        .select("id, user_id, title")
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

      const { error: updateError } = await supabase
        .from("ideas")
        .update({
          title,
          chat_history: chatHistory,
          chat_summary: chatSummary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId);

      if (updateError) {
        console.error("Error updating draft idea:", updateError);
        return NextResponse.json(
          { error: "保存に失敗しました。" },
          { status: 500 }
        );
      }

      const full = await generateFullSummary(chatHistory as Message[]);
      const polishedContent =
        full?.summary || chatSummary || "会話の続きを保存しました。";
      const aiSuggestions = full
        ? {
            title: full.title,
            summary: full.summary,
            suggestions: full.suggestions,
            nextStep: full.nextStep,
          }
        : {
            title,
            summary: chatSummary || "",
            suggestions: [] as string[],
            nextStep: "会話を続けてください",
          };

      if (!full) {
        console.warn(
          "[ideas/chat/save] generateFullSummary returned null for ideaId:",
          ideaId
        );
      }

      const { error: polishError } = await supabase
        .from("ideas")
        .update({
          polished_content: polishedContent,
          ai_suggestions: aiSuggestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId);

      if (polishError) {
        console.error(
          "[ideas/chat/save] Failed to update polished_content:",
          polishError
        );
      }

      return NextResponse.json({
        ideaId: idea.id,
        title,
      });
    }

    const { data: idea, error: insertError } = await supabase
      .from("ideas")
      .insert({
        user_id: session.user.id,
        title,
        original_paste: null,
        polished_content: null,
        ai_suggestions: null,
        is_upgraded: false,
        chat_history: chatHistory,
        chat_summary: chatSummary,
      })
      .select("id, title")
      .single();

    if (insertError || !idea) {
      console.error("Error inserting draft idea:", insertError);
      return NextResponse.json(
        { error: "保存に失敗しました。" },
        { status: 500 }
      );
    }

    recordActivity(session.user.id, {
      activity_type: "idea_created",
      title: "新しいアイデアを保存しました",
      emoji: "💡",
      is_private: false,
    }).catch(() => {});

    const full = await generateFullSummary(chatHistory as Message[]);
    const polishedContent =
      full?.summary || chatSummary || "会話の続きを保存しました。";
    const aiSuggestions = full
      ? {
          title: full.title,
          summary: full.summary,
          suggestions: full.suggestions,
          nextStep: full.nextStep,
        }
      : {
          title,
          summary: chatSummary || "",
          suggestions: [] as string[],
          nextStep: "会話を続けてください",
        };

    if (!full) {
      console.warn(
        "[ideas/chat/save] generateFullSummary returned null for new idea:",
        idea.id
      );
    }

    const { error: polishError } = await supabase
      .from("ideas")
      .update({
        polished_content: polishedContent,
        ai_suggestions: aiSuggestions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idea.id);

    if (polishError) {
      console.error(
        "[ideas/chat/save] Failed to update polished_content:",
        polishError
      );
    }

    return NextResponse.json({
      ideaId: idea.id,
      title: idea.title,
    });
  } catch (error) {
    console.error("Error in chat/save:", error);
    return NextResponse.json(
      { error: "保存に失敗しました。" },
      { status: 500 }
    );
  }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import anthropic from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import {
  getDiscoveryProfileForUser,
  formatProfileForPrompt,
} from "@/lib/discovery-profile";
import { IDEA_CHAT_SYSTEM_PROMPT_BASE } from "@/lib/idea-chat-prompts";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const ideaId = body?.ideaId;

    if (ideaId) {
      const supabase = createAdminClient();
      const { data: idea, error } = await supabase
        .from("ideas")
        .select("id, user_id, chat_history, chat_summary")
        .eq("id", ideaId)
        .single();

      if (error || !idea) {
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
          { error: "このアイデアの会話履歴がありません。" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        resumed: true,
        ideaId: idea.id,
        chatHistory: history,
        chatSummary: idea.chat_summary ?? null,
      });
    }

    // Profile is for background personalisation only; prompt instructs AI not to repeat it to the user
    const profile = await getDiscoveryProfileForUser(session.user.id);
    const profileBlock = formatProfileForPrompt(profile);
    const systemPrompt = IDEA_CHAT_SYSTEM_PROMPT_BASE + "\n\n" + profileBlock;

    // No pastedText: conversation starts from scratch with an opener
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "これからアイデアを話し合います。最初の質問をしてください。",
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

    // No longer emit idea_started here: one card per "create idea" (only idea_created on save).
    // Previously we emitted idea_started on chat/start and idea_created on save, producing two cards.

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

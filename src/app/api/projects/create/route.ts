import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createServerComponentClient } from "@/lib/supabase-server";

const LIVING_DOC_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
以下のビジネスアイデアをもとに、リビングドキュメントの初版を
マークダウン形式で作成してください。

必ず以下のセクションを含めてください：
## 🎯 ビジョン
## 📦 製品・サービスアイデア
## 👥 ターゲット
## 🛒 販売・展開方法
## 📋 次のステップ（3つ）

温かく前向きなトーンで書いてください。`;

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
    const { ideaId, visibility } = body;

    if (!ideaId || !visibility) {
      return NextResponse.json(
        { error: "ideaId and visibility are required" },
        { status: 400 }
      );
    }

    if (visibility !== "public" && visibility !== "unlisted") {
      return NextResponse.json(
        { error: "visibility must be 'public' or 'unlisted'" },
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

    // Fetch the idea and verify ownership
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

    if (idea.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: "このアイデアを昇格する権限がありません。" },
        { status: 403 }
      );
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: dbUser.id,
        idea_id: ideaId,
        title: idea.title,
        status: "planning",
        visibility: visibility,
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error("Error creating project:", projectError);
      return NextResponse.json(
        { error: "プロジェクトの作成に失敗しました。" },
        { status: 500 }
      );
    }

    // Call OpenAI to generate living document
    const userMessage = `アイデア：${idea.polished_content || ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: LIVING_DOC_SYSTEM_PROMPT },
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
    const cleanContent = responseText.replace(/```markdown|```/g, "").trim();

    // Save living document
    const { error: docError } = await supabase
      .from("living_documents")
      .insert({
        project_id: project.id,
        content: cleanContent,
        version_number: 1,
        change_summary: "初版作成",
      });

    if (docError) {
      console.error("Error creating living document:", docError);
      return NextResponse.json(
        { error: "リビングドキュメントの作成に失敗しました。" },
        { status: 500 }
      );
    }

    // Mark idea as upgraded
    const { error: updateError } = await supabase
      .from("ideas")
      .update({ is_upgraded: true })
      .eq("id", ideaId);

    if (updateError) {
      console.error("Error updating idea:", updateError);
      // Don't fail the request, just log
    }

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("Error in project creation:", error);
    return NextResponse.json(
      { error: "プロジェクトの作成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

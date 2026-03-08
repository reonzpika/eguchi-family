import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/activity-feed";

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    const supabase = createAdminClient();

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

    if (idea.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このアイデアを昇格する権限がありません。" },
        { status: 403 }
      );
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: session.user.id,
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

    // Generate 3 initial milestones (fire-and-continue; don't fail project create)
    const MILESTONE_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
プロジェクトのリビングドキュメントをもとに、最初の3つのマイルストーンを生成してください。
各マイルストーンには、明確なタイトルと短い説明、および2〜4個の具体的なタスクを含めてください。
必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください。
\`\`\`json
{"milestones":[{"title":"タイトル","description":"説明","tasks":[{"title":"タスク","description":""}]}]}
\`\`\``;
    try {
      const milestoneCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: MILESTONE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `リビングドキュメント:\n${cleanContent}`,
          },
        ],
        temperature: 0.6,
      });
      const raw = milestoneCompletion.choices[0]?.message?.content;
      if (raw) {
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean) as {
          milestones?: Array<{
            title?: string;
            description?: string;
            tasks?: Array<{ title?: string; description?: string }>;
          }>;
        };
        const list = parsed.milestones?.slice(0, 3) ?? [];
        const adminSupabase = createAdminClient();
        for (let i = 0; i < list.length; i++) {
          const m = list[i];
          const { data: row } = await adminSupabase
            .from("milestones")
            .insert({
              project_id: project.id,
              title: m.title || `マイルストーン ${i + 1}`,
              description: m.description ?? null,
              sequence_order: i + 1,
              status: "not_started",
            })
            .select("id")
            .single();
          if (row && m.tasks?.length) {
            for (let j = 0; j < m.tasks.length; j++) {
              const t = m.tasks[j];
              await adminSupabase.from("tasks").insert({
                milestone_id: row.id,
                title: t.title || `タスク ${j + 1}`,
                description: t.description ?? null,
                sequence_order: j + 1,
                is_completed: false,
              });
            }
          }
        }
      }
    } catch (milestoneErr) {
      console.error("Initial milestone generation failed:", milestoneErr);
      // Project create still succeeds
    }

    await recordActivity(session.user.id, {
      activity_type: "project_created",
      title: `${idea.title} を作成しました`,
      project_id: project.id,
      emoji: "📁",
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("Error in project creation:", error);
    return NextResponse.json(
      { error: "プロジェクトの作成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/activity-feed";
import { updateProjectAiInsight } from "@/lib/project-ai-insight";
import { canEditProject } from "@/lib/project-permissions";
import type { Reflection } from "@/types/database";

function getStartOfWeekISO(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

const ANALYSIS_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
週次の振り返りとプロジェクトの状況を分析し、温かく具体的なフィードバックと、必要なアクションを返してください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください。
\`\`\`json
{
  "insight": "ユーザーへの励ましとアドバイス（日本語、4文以内）",
  "update_living_doc": true または false,
  "living_doc_suggestion": "リビングドキュメントに追加する内容（マークダウン可）。update_living_docがfalseの場合はnull",
  "generate_milestones": true または false,
  "direction": "keep_growing" または "maintain" または "pivot" または "break_down_smaller" または null
}
\`\`\`

ルール：
- insight は温かく、具体的に。ユーザーが書いた内容に触れる。
- update_living_doc は、重要な学びや気づきがあるとき、または行き詰まっているときのみ true。
- generate_milestones は、すべてのマイルストーンが完了しているとき、または同じマイルストーンに3週以上止まっているときのみ true。true のときは direction を必ず指定。
- direction は generate_milestones が true のとき必須。break_down_smaller は行き詰まり時に小さなステップを提案する場合。`;

interface ClaudeAnalysis {
  insight: string;
  update_living_doc: boolean;
  living_doc_suggestion: string | null;
  generate_milestones: boolean;
  direction: string | null;
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

    const body = await request.json().catch(() => ({}));
    const projectId = body.project_id ?? body.projectId;
    const what_worked = typeof body.what_worked === "string" ? body.what_worked : "";
    const wins = typeof body.wins === "string" ? body.wins : "";
    const blockers = typeof body.blockers === "string" ? body.blockers : "";

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title, user_id, shared_with_all")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (!canEditProject(project, session.user.id)) {
      return NextResponse.json(
        { error: "このプロジェクトの振り返りを送信する権限がありません。" },
        { status: 403 }
      );
    }

    const week_of = getStartOfWeekISO();

    const { data: existing } = await supabase
      .from("reflections")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", session.user.id)
      .eq("week_of", week_of)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "今週は既にこのプロジェクトの振り返りを送信しています。" },
        { status: 400 }
      );
    }

    const { data: milestones } = await supabase
      .from("milestones")
      .select("id, title, sequence_order, status")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true });

    const milestoneSummary =
      milestones?.map((m) => `${m.sequence_order}. ${m.title} (${m.status})`).join("\n") || "マイルストーンなし";

    const { data: recentReflections } = await supabase
      .from("reflections")
      .select("week_of, what_worked, wins, blockers, ai_insight")
      .eq("project_id", projectId)
      .eq("user_id", session.user.id)
      .order("week_of", { ascending: false })
      .limit(4);

    const reflectionContext =
      (recentReflections?.length ?? 0) > 0
        ? recentReflections!
            .map(
              (r) =>
                `週 ${r.week_of}: 進めたこと=${r.what_worked ?? ""} 成果=${r.wins ?? ""} 困りごと=${r.blockers ?? ""}`
            )
            .join("\n")
        : "過去の振り返りなし";

    const userMessage = `プロジェクト: ${project.title}

現在のマイルストーン:
${milestoneSummary}

過去の振り返り（直近）:
${reflectionContext}

今週の振り返り:
- 何を進めましたか？ ${what_worked || "（未記入）"}
- うまくいったことは？ ${wins || "（未記入）"}
- 困っていることは？ ${blockers || "（未記入）"}

上記を分析し、JSONのみ返答してください。`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AIの分析中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const raw = textBlock.text.replace(/```json|```/g, "").trim();
    let analysis: ClaudeAnalysis;
    try {
      analysis = JSON.parse(raw) as ClaudeAnalysis;
    } catch (e) {
      console.error("Failed to parse Claude reflection analysis:", e);
      return NextResponse.json(
        { error: "AIの分析結果の解析に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    let living_doc_updated = false;
    let new_milestones_generated = false;
    const origin = new URL(request.url).origin;
    const cookie = request.headers.get("cookie") ?? "";

    if (analysis.update_living_doc && analysis.living_doc_suggestion?.trim()) {
      try {
        const updateRes = await fetch(`${origin}/api/projects/${projectId}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie },
          body: JSON.stringify({
            newContent: analysis.living_doc_suggestion,
            updated_by: "ai",
          }),
        });
        if (updateRes.ok) living_doc_updated = true;
      } catch (e) {
        console.error("Living doc update failed:", e);
      }
    }

    if (analysis.generate_milestones && analysis.direction) {
      try {
        const genRes = await fetch(`${origin}/api/milestones/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", cookie },
          body: JSON.stringify({
            project_id: projectId,
            append: true,
            direction: analysis.direction,
          }),
        });
        if (genRes.ok) new_milestones_generated = true;
      } catch (e) {
        console.error("Milestone generation failed:", e);
      }
    }

    const { data: reflection, error: insertError } = await supabase
      .from("reflections")
      .insert({
        user_id: session.user.id,
        project_id: projectId,
        what_worked: what_worked || null,
        wins: wins || null,
        blockers: blockers || null,
        ai_insight: analysis.insight || null,
        living_doc_updated,
        new_milestones_generated,
        week_of,
      })
      .select()
      .single();

    if (insertError || !reflection) {
      console.error("Error inserting reflection:", insertError);
      return NextResponse.json(
        { error: "振り返りの保存に失敗しました。" },
        { status: 500 }
      );
    }

    await recordActivity(session.user.id, {
      activity_type: "reflection_submitted",
      title: `${project.title} の振り返りを送信しました`,
      project_id: projectId,
      emoji: "📝",
    });

    if (analysis.insight?.trim()) {
      updateProjectAiInsight(projectId, analysis.insight).catch(() => {});
    }

    return NextResponse.json({
      reflection: reflection as Reflection,
      ai_insight: analysis.insight || "",
      living_doc_updated,
      new_milestones_generated,
    });
  } catch (error) {
    console.error("Error in POST /api/reflections:", error);
    return NextResponse.json(
      { error: "振り返りの送信中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id") ?? undefined;
    const weeksParam = searchParams.get("weeks");
    const weeks = weeksParam ? Math.min(52, Math.max(1, parseInt(weeksParam, 10) || 12)) : 12;

    const supabase = createAdminClient();

    let query = supabase
      .from("reflections")
      .select("*")
      .eq("user_id", session.user.id)
      .order("week_of", { ascending: false });

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    const { data: rows, error } = await query.limit(weeks);

    if (error) {
      console.error("Error fetching reflections:", error);
      return NextResponse.json(
        { error: "振り返りの読み込みに失敗しました。" },
        { status: 500 }
      );
    }

    const reflections = (rows ?? []).map((r) => ({
      ...r,
      week_of: r.week_of ? new Date(r.week_of).toISOString().slice(0, 10) : r.week_of,
    }));

    return NextResponse.json({ reflections });
  } catch (error) {
    console.error("Error in GET /api/reflections:", error);
    return NextResponse.json(
      { error: "振り返りの読み込みに失敗しました。" },
      { status: 500 }
    );
  }
}

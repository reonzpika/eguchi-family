import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import type { Milestone } from "@/types/database";

const INITIAL_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
プロジェクトのリビングドキュメントをもとに、最初の3つのマイルストーンを生成してください。

各マイルストーンには、明確なタイトルと短い説明、および2〜4個の具体的なタスクを含めてください。
タスクは実行可能で、順序立てられたステップにしてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください。
\`\`\`json
{
  "milestones": [
    {
      "title": "マイルストーン1のタイトル",
      "description": "短い説明",
      "tasks": [
        { "title": "タスク1", "description": "任意の詳細" },
        { "title": "タスク2", "description": "任意の詳細" }
      ]
    },
    {
      "title": "マイルストーン2のタイトル",
      "description": "短い説明",
      "tasks": [
        { "title": "タスク1", "description": "任意の詳細" }
      ]
    },
    {
      "title": "マイルストーン3のタイトル",
      "description": "短い説明",
      "tasks": [
        { "title": "タスク1", "description": "任意の詳細" },
        { "title": "タスク2", "description": "任意の詳細" }
      ]
    }
  ]
}
\`\`\``;

interface GeneratedTask {
  title: string;
  description?: string;
}

interface GeneratedMilestone {
  title: string;
  description?: string;
  tasks: GeneratedTask[];
}

interface OpenAIResponse {
  milestones: GeneratedMilestone[];
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
    const append = body.append === true;
    const direction = body.direction as string | undefined;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このプロジェクトを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const { data: existingMilestones } = await supabase
      .from("milestones")
      .select("id, sequence_order")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: false })
      .limit(1);

    const hasExisting = existingMilestones && existingMilestones.length > 0;
    const startOrder = append && hasExisting
      ? (existingMilestones![0].sequence_order + 1)
      : 1;

    if (hasExisting && !append) {
      return NextResponse.json(
        { error: "このプロジェクトには既にマイルストーンがあります。次のマイルストーンを追加するには append=true を指定してください。" },
        { status: 400 }
      );
    }

    const APPEND_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
プロジェクトのリビングドキュメントと現在の進捗をもとに、次の3つのマイルストーンを生成してください。
directionに応じて調整してください：keep_growing=さらに成長、maintain=現状維持、pivot=方向転換、break_down_smaller=より小さなステップに分割。

各マイルストーンには、明確なタイトルと短い説明、および2〜4個の具体的なタスクを含めてください。
必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください。
\`\`\`json
{"milestones":[{"title":"...","description":"...","tasks":[{"title":"...","description":"..."}]}]}
\`\`\``;

    const systemPrompt = append ? APPEND_SYSTEM_PROMPT : INITIAL_SYSTEM_PROMPT;

    const { data: latestDoc } = await supabase
      .from("living_documents")
      .select("content")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const context = latestDoc?.content
      ? `リビングドキュメント:\n${latestDoc.content}`
      : `プロジェクト名: ${project.title}`;
    const userMessage = append
      ? `以下のプロジェクトに、次の3つのマイルストーンを追加してください。direction: ${direction || "keep_growing"}\n\n${context}`
      : `以下のプロジェクト向けに、最初の3つのマイルストーンを生成してください。\n\n${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
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

    const clean = responseText.replace(/```json|```/g, "").trim();
    let parsed: OpenAIResponse;
    try {
      parsed = JSON.parse(clean) as OpenAIResponse;
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      return NextResponse.json(
        { error: "AIの応答の解析に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const generated = parsed.milestones?.slice(0, 3);
    if (!Array.isArray(generated) || generated.length === 0) {
      return NextResponse.json(
        { error: "マイルストーンを生成できませんでした。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const insertedMilestones: Milestone[] = [];

    for (let i = 0; i < generated.length; i++) {
      const m = generated[i];
      const seq = startOrder + i;
      const { data: milestone, error: milestoneError } = await supabase
        .from("milestones")
        .insert({
          project_id: projectId,
          title: m.title || `マイルストーン ${seq}`,
          description: m.description ?? null,
          sequence_order: seq,
          status: "not_started",
        })
        .select()
        .single();

      if (milestoneError || !milestone) {
        console.error("Error inserting milestone:", milestoneError);
        return NextResponse.json(
          { error: "マイルストーンの保存に失敗しました。" },
          { status: 500 }
        );
      }

      insertedMilestones.push(milestone as Milestone);
      const tasks = m.tasks || [];
      for (let j = 0; j < tasks.length; j++) {
        const t = tasks[j];
        const { error: taskError } = await supabase.from("tasks").insert({
          milestone_id: milestone.id,
          title: t.title || `タスク ${j + 1}`,
          description: t.description ?? null,
          sequence_order: j + 1,
          is_completed: false,
        });
        if (taskError) {
          console.error("Error inserting task:", taskError);
          return NextResponse.json(
            { error: "タスクの保存に失敗しました。" },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ milestones: insertedMilestones });
  } catch (error) {
    console.error("Error in POST /api/milestones/generate:", error);
    return NextResponse.json(
      { error: "マイルストーンの生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { canEditProject } from "@/lib/project-permissions";
import type { MilestoneWithTasks } from "@/types/database";

export async function GET(
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

    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: "project id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerComponentClient();

    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true });

    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError);
      return NextResponse.json(
        { error: "マイルストーンの読み込みに失敗しました。" },
        { status: 500 }
      );
    }

    if (!milestones || milestones.length === 0) {
      return NextResponse.json({ milestones: [] });
    }

    const milestoneIds = milestones.map((m) => m.id);
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("milestone_id", milestoneIds)
      .order("sequence_order", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return NextResponse.json(
        { error: "タスクの読み込みに失敗しました。" },
        { status: 500 }
      );
    }

    const tasksByMilestone = new Map<string, typeof tasks>();
    (tasks || []).forEach((t) => {
      const list = tasksByMilestone.get(t.milestone_id) || [];
      list.push(t);
      tasksByMilestone.set(t.milestone_id, list);
    });

    const result: MilestoneWithTasks[] = milestones.map((m) => {
      const milestoneTasks = (tasksByMilestone.get(m.id) || []).sort(
        (a, b) => a.sequence_order - b.sequence_order
      );
      const total = milestoneTasks.length;
      const completed = milestoneTasks.filter((t) => t.is_completed).length;
      const completion_percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...m,
        tasks: milestoneTasks,
        completion_percentage,
      };
    });

    return NextResponse.json({ milestones: result });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/milestones:", error);
    return NextResponse.json(
      { error: "マイルストーンの読み込みに失敗しました。" },
      { status: 500 }
    );
  }
}

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

    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: "project id is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id, user_id, shared_with_all")
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
        { error: "このプロジェクトを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const { data: existing } = await admin
      .from("milestones")
      .select("sequence_order")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = existing ? existing.sequence_order + 1 : 1;

    const { data: milestone, error: insertError } = await admin
      .from("milestones")
      .insert({
        project_id: projectId,
        title,
        description,
        sequence_order: nextOrder,
        status: "not_started",
      })
      .select()
      .single();

    if (insertError || !milestone) {
      console.error("Error inserting milestone:", insertError);
      return NextResponse.json(
        { error: "マイルストーンの追加に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error("Error in POST /api/projects/[id]/milestones:", error);
    return NextResponse.json(
      { error: "マイルストーンの追加に失敗しました。" },
      { status: 500 }
    );
  }
}

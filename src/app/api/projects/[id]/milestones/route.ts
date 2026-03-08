import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";
import { authOptions } from "@/lib/auth";
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

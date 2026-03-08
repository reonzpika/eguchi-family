import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function PATCH(
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

    const { id: taskId } = await params;
    if (!taskId) {
      return NextResponse.json(
        { error: "task id is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const is_completed = body.is_completed === true;

    const supabase = createAdminClient();

    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("id, milestone_id")
      .eq("id", taskId)
      .single();

    if (fetchError || !task) {
      return NextResponse.json(
        { error: "タスクが見つかりませんでした。" },
        { status: 404 }
      );
    }

    const { data: milestone } = await supabase
      .from("milestones")
      .select("id, project_id, status")
      .eq("id", task.milestone_id)
      .single();

    if (!milestone) {
      return NextResponse.json(
        { error: "マイルストーンが見つかりませんでした。" },
        { status: 404 }
      );
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", milestone.project_id)
      .single();

    if (!project || project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このタスクを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({
        is_completed,
        completed_at: is_completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId)
      .select()
      .single();

    if (updateError || !updatedTask) {
      console.error("Error updating task:", updateError);
      return NextResponse.json(
        { error: "タスクの更新に失敗しました。" },
        { status: 500 }
      );
    }

    const { data: updatedMilestone } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", task.milestone_id)
      .single();

    const { data: allTasks } = await supabase
      .from("tasks")
      .select("is_completed")
      .eq("milestone_id", task.milestone_id);

    const allDone =
      (allTasks?.length ?? 0) > 0 &&
      (allTasks ?? []).every((t) => t.is_completed);
    let auto_completed = false;

    if (allDone && milestone.status === "in_progress") {
      const { error: completeError } = await supabase
        .from("milestones")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.milestone_id);

      if (!completeError) {
        auto_completed = true;
        const { data: allMilestones } = await supabase
          .from("milestones")
          .select("id, sequence_order, status")
          .eq("project_id", project.id)
          .order("sequence_order", { ascending: true });

        const total = allMilestones?.length ?? 0;
        let completedCount = 0;
        let currentMilestoneTaskPct = 0;

        if (allMilestones) {
          for (const m of allMilestones) {
            if (m.status === "completed") {
              completedCount++;
            } else if (m.status === "in_progress") {
              const { data: mTasks } = await supabase
                .from("tasks")
                .select("is_completed")
                .eq("milestone_id", m.id);
              const taskTotal = mTasks?.length ?? 0;
              const taskCompleted =
                mTasks?.filter((t) => t.is_completed).length ?? 0;
              currentMilestoneTaskPct =
                taskTotal > 0 ? (taskCompleted / taskTotal) * 100 : 0;
              break;
            }
          }
        }

        const progress_percentage =
          total > 0
            ? Math.round(
                (completedCount * 100 + currentMilestoneTaskPct) / total
              )
            : 0;

        await supabase
          .from("projects")
          .update({
            progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
            last_activity_at: new Date().toISOString(),
          })
          .eq("id", project.id);
      }
    } else {
      await supabase
        .from("projects")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("id", project.id);
    }

    const { data: milestoneAfter } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", task.milestone_id)
      .single();

    const { data: projectAfter } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project.id)
      .single();

    return NextResponse.json({
      task: updatedTask,
      milestone: milestoneAfter ?? updatedMilestone,
      project: projectAfter,
      auto_completed,
    });
  } catch (error) {
    console.error("Error in PATCH /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "タスクの更新に失敗しました。" },
      { status: 500 }
    );
  }
}

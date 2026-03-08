import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { recordActivity } from "@/lib/activity-feed";
import { sendNotification } from "@/lib/notifications";

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

    const { id: milestoneId } = await params;
    if (!milestoneId) {
      return NextResponse.json(
        { error: "milestone id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: milestone, error: fetchError } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", milestoneId)
      .single();

    if (fetchError || !milestone) {
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
        { error: "このマイルストーンを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const { error: updateMilestoneError } = await supabase
      .from("milestones")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", milestoneId);

    if (updateMilestoneError) {
      console.error("Error completing milestone:", updateMilestoneError);
      return NextResponse.json(
        { error: "マイルストーンの完了に失敗しました。" },
        { status: 500 }
      );
    }

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
          const { data: tasks } = await supabase
            .from("tasks")
            .select("is_completed")
            .eq("milestone_id", m.id);
          const taskTotal = tasks?.length ?? 0;
          const taskCompleted = tasks?.filter((t) => t.is_completed).length ?? 0;
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

    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({
        progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (projectUpdateError) {
      console.error("Error updating project progress:", projectUpdateError);
    }

    const { data: updatedMilestone } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", milestoneId)
      .single();

    const { data: updatedProject } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project.id)
      .single();

    const nextInProgress = allMilestones?.find(
      (m) => m.id !== milestoneId && m.status === "not_started"
    );
    let next_milestone: (typeof updatedMilestone) | null = null;
    if (nextInProgress) {
      const { data: next } = await supabase
        .from("milestones")
        .select("*")
        .eq("id", nextInProgress.id)
        .single();
      next_milestone = next;
    }

    await recordActivity(session.user.id, {
      activity_type: "milestone_completed",
      title: `${milestone.title} を完了しました`,
      project_id: project.id,
      milestone_id: milestoneId,
      emoji: "🎉",
    });

    await sendNotification({
      user_id: session.user.id,
      type: "milestone_celebration",
      title: "マイルストーンを完了しました",
      body: `${milestone.title} を完了しました。お疲れ様です。`,
      action_url: `/projects/${project.id}`,
      project_id: project.id,
      priority: "medium",
    });

    return NextResponse.json({
      milestone: updatedMilestone,
      project: updatedProject,
      next_milestone,
      celebration: {
        message: "マイルストーンを完了しました！お疲れ様です。",
        confetti: true,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/milestones/[id]/complete:", error);
    return NextResponse.json(
      { error: "マイルストーンの完了に失敗しました。" },
      { status: 500 }
    );
  }
}

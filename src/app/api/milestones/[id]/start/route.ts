import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { canEditProject } from "@/lib/project-permissions";

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
      .select("id, project_id, status")
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
      .select("user_id, shared_with_all")
      .eq("id", milestone.project_id)
      .single();

    if (!project || !canEditProject(project, session.user.id)) {
      return NextResponse.json(
        { error: "このマイルストーンを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const { data: currentInProgress } = await supabase
      .from("milestones")
      .select("id")
      .eq("project_id", milestone.project_id)
      .eq("status", "in_progress")
      .neq("id", milestoneId)
      .maybeSingle();

    if (currentInProgress) {
      await supabase
        .from("milestones")
        .update({ status: "not_started", started_at: null })
        .eq("id", currentInProgress.id);
    }

    const { data: updated, error: updateError } = await supabase
      .from("milestones")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", milestoneId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("Error starting milestone:", updateError);
      return NextResponse.json(
        { error: "マイルストーンの開始に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ milestone: updated });
  } catch (error) {
    console.error("Error in POST /api/milestones/[id]/start:", error);
    return NextResponse.json(
      { error: "マイルストーンの開始に失敗しました。" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const { status: newStatus } = body as { status?: string };

    if (!projectId) {
      return NextResponse.json(
        { error: "project id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .single();

    if (fetchError || !project) {
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

    const updates: Record<string, unknown> = {};
    if (typeof newStatus === "string" && newStatus.trim()) {
      updates.status = newStatus.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select()
      .single();

    if (updateError) {
      console.error("Project PATCH error:", updateError);
      return NextResponse.json(
        { error: "プロジェクトの更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Error in PATCH /api/projects/[id]:", error);
    return NextResponse.json(
      { error: "プロジェクトの更新に失敗しました。" },
      { status: 500 }
    );
  }
}

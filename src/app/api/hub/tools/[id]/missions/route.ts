import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";
import { notifyAllFamilyUsers } from "@/lib/hub/notify-family";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { id: toolId } = await params;
    const body = await request.json();

    const admin = createAdminClient();
    const { data: tool, error: tErr } = await admin
      .from("family_tools")
      .select("id, user_id, name, status")
      .eq("id", toolId)
      .single();

    if (tErr || !tool || tool.status !== "published") {
      return NextResponse.json({ error: "tool not found" }, { status: 404 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const { data: mission, error } = await admin
      .from("family_tool_missions")
      .insert({
        tool_id: toolId,
        title,
        estimated_minutes:
          typeof body.estimated_minutes === "number" ? body.estimated_minutes : null,
        steps: body.steps ?? [],
        prompt_blocks: body.prompt_blocks ?? [],
        done_criteria: body.done_criteria ?? [],
        published: body.published !== false,
        sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
      })
      .select("*")
      .single();

    if (error || !mission) {
      console.error(error);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    if (mission.published) {
      await notifyAllFamilyUsers({
        type: "hub_new_mission",
        title: "新しいミッション",
        body: `「${tool.name}」${mission.title}`,
        action_url: `/tools/${toolId}/missions/${mission.id}`,
      });
    }

    return NextResponse.json({ mission }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

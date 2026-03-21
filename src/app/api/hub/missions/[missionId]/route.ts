import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { missionId } = await params;
    const admin = createAdminClient();
    const { data: mission, error } = await admin
      .from("family_tool_missions")
      .select("*")
      .eq("id", missionId)
      .single();

    if (error || !mission) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (!mission.published && !isAdmin(session.user.member_id ?? "")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { data: tool } = await admin
      .from("family_tools")
      .select("id, name, status")
      .eq("id", mission.tool_id)
      .single();

    return NextResponse.json({ mission, tool });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { missionId } = await params;
    const body = await request.json();
    const admin = createAdminClient();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (body.estimated_minutes !== undefined) {
      updates.estimated_minutes = body.estimated_minutes;
    }
    if (body.steps !== undefined) updates.steps = body.steps;
    if (body.prompt_blocks !== undefined) updates.prompt_blocks = body.prompt_blocks;
    if (body.done_criteria !== undefined) updates.done_criteria = body.done_criteria;
    if (typeof body.published === "boolean") updates.published = body.published;
    if (typeof body.sort_order === "number") updates.sort_order = body.sort_order;

    const { data: mission, error } = await admin
      .from("family_tool_missions")
      .update(updates)
      .eq("id", missionId)
      .select("*")
      .single();

    if (error || !mission) {
      return NextResponse.json({ error: "update failed" }, { status: 500 });
    }

    return NextResponse.json({ mission });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { missionId } = await params;
    const admin = createAdminClient();
    const { error } = await admin
      .from("family_tool_missions")
      .delete()
      .eq("id", missionId);

    if (error) {
      return NextResponse.json({ error: "delete failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";
import type { HubMissionDraft, HubToolProfile } from "@/types/hub";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: tool, error } = await admin
      .from("family_tools")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !tool) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (tool.status === "draft" && tool.user_id !== session.user.id) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const showAllMissions =
      session.user.member_id && isAdmin(session.user.member_id);

    let missionQuery = admin
      .from("family_tool_missions")
      .select("*")
      .eq("tool_id", id)
      .order("sort_order", { ascending: true });

    if (!showAllMissions) {
      missionQuery = missionQuery.eq("published", true);
    }

    const { data: missions } = await missionQuery;

    return NextResponse.json({
      tool,
      missions: missions ?? [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: tool, error } = await admin
      .from("family_tools")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !tool) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (tool.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (body.website_url !== undefined) {
      updates.website_url =
        typeof body.website_url === "string" ? body.website_url.trim() || null : null;
    }
    if (body.profile_json !== undefined) {
      updates.profile_json = body.profile_json as HubToolProfile;
    }
    if (body.mission_draft_json !== undefined) {
      updates.mission_draft_json = body.mission_draft_json as HubMissionDraft | null;
    }

    const { data: updated, error: upErr } = await admin
      .from("family_tools")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (upErr || !updated) {
      return NextResponse.json({ error: "update failed" }, { status: 500 });
    }

    return NextResponse.json({ tool: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: tool, error } = await admin
      .from("family_tools")
      .select("id, user_id, status")
      .eq("id", id)
      .single();

    if (error || !tool) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (tool.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { error: delErr } = await admin.from("family_tools").delete().eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: "delete failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

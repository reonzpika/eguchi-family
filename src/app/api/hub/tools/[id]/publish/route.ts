import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { notifyAllFamilyUsers } from "@/lib/hub/notify-family";
import { createAdminClient } from "@/lib/supabase-admin";
import type { HubMissionDraft } from "@/types/hub";

export async function POST(
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

    if (tool.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (tool.status === "published") {
      return NextResponse.json({ error: "already published" }, { status: 400 });
    }

    const { data: published, error: pubErr } = await admin
      .from("family_tools")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
        featured_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (pubErr || !published) {
      return NextResponse.json({ error: "publish failed" }, { status: 500 });
    }

    const draft = tool.mission_draft_json as HubMissionDraft | null;
    if (draft && draft.title) {
      await admin.from("family_tool_missions").insert({
        tool_id: id,
        title: draft.title,
        estimated_minutes: draft.estimated_minutes,
        steps: draft.steps ?? [],
        prompt_blocks: draft.prompt_blocks ?? [],
        done_criteria: draft.done_criteria ?? [],
        published: true,
        sort_order: 0,
      });
    }

    await notifyAllFamilyUsers({
      type: "hub_new_tool",
      title: "新しいAIツール",
      body: `「${published.name}」が追加されました`,
      action_url: `/tools/${id}`,
      exclude_user_id: session.user.id,
    });

    return NextResponse.json({ tool: published });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

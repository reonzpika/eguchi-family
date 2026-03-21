import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { enrichToolWithAI } from "@/lib/hub/enrich-tool";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(
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

    let note: string | null = null;
    try {
      const body = await request.json();
      if (typeof body.note === "string") note = body.note.trim() || null;
    } catch {
      /* empty body ok */
    }

    const enriched = await enrichToolWithAI({
      name: tool.name,
      website_url: tool.website_url,
      note,
    });

    const { data: updated, error: upErr } = await admin
      .from("family_tools")
      .update({
        profile_json: enriched.profile,
        mission_draft_json: enriched.mission_draft,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (upErr || !updated) {
      return NextResponse.json({ error: "update failed" }, { status: 500 });
    }

    return NextResponse.json({ tool: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "AI処理に失敗しました" },
      { status: 500 }
    );
  }
}

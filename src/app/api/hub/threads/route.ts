import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get("tool_id");
    const plaza = searchParams.get("plaza") === "1";

    const admin = createAdminClient();
    let q = admin
      .from("family_tool_threads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (toolId) {
      q = q.eq("tool_id", toolId);
    } else if (plaza) {
      q = q.is("tool_id", null);
    } else {
      return NextResponse.json(
        { error: "tool_id or plaza=1 required" },
        { status: 400 }
      );
    }

    const { data: threads, error } = await q;

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "fetch failed" }, { status: 500 });
    }

    return NextResponse.json({ threads: threads ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title || title.length < 2) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const kind = body.kind === "qa" ? "qa" : "general";
    const toolId =
      typeof body.tool_id === "string" && body.tool_id ? body.tool_id : null;

    if (toolId && kind !== "qa" && kind !== "general") {
      return NextResponse.json({ error: "invalid kind" }, { status: 400 });
    }

    if (!toolId && kind !== "general") {
      return NextResponse.json({ error: "plaza requires general" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (toolId) {
      const { data: tool } = await admin
        .from("family_tools")
        .select("id, status")
        .eq("id", toolId)
        .single();
      if (!tool || tool.status !== "published") {
        return NextResponse.json({ error: "tool not found" }, { status: 404 });
      }
    }

    const { data: thread, error } = await admin
      .from("family_tool_threads")
      .insert({
        tool_id: toolId,
        kind: toolId ? kind : "general",
        title,
        created_by: session.user.id,
      })
      .select("*")
      .single();

    if (error || !thread) {
      console.error(error);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    return NextResponse.json({ thread }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

/** First published mission (by tool sort) for home hero. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: tools } = await admin
      .from("family_tools")
      .select("id, name")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (!tools?.length) {
      return NextResponse.json({ featured: null });
    }

    for (const t of tools) {
      const { data: missions } = await admin
        .from("family_tool_missions")
        .select("*")
        .eq("tool_id", t.id)
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .limit(1);
      const m = missions?.[0];
      if (m) {
        return NextResponse.json({
          featured: {
            tool: { id: t.id, name: t.name },
            mission: m,
          },
        });
      }
    }

    return NextResponse.json({ featured: null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

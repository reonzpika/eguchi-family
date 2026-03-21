import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

/** All published missions across published tools (for hub missions index). */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("family_tool_missions")
      .select(
        "id, tool_id, title, estimated_minutes, published, updated_at, family_tools ( name, status )"
      )
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(80);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "fetch failed" }, { status: 500 });
    }

    const missions = (rows ?? [])
      .filter((r) => {
        const t = r.family_tools as { status?: string } | null;
        return t?.status === "published";
      })
      .map((r) => {
        const tool = r.family_tools as { name?: string } | null;
        return {
          id: r.id as string,
          tool_id: r.tool_id as string,
          tool_name: tool?.name ?? "",
          title: r.title as string,
          estimated_minutes: r.estimated_minutes as number | null,
          updated_at: r.updated_at as string,
        };
      });

    return NextResponse.json({ missions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

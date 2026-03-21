import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { enrichToolWithAI } from "@/lib/hub/enrich-tool";
import { createAdminClient } from "@/lib/supabase-admin";
import type { HubToolProfile } from "@/types/hub";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: published, error: pubErr } = await admin
      .from("family_tools")
      .select("*")
      .eq("status", "published")
      .order("featured_at", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (pubErr) {
      console.error(pubErr);
      return NextResponse.json({ error: "fetch failed" }, { status: 500 });
    }

    const { data: drafts } = await admin
      .from("family_tools")
      .select("*")
      .eq("status", "draft")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    return NextResponse.json({
      published: published ?? [],
      my_drafts: drafts ?? [],
    });
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    const website_url =
      typeof body.website_url === "string" ? body.website_url.trim() || null : null;
    const note =
      typeof body.note === "string" ? body.note.trim() || null : null;
    const runEnrich = body.enrich === true;

    const emptyProfile: HubToolProfile = {
      summary: "",
      good_for: [],
      bad_for: [],
      cautions: [],
    };

    const admin = createAdminClient();
    const insertPayload = {
      user_id: session.user.id,
      name,
      website_url,
      status: "draft" as const,
      profile_json: emptyProfile,
      mission_draft_json: null as unknown,
    };

    const { data: row, error } = await admin
      .from("family_tools")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !row) {
      console.error(error);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    if (runEnrich) {
      try {
        const enriched = await enrichToolWithAI({ name, website_url, note });
        const { data: updated, error: upErr } = await admin
          .from("family_tools")
          .update({
            profile_json: enriched.profile,
            mission_draft_json: enriched.mission_draft,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id)
          .select("*")
          .single();
        if (!upErr && updated) {
          return NextResponse.json({ tool: updated });
        }
      } catch (aiErr) {
        console.error(aiErr);
        return NextResponse.json(
          {
            tool: row,
            warning: "AIの下書き生成に失敗しました。後から再試行できます。",
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ tool: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

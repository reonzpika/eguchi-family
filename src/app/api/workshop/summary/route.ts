import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { nextStageKey, type StageKey } from "@/lib/workshop/recipes";

/**
 * Per-business stage summaries (the loop-back the member pastes from Claude).
 * GET  ?business_id= -> that business's summary timeline.
 * POST -> append a summary; if verdict is "ready", advance the business to the
 *         next stage (or mark it done after the last stage).
 */

async function ownedBusiness(adminUserId: string, businessId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("businesses")
    .select("id, user_id, current_stage, status")
    .eq("id", businessId)
    .single();
  if (!data || data.user_id !== adminUserId) return null;
  return data as { id: string; user_id: string; current_stage: string; status: string };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = request.nextUrl.searchParams.get("business_id");
  if (!businessId) {
    return NextResponse.json({ error: "business_id is required" }, { status: 400 });
  }

  const biz = await ownedBusiness(session.user.id, businessId);
  if (!biz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stage_summaries")
    .select("id, stage, summary, verdict, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("summary GET error:", error);
    return NextResponse.json({ error: "Failed to load summaries" }, { status: 500 });
  }

  return NextResponse.json({ summaries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { business_id?: string; stage?: string; summary?: string; verdict?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const businessId = body.business_id?.trim();
  const stage = body.stage?.trim();
  const summary = body.summary?.trim();
  if (!businessId || !stage || !summary) {
    return NextResponse.json({ error: "business_id, stage and summary are required" }, { status: 400 });
  }

  const biz = await ownedBusiness(session.user.id, businessId);
  if (!biz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { error: insErr } = await admin.from("stage_summaries").insert({
    business_id: businessId,
    stage,
    summary,
    verdict: body.verdict ?? null,
  });
  if (insErr) {
    console.error("summary POST insert error:", insErr);
    return NextResponse.json({ error: "Failed to save summary" }, { status: 500 });
  }

  // On a "ready" verdict, advance the business to the next stage (or finish it).
  let advancedTo: string | null = null;
  let finished = false;
  if (body.verdict === "ready") {
    const next = nextStageKey(stage as StageKey);
    if (next) {
      advancedTo = next;
      await admin
        .from("businesses")
        .update({ current_stage: next, updated_at: new Date().toISOString() })
        .eq("id", businessId);
    } else {
      finished = true;
      await admin
        .from("businesses")
        .update({ status: "launched", updated_at: new Date().toISOString() })
        .eq("id", businessId);
    }
  }

  return NextResponse.json({ ok: true, advancedTo, finished });
}

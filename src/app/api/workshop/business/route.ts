import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { FIRST_STAGE } from "@/lib/workshop/recipes";

/**
 * Workshop businesses.
 * GET  -> the current user's businesses (latest first).
 * POST -> create a business from a committed idea (starts at the first stage).
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .select("id, idea, current_stage, status, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("business GET error:", error);
    return NextResponse.json({ error: "Failed to load businesses" }, { status: 500 });
  }

  return NextResponse.json({ businesses: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { idea?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const idea = body.idea?.trim();
  if (!idea) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .insert({ user_id: session.user.id, idea, current_stage: FIRST_STAGE, status: "active" })
    .select("id, idea, current_stage, status, created_at")
    .single();

  if (error || !data) {
    console.error("business POST error:", error);
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }

  return NextResponse.json({ business: data });
}

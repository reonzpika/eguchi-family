import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * Learning-journey progress.
 * GET  -> all of the current user's completed lessons.
 * POST -> mark one lesson done (with optional reflection). Upsert.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lesson_progress")
    .select("lesson_id, status, reflection, completed_at")
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }

  return NextResponse.json({ progress: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id?: string; reflection?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const lessonId = body.lesson_id?.trim();
  if (!lessonId) {
    return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin.from("lesson_progress").upsert(
    {
      user_id: session.user.id,
      lesson_id: lessonId,
      status: "done",
      reflection: body.reflection?.trim() || null,
      completed_at: now,
      updated_at: now,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

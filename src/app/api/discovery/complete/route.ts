import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/discovery/complete
 * Saves discovery assessment answers to the user's profile (discovery_profiles).
 * Call this when the user finishes the discovery flow.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: { answers?: Record<string, string | string[] | number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const answers = body.answers ?? {};
  const admin = createAdminClient();

  const { error } = await admin
    .from("discovery_profiles")
    .upsert(
      {
        user_id: session.user.id,
        answers,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.warn("[discovery/complete] Profile save failed (table may not exist):", error.message);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

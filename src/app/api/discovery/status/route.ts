import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * Returns whether the user has "completed" discovery for first-time gate.
 * Completed if they already have ideas (returning user) or have a discovery_profiles row.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ completed: false }, { status: 401 });
  }

  const admin = createAdminClient();
  const [ideasResult, profileResult] = await Promise.all([
    admin
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id),
    admin
      .from("discovery_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const hasIdeas = (ideasResult.count ?? 0) > 0;
  const hasProfile =
    !profileResult.error && profileResult.data != null;
  return NextResponse.json({ completed: hasIdeas || hasProfile });
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Keep-alive: a trivial daily query so Supabase never sees the project as idle
// and auto-pauses it (free tier pauses after 7 days of inactivity). Invoked by
// the Vercel cron defined in vercel.json. See AGENTS.md learning log.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Optional guard: if CRON_SECRET is set in the environment, require it.
  // Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on cron
  // invocations when the env var exists. Left open otherwise; the endpoint only
  // returns a liveness flag, never any data.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    // Lightest possible touch: a head-only count against an existing table.
    const { error } = await supabase
      .from("users")
      .select("id", { head: true, count: "exact" });

    if (error) {
      console.error("Keep-alive query error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

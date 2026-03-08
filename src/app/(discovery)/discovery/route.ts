import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { saveDiscoveryProfile } from "@/lib/discovery-profile";

/**
 * POST /discovery
 * Saves discovery assessment answers (same as POST /api/discovery/complete).
 * Handles clients that POST to the page path instead of the API path.
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

  const result = await saveDiscoveryProfile(session.user.id, body.answers ?? {});
  return NextResponse.json(
    result.ok ? { ok: true } : { error: result.error },
    { status: result.ok ? 200 : 500 }
  );
}

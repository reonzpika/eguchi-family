import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const subscription = body?.subscription as { endpoint?: string; keys?: { p256dh?: string; auth?: string } } | undefined;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: "subscription with endpoint and keys (p256dh, auth) is required" },
        { status: 400 }
      );
    }
    const userAgent = request.headers.get("user-agent") ?? null;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("push_subscriptions")
      .upsert(
        {
          user_id: session.user.id,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          user_agent: userAgent,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" }
      )
      .select()
      .single();
    if (error) {
      console.error("Push subscribe error:", error);
      return NextResponse.json(
        { error: "Push subscription failed." },
        { status: 500 }
      );
    }
    return NextResponse.json({ subscription: data });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json(
      { error: "Push subscription failed." },
      { status: 500 }
    );
  }
}

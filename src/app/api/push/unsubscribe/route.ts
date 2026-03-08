import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const endpoint = body?.endpoint as string | undefined;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", session.user.id)
      .eq("endpoint", endpoint);

    if (error) {
      console.error("Push unsubscribe error:", error);
      return NextResponse.json(
        { error: "プッシュ通知の解除に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return NextResponse.json(
      { error: "プッシュ通知の解除に失敗しました。" },
      { status: 500 }
    );
  }
}

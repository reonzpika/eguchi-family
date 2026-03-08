import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id)
      .eq("is_read", false)
      .select("id");

    if (error) {
      console.error("Mark all read error:", error);
      return NextResponse.json(
        { error: "通知の更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: updated?.length ?? 0 });
  } catch (err) {
    console.error("Mark all read error:", err);
    return NextResponse.json(
      { error: "通知の更新に失敗しました。" },
      { status: 500 }
    );
  }
}

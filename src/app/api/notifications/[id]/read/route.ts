import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: notification, error } = await admin
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error || !notification) {
      return NextResponse.json(
        { error: "通知が見つかりませんでした。" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification });
  } catch (err) {
    console.error("Notification read PATCH error:", err);
    return NextResponse.json(
      { error: "通知の更新に失敗しました。" },
      { status: 500 }
    );
  }
}

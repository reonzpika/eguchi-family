import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * ピコ conversations.
 * GET  -> the current user's chats (newest first).
 * POST -> create a new empty chat.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pico_conversations")
    .select("id, title, updated_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("conversations GET error:", error);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pico_conversations")
    .insert({ user_id: session.user.id })
    .select("id, title, updated_at")
    .single();

  if (error || !data) {
    console.error("conversations POST error:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }

  return NextResponse.json({ conversation: data });
}

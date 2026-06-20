import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { buildPicoSystem, updatePicoMemory } from "@/lib/workshop/pico-context";

/**
 * ピコ, the persistent context-aware companion. Body: { conversationId, message }.
 * Loads the chat history, builds a system prompt with the member's app context +
 * shared memory, streams the reply, then persists both messages and updates the
 * running memory. Web search + streaming retained.
 */

const FRIENDLY_ERROR = "うまくいきませんでした。少し時間をおいて、もう一度ためしてみてね。";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!conversationId || !message) {
    return NextResponse.json({ error: "conversationId and message are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: convo } = await admin
    .from("pico_conversations")
    .select("id, user_id, title")
    .eq("id", conversationId)
    .single();
  if (!convo || convo.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // load history
  const { data: hist } = await admin
    .from("pico_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  const history = (hist ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content as string }));
  const convoMessages = [...history, { role: "user" as const, content: message }];

  // persist the user message + bump the conversation (title from first message)
  await admin.from("pico_messages").insert({ conversation_id: conversationId, role: "user", content: message });
  const titleUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (!convo.title) titleUpdate.title = message.length > 30 ? message.slice(0, 30) + "…" : message;
  await admin.from("pico_conversations").update(titleUpdate).eq("id", conversationId);

  const system = await buildPicoSystem(userId);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        const mstream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          system,
          messages: convoMessages,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        });
        for await (const event of mstream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        console.error("pico chat error:", error);
        if (!full) controller.enqueue(encoder.encode(FRIENDLY_ERROR));
      } finally {
        if (full.trim()) {
          try {
            await admin
              .from("pico_messages")
              .insert({ conversation_id: conversationId, role: "assistant", content: full });
            await updatePicoMemory(userId, message, full);
          } catch (e) {
            console.error("pico persist error:", e);
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}

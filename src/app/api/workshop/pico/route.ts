import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";
import { GATE_SYSTEM, judgeSystem, getStage } from "@/lib/workshop/recipes";

/**
 * ピコ, the workshop guide + judge (warm to the person, honest about the business).
 * mode "gate"  -> readiness chat. Body: { messages }. Returns {type:"question"|"ready", content, idea?}.
 * mode "judge" -> stage verdict on a pasted summary. Body: { stage, idea, summary }.
 *                 Returns {ready, content, megaPrompt?}.
 * Stateless: the client passes what is needed each call. Reuses CLAUDE_MODEL.
 */

const FRIENDLY_ERROR = "うまくいきませんでした。少し時間をおいて、もう一度ためしてみてください。";

function extractJson(text: string): Record<string, unknown> {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t) as Record<string, unknown>;
}

async function callClaude(system: string, messages: { role: "user" | "assistant"; content: string }[]) {
  const res = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system,
    messages,
  });
  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("no text content");
  return extractJson(block.text);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const mode = body?.mode === "judge" ? "judge" : "gate";

  try {
    if (mode === "gate") {
      const incoming = Array.isArray(body?.messages) ? body.messages : [];
      const messages = incoming
        .filter(
          (m: unknown): m is { role: "user" | "assistant"; content: string } =>
            !!m &&
            typeof (m as { content?: unknown }).content === "string" &&
            ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant")
        )
        .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }));
      const convo =
        messages.length > 0 && messages[0].role === "user"
          ? messages
          : [{ role: "user" as const, content: "アイデアができました。見てください。" }];

      const obj = await callClaude(GATE_SYSTEM, convo);
      if (obj.type === "ready" && typeof obj.content === "string" && typeof obj.idea === "string") {
        return NextResponse.json({ type: "ready", content: obj.content, idea: obj.idea });
      }
      if (typeof obj.content === "string") {
        return NextResponse.json({ type: "question", content: obj.content });
      }
      throw new Error("unexpected gate shape");
    }

    // judge
    const stageKey = typeof body?.stage === "string" ? body.stage : "";
    const stage = getStage(stageKey);
    const idea = typeof body?.idea === "string" ? body.idea : "";
    const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
    if (!stage || !summary) {
      return NextResponse.json({ error: "stage and summary are required" }, { status: 400 });
    }

    const userMsg = `わたしのアイデア：${idea || "（未記入）"}\n\nこのステージ「${stage.label}」のまとめ：\n${summary}`;
    const obj = await callClaude(judgeSystem(stage), [{ role: "user", content: userMsg }]);
    const ready = obj.ready === true;
    const content = typeof obj.content === "string" ? obj.content : "";
    const megaPrompt = !ready && typeof obj.megaPrompt === "string" ? obj.megaPrompt : "";
    return NextResponse.json({ ready, content, megaPrompt });
  } catch (error) {
    console.error("workshop pico error:", error);
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 500 });
  }
}

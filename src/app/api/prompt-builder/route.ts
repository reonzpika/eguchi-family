import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";
import {
  getDiscoveryProfileForUser,
  formatProfileForPrompt,
} from "@/lib/discovery-profile";

/**
 * AI prompt-engineer. Given the member's goal, it either asks one more friendly
 * question or returns a finished, high-quality copy-paste prompt. Stateless:
 * the client passes the conversation each call. Returns {type, content}.
 */

const FRIENDLY_ERROR =
  "うまくつくれませんでした。少し時間をおいて、もう一度ためしてみてください。";

const MAGIC_SYSTEM = `あなたは、初心者を助けるプロの「プロンプト・エンジニア」です。
ユーザーは、AI「Claude」を使って「何か」を作りたい初心者です（ウェブサイト、便利ツール、ミニゲームなど）。

あなたのゴール：ユーザーが Claude にそのまま貼り付けるだけで、すぐに見て触れる「1つの完結したHTMLファイル」が作れる、最高のプロンプト（呪文）を1つ完成させること。

進め方：
- まだ良いプロンプトを作るのに情報が足りないときは、やさしい日本語で、短い質問を1つだけする。
- 質問は、その答えがプロンプトを本当に良くするときだけ。だらだら聞かず、できるだけ早くまとめる（2〜3問で十分なことが多い）。
- 十分そろったら、完成したプロンプトを出す。プロンプトは日本語で、見た目・動き・内容が具体的に伝わるようにし、「1つのHTMLファイルで、そのまますぐ見られる形にして、完成したものを見せて」と必ず書く。

出力は必ず次のJSONだけ。前後に説明文をつけない：
{"type":"question","content":"次の質問（やさしい日本語、1つだけ）"}
または
{"type":"prompt","content":"完成したプロンプト（日本語、そのままコピーして使える形）"}`;

const COMPANION_SYSTEM = `あなたは、初心者を助けるプロの「プロンプト・エンジニア」です。
ユーザーは、自分専用のAI相棒（Claudeのプロジェクトに設定する「システムプロンプト」）を作りたい初心者です。

あなたのゴール：ユーザーにぴったりの、温かくて頼れる相棒の「システムプロンプト」を1つ完成させること。

進め方：
- 相棒に相談したいこと、好きな話し方（やさしい・元気・落ち着いた等）、その人自身のこと（得意・使える時間・目標など）を、やさしい日本語で短く1問ずつたずねる。
- だらだら聞かず、できるだけ早くまとめる。
- そろったら、完成したシステムプロンプトを出す。日本語で、相棒の性格・ルール・その人の情報が入った、そのまま貼って使える形にする。

出力は必ず次のJSONだけ。前後に説明文をつけない：
{"type":"question","content":"次の質問（やさしい日本語、1つだけ）"}
または
{"type":"prompt","content":"完成したシステムプロンプト（日本語、そのままコピーして使える形）"}`;

function parseResult(text: string): { type: "question" | "prompt"; content: string } {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  const obj = JSON.parse(t);
  if ((obj.type === "question" || obj.type === "prompt") && typeof obj.content === "string") {
    return obj;
  }
  throw new Error("unexpected shape");
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const mode = body?.mode === "companion" ? "companion" : "magic";
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (m: unknown): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        typeof (m as { content?: unknown }).content === "string" &&
        ((m as { role?: unknown }).role === "user" ||
          (m as { role?: unknown }).role === "assistant")
    )
    .map((m: { role: "user" | "assistant"; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

  const convo =
    messages.length > 0 && messages[0].role === "user"
      ? messages
      : [{ role: "user" as const, content: "手伝ってください。最初の質問をしてください。" }];

  const profile = await getDiscoveryProfileForUser(session.user.id);
  const system =
    (mode === "companion" ? COMPANION_SYSTEM : MAGIC_SYSTEM) +
    "\n\n" +
    formatProfileForPrompt(profile);

  try {
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system,
      messages: convo,
    });
    const text = res.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("no text content");
    return NextResponse.json(parseResult(text.text));
  } catch (error) {
    console.error("prompt-builder error:", error);
    return NextResponse.json({ error: FRIENDLY_ERROR }, { status: 500 });
  }
}

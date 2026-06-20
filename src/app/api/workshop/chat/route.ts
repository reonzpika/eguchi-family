import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";

/**
 * ピコ, the flexible conversational helper. Free chat: the member can ask
 * anything; ピコ first understands what they want, then helps however fits,
 * explain, web-search, point to resources, or interview them to craft a
 * ready-to-paste mega-prompt for a Claude project. Web search is enabled.
 * Stateless: the client passes the conversation each call.
 */

const FRIENDLY_ERROR = "うまくいきませんでした。少し時間をおいて、もう一度ためしてみてね。";

const PICO_CHAT_SYSTEM = `あなたは「ピコ」。江口家の「AIマスタークラス」アプリの、好奇心いっぱいで温かいAIバディです。

【ユーザーのこと】
- AI初心者の家族。このアプリで、AIの使い方を学びながら、自分の小さなビジネスを作ろうとしています。
- 重い作業（実際に作る・じっくり相談する）は、ユーザー自身の無料のClaude（claude.ai）でやります。このアプリは、道案内と記録の役。
- だから、あなたの役目は「わかりやすく導く」こと。最後に作るのは本人とClaude。

【あなたのやり方】
1. まず、ユーザーが何をしたいのかを理解する。はっきりしないときは、やさしい短い質問を1つだけして確かめる。
2. はっきりしたら、その人に合った方法で助ける。例えば：
   - わかりやすく説明する
   - ウェブで調べて、最新の情報や参考になるものを教える（あなたはweb検索ができます）
   - 役立つ記事やリソースを案内する
   - 質問して聞き出し、その人専用のClaudeプロジェクト用「メガプロンプト（システムプロンプト）」や、特定の作業用のプロンプトを作ってあげる
   （これらは例です。役立つことなら何でも、柔軟に。）
3. メガプロンプトやレシピを作ったら、そのままコピーして使えるように、はっきりと示す。そして「これをClaudeのプロジェクトに貼ってね」と伝える。

【話し方】
- やさしい、温かい、かんたんな日本語。初心者にもわかるように。
- 短めに。長い説明より、一歩ずつ。質問は一度に1つ。
- 子どもが使うこともあるので、安全で健全に。

ユーザーの状況（学びながらビジネスを作る）を、いつも意識して助けてください。`;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (m: unknown): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        typeof (m as { content?: unknown }).content === "string" &&
        ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant")
    )
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const mstream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          system: PICO_CHAT_SYSTEM,
          messages,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        });
        for await (const event of mstream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        console.error("pico chat error:", error);
        controller.enqueue(encoder.encode(FRIENDLY_ERROR));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

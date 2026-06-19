import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";
import {
  getDiscoveryProfileForUser,
  formatProfileForPrompt,
} from "@/lib/discovery-profile";

/**
 * AI prompt-engineer. Given the member's pick + answers, it either asks one more
 * short, friendly question (with tappable example suggestions) or returns a
 * finished, high-quality copy-paste prompt. Stateless: the client passes the
 * conversation each call. Returns {type, content, suggestions?}.
 */

const FRIENDLY_ERROR =
  "うまくつくれませんでした。少し時間をおいて、もう一度ためしてみてください。";

const MAGIC_SYSTEM = `あなたは、初心者を「わぁ！すごい！」と驚かせるプロのプロンプト・エンジニアです。
ユーザー（スマホを使う初心者の家族）は、AI「Claude」で「自分だけの作品」を作りたいと思っています。ゲームや、ウェブサイト・便利ツールです。

あなたのゴール：ユーザーが Claude にそのまま貼り付けるだけで、見た目が美しく、動きが楽しく、スマホで遊べる「1つの完結したHTMLファイル」が作れる、最高のプロンプト（呪文）を完成させること。

会話の進め方：
- 会話のはじめに、ユーザーが「作りたいもの」を伝えます（プリセット名のことも、「おまかせ」「自分で考える」のこともあります）。
- 質問は最大2つまで。短く、やさしい日本語で、1つずつ。
  - 質問1：ユーザー自身のアイデア（作品のテーマ・中身）。例：クイズなら「何についてのクイズ？」、育成ゲームなら「何を育てる？」、自己紹介ページなら「あなたのことを少し教えて」。本人のアイデアを必ず作品に入れるため、これは基本たずねる。
  - 質問2：雰囲気（かわいい／かっこいい／シンプル／カラフル など）。
- それ以上は聞かない。足りないところは、あなたが大胆に、創造的に補う。
- すでに分かっている情報は聞かない（「おまかせ」で興味が分かれば質問1は省略してよい）。

大切：初心者は短く答えがちです。質問のたびに、ユーザーが「こんなことも頼めるんだ！」と気づけるよう、タップできる具体例（suggestions）を3〜4個そえること。やさしく、楽しく、その作品に合った例にする。例：「5問にして」「猫の絵文字をいっぱい」「最後にお祝いのアニメ」「夜空みたいな背景」「キラキラ光らせて」。

十分そろったら、完成した「呪文」を出す。呪文は日本語で、Claudeへの指示として次を必ずすべて含めること：
1. 「ぜんぶ1つの完結したHTMLファイルだけで作って。そのまますぐ開いて見られる形にして、完成したものを見せて」
2. ユーザーのアイデア（テーマ・中身）と雰囲気を具体的に反映する
3. スマホ優先（モバイルファースト）で、指で気持ちよく操作できる
4. 見た目を本気で美しく：CSS変数で色をそろえ、主役の色＋差し色をはっきりさせ、平らな単色ではなくグラデーションや奥行きを使う
5. 動きで驚かせる：CSSアニメーションで、ページが開くときに要素が少しずつ順番に現れる演出を1つ、さらに操作したときの気持ちいい反応をつける
6. 文字も読みやすく、おしゃれに
7. 外部のAPIやデータは使わず、必要ならCDNのリンクだけにして、1ファイルで完結させる
8. 足りない部分はあなた（Claude）が大胆に創造して、ワクワクする作品に仕上げて

出力は必ず次のJSONだけ。前後に説明文をつけない：
質問のとき：{"type":"question","content":"次の質問（やさしい日本語、1つ）","suggestions":["例1","例2","例3"]}
完成したとき：{"type":"prompt","content":"完成した呪文（日本語、そのままコピーして使える形）"}`;

const COMPANION_SYSTEM = `あなたは、初心者を助けるプロの「プロンプト・エンジニア」です。
ユーザーは、自分専用のAI相棒（Claudeのプロジェクトに設定する「システムプロンプト」）を作りたい初心者です。

あなたのゴール：ユーザーにぴったりの、温かくて頼れる相棒の「システムプロンプト」を1つ完成させること。

進め方：
- 相棒に相談したいこと、好きな話し方（やさしい・元気・落ち着いた等）、その人自身のこと（得意・使える時間・目標など）を、やさしい日本語で短く1問ずつたずねる。
- だらだら聞かず、できるだけ早くまとめる（2〜3問で十分なことが多い）。
- 初心者は短く答えがちなので、質問のたびにタップできる具体例（suggestions）を3〜4個そえる。例：「やさしい話し方がいい」「毎朝はげまして」「料理の相談がしたい」。
- そろったら、完成したシステムプロンプトを出す。日本語で、相棒の性格・ルール・その人の情報が入った、そのまま貼って使える形にする。

出力は必ず次のJSONだけ。前後に説明文をつけない：
質問のとき：{"type":"question","content":"次の質問（やさしい日本語、1つ）","suggestions":["例1","例2","例3"]}
完成したとき：{"type":"prompt","content":"完成したシステムプロンプト（日本語、そのままコピーして使える形）"}`;

type Result = {
  type: "question" | "prompt";
  content: string;
  suggestions?: string[];
};

function parseResult(text: string): Result {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  const obj = JSON.parse(t);
  if ((obj.type === "question" || obj.type === "prompt") && typeof obj.content === "string") {
    const result: Result = { type: obj.type, content: obj.content };
    if (obj.type === "question" && Array.isArray(obj.suggestions)) {
      const cleaned = obj.suggestions
        .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
        .slice(0, 4);
      if (cleaned.length > 0) result.suggestions = cleaned;
    }
    return result;
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
      max_tokens: 2000,
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

/**
 * ピコ the companion: the high-level concierge persona, the app-context builder
 * (so ピコ knows what the member has done), and the running per-user memory
 * digest that is shared across all of their chats.
 *
 * Calibration (Ryo, 2026-06-20): ピコ is a CONCIERGE that reads where the user is
 * and routes them, it does not over-interview. Deep work lives in the app's
 * business journey or in the user's own Claude project, not in ピコ's chat.
 *
 * DRAFT CONTENT: the prompt wording is for Ryo to refine ([[eguchi-20260620-004]]).
 */
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStage } from "@/lib/workshop/recipes";
import { getDiscoveryProfileForUser, formatProfileForPrompt } from "@/lib/discovery-profile";

export const PICO_CHAT_SYSTEM = `あなたは「ピコ」。江口家の「AIマスタークラス」アプリの、好奇心いっぱいで温かいAIバディです。コンシェルジュのように、その人が「いまどこにいるか」を見て、次の一歩へ案内します。

【このアプリの仕組み（知っておくこと）】
- ユーザーはAI初心者の家族。AIを学びながら、自分の小さなビジネスを作ろうとしています。
- 重い・細かい作業（リサーチ、ブレスト、文章づくり、ものづくり）は、ユーザー自身の無料のClaude（claude.ai）の「プロジェクト」の中でやります。あなた（ピコ）はそこまで深入りせず、高いところから案内する役。
- アプリには「ビジネス」のジャーニーがあります。アイデアが固まった人が、ステップ（固める→たしかめる→作る→出す→育てる）で進む場所です。はじめるには「アイデア」タブを開いて「アイデアできた！」を押します。

【あなたのやること：その人を見て、案内する】
まず、相手が何を求めているか・どこにいるかを軽くつかむ。質問は短く1つずつ。でも「聞きすぎない」。2〜3問で方向が見えなければ、それ以上問い詰めず、下のどれかに案内する：

① アプリの使い方を知りたいだけ → やさしく説明する。
② 具体的な質問・調べもの → そのまま答える（必要ならweb検索）。
③ やりたいことが はっきりしている人：
   - まだアプリで「ビジネス」を始めていなければ → 「いいね！それなら『ビジネスのジャーニー』を始めよう」と案内する。「アイデア」タブを開いて「アイデアできた！」を押すと、アプリがステップごとに導いてくれる、と伝える。（ここで自分で細かいプロンプトは作らない。アプリのジャーニーに任せる。）
   - すでにビジネスがあれば → 「ビジネス」タブの今のステージで続けよう、と案内する。
④ まだ ぼんやりしている・迷っている人（「まだわからない」「なんとなく」「テックなこと」など）：
   - 質問を続けない。代わりに、Claudeに「ブレスト（アイデア出し）専用のプロジェクト」を作って、そこでじっくり広げることを提案する。「ここで聞き続けるより、Claudeにブレスト相棒を作って、じっくり考えてみよう」。
   - OKなら、必要なことだけ短く聞いて（好きなこと・得意なこと・状況など）、ブレスト用のプロジェクトを渡す：
     ・**プロジェクトのシステムプロンプト**（Claudeを「一緒にアイデアを広げ、調べてくれる相棒」に設定するもの）
     ・**最初のセッションのプロンプト**（オープンに探検・ブレストをはじめるもの）
⑤ すでにブレストなどのClaudeプロジェクトを作っている人（あなたの「記憶」からわかる）：
   - 新しく作らない。「前に作ったClaudeのブレストプロジェクトで続けられるよ」と伝え、その続きをはじめるための**セッション開始プロンプト**を、これまでの会話と記憶をふまえて作って渡す。
⑥ 行きづまっている → やさしく安心させて、④のブレストプロジェクトを入口として提案する。

【大事なルール】
- 深い作業（たくさんの質問・探検・ものづくり）は、Claudeか、アプリのビジネスジャーニーでやる。あなたのチャットの中ではやらない。あなたは高いレベルにいる。
- 「アプリを作るためのプロンプト」は書かない。あなたが渡すのは、Claudeプロジェクトの「システムプロンプト」と「最初のプロンプト」、または続きの「セッション開始プロンプト」だけ。
- コピーして使う文章は、必ず \`\`\` で囲んだコードブロックに入れる（ボタンでそのままコピーできるように）。

【知っていること】
下の「ユーザーについて」と「ピコの記憶」を読んで、その人のこれまで（アプリでの進み具合、作ったClaudeプロジェクト、話したこと）をふまえて話す。覚えているように。

【話し方】
やさしい、温かい、かんたんな日本語。初心者にもわかるように、短めに。質問は一度に1つ。子どもが使うこともあるので、安全で健全に。あなたはweb検索ができます。`;

type Business = { id: string; idea: string; current_stage: string; status: string };
type Summary = { business_id: string; stage: string; summary: string };

/** Gather the member's app data + memory into a compact context block. */
async function contextBlock(userId: string): Promise<string> {
  const admin = createAdminClient();

  const [{ data: bizData }, { data: memData }, profile] = await Promise.all([
    admin
      .from("businesses")
      .select("id, idea, current_stage, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin.from("pico_memory").select("content").eq("user_id", userId).maybeSingle(),
    getDiscoveryProfileForUser(userId),
  ]);

  const businesses = (bizData as Business[]) ?? [];
  let summaries: Summary[] = [];
  if (businesses.length > 0) {
    const { data: sumData } = await admin
      .from("stage_summaries")
      .select("business_id, stage, summary")
      .in("business_id", businesses.map((b) => b.id))
      .eq("verdict", "ready")
      .order("created_at", { ascending: true });
    summaries = (sumData as Summary[]) ?? [];
  }

  const interests = formatProfileForPrompt(profile);

  const lines: string[] = ["【このユーザーについて（アプリの記録）】"];
  if (interests && interests.trim()) lines.push(`- ${interests.trim()}`);

  if (businesses.length === 0) {
    lines.push("- まだアプリで「ビジネス」を始めていません。");
  } else {
    lines.push("- 取り組んでいるビジネス：");
    for (const b of businesses) {
      const stage = getStage(b.current_stage);
      const stageLabel = stage ? stage.label : b.current_stage;
      lines.push(`  ・「${b.idea}」（いま: ${stageLabel} / ${b.status}）`);
      const sums = summaries.filter((s) => s.business_id === b.id);
      for (const s of sums) {
        const st = getStage(s.stage);
        const lbl = st ? st.label : s.stage;
        const text = s.summary.length > 200 ? s.summary.slice(0, 200) + "…" : s.summary;
        lines.push(`    - ${lbl}: ${text}`);
      }
    }
  }

  const memory = (memData?.content ?? "").trim();
  lines.push("");
  lines.push("【ピコの記憶（これまでの会話から）】");
  lines.push(memory ? memory : "まだありません。");

  return lines.join("\n");
}

/** The full system prompt for a ピコ chat: persona + injected context. */
export async function buildPicoSystem(userId: string): Promise<string> {
  const ctx = await contextBlock(userId);
  return `${PICO_CHAT_SYSTEM}\n\n${ctx}`;
}

/** After an exchange, merge it into the user's running memory digest. */
export async function updatePicoMemory(userId: string, userMsg: string, assistantMsg: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("pico_memory").select("content").eq("user_id", userId).maybeSingle();
    const current = (data?.content ?? "").trim();

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system:
        "あなたは、あるユーザーについての「記憶メモ」を管理するアシスタントです。新しい会話のやりとりをふまえて、記憶メモを更新します。" +
        "記憶メモは、その人について長く役立つことの簡潔なまとめ：どんな人か、興味、得意なこと、話したアイデアやビジネス、決めたこと、好み、今やっていること。" +
        "とくに、その人が作った『Claudeプロジェクト』（ブレストなど、何についてのものか）と、アプリで進めている『ビジネスのジャーニー』とそのステージは、必ず記録する（あとで『続きはあのプロジェクトで』と案内できるように）。" +
        "ただ追記するのではなく、まとめ直して、みじかく保つ。日本語で、更新後の記憶メモ「本文だけ」を返す。",
      messages: [
        {
          role: "user",
          content: `今の記憶メモ：\n${current || "（まだなし）"}\n\n新しいやりとり：\nユーザー: ${userMsg}\nピコ: ${assistantMsg}\n\n更新後の記憶メモを返してください。`,
        },
      ],
    });
    const updated = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    if (!updated) return;

    await admin
      .from("pico_memory")
      .upsert({ user_id: userId, content: updated, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch (error) {
    // memory is best-effort; never break the chat over it
    console.error("pico memory update error:", error);
  }
}

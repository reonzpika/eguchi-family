/**
 * ピコ the companion: the rewritten high-level persona, the app-context builder
 * (so ピコ knows what the member has done), and the running per-user memory
 * digest that is shared across all of their chats.
 *
 * Calibration (Ryo, 2026-06-20): ピコ stays HIGH LEVEL. It does deep discovery,
 * then hands the member into their own Claude project (system prompt + first
 * ideation prompt) to do the detail; it never dumps a "build the app" prompt.
 */
import anthropic, { CLAUDE_MODEL } from "@/lib/anthropic";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStage } from "@/lib/workshop/recipes";
import { getDiscoveryProfileForUser, formatProfileForPrompt } from "@/lib/discovery-profile";

export const PICO_CHAT_SYSTEM = `あなたは「ピコ」。江口家の「AIマスタークラス」アプリの、好奇心いっぱいで温かいAIバディです。

【ユーザーのこと】
- AI初心者の家族。このアプリで、AIの使い方を学びながら、自分の小さなビジネスを作ろうとしています。
- 重い・細かい作業は、ユーザー自身の無料のClaude（claude.ai）の「プロジェクト」でやります。あなた（ピコ）の役目は、高いところから道案内すること。細かい作りこみはしない。

【あなたのやり方】
1. まず、ふかく理解する。良い方向づけに必要なことがわかるまで、やさしい短い質問を「1回につき1つだけ」続ける。質問の数は決めない。十分わかるまで急がない。
   - 高いレベルの全体像（何を・だれに・なぜ）に加えて、見た目・デザイン・雰囲気の好みや、本当に必要としていることも聞く。
2. ずっと「高いレベル」にいること。あなたは「アプリを作るためのプロンプト」を書かない。細かい作業はユーザーのClaudeプロジェクトの中でやってもらう。
3. 十分に理解できたら、専用のClaudeプロジェクトを用意するように導く。次の2つを、コピーできるコードブロック（\`\`\`で囲む）で渡す：
   - **プロジェクトのシステムプロンプト**（そのテーマ専用の相棒としてClaudeを設定するもの）
   - **最初のセッションのプロンプト**（プロジェクトで最初に話しはじめるためのもの）
4. その最初のプロンプトは、「作る」ことではなく、まず「調べる・集める・ブレインストーミング（アイデア出し）」から始まるようにする。いきなり作らない。まず世の中を調べ、考えを広げる。そう伝える。
5. コピーして使う文章は、必ず \`\`\` で囲んだコードブロックに入れる（ボタンでコピーできるように）。

【知っていること】
下の「ユーザーについて」と「ピコの記憶」を読んで、その人のこれまでをふまえて話す。前に話したことや、アプリでの進み具合を覚えているように。

【話し方】
- やさしい、温かい、かんたんな日本語。初心者にもわかるように。短めに。質問は一度に1つ。
- 子どもが使うこともあるので、安全で健全に。

あなたはweb検索ができます。最新の情報や参考が役立つときは調べてください。`;

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
    lines.push("- まだビジネスはありません。");
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
        "記憶メモは、その人について長く役立つことの簡潔なまとめ：どんな人か、興味、話したアイデアやビジネス、決めたこと、好み、今やっていること。" +
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

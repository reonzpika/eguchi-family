/**
 * Just-in-time learning for the workshop model. Teaching is REWRITTEN for the
 * workshop context (Ryo's call, 2026-06-20), short and at the point of need,
 * not a lessons course. The verified article URLs are reused from the old
 * curriculum as "もっと詳しく" links.
 *
 * DRAFT CONTENT: wording is a functional first draft for Ryo to refine.
 */
import { ARTICLES, type Article } from "@/lib/curriculum/lessons";

export type HelpTrigger = "account" | "project" | "prompt" | "doubt" | "privacy";

export interface HelpEntry {
  key: string;
  title: string;
  /** Short, workshop-context teaching (a few sentences). */
  body: string;
  article?: Article;
  /** If set, this card pops inline at that point of need (and is in the library). */
  trigger?: HelpTrigger;
}

export const HELP: HelpEntry[] = [
  {
    key: "claude-account",
    title: "Claudeを用意しよう",
    body: "これから使うAI「Claude（クロード）」は、あなたの“考える相棒”。無料のアカウントで、メールアドレスがあれば5分ではじめられます。まずはこれ一つでぜんぶ練習できます。",
    article: ARTICLES.canva,
    trigger: "account",
  },
  {
    key: "claude-project",
    title: "Claudeプロジェクトって？",
    body: "レシピは「プロジェクト」に貼って使います。プロジェクトは、目標やあなたのことを覚えておける“専用の部屋”。一度作れば、その中ではいつもあなたの文脈で答えてくれます。",
    article: ARTICLES.globalAxis,
    trigger: "project",
  },
  {
    key: "prompt-basics",
    title: "上手にお願いするコツ",
    body: "AIはあなたの事情を知りません。「だれが・何のために」を最初に伝えると、答えがぐっと良くなります。「あなたは○○の先輩です」と役割を渡すのも効果的。一回で完璧じゃなくていい、何度も直してOKです。",
    article: ARTICLES.fujifilm,
    trigger: "prompt",
  },
  {
    key: "doubt",
    title: "うのみにしない",
    body: "AIはやさしすぎて、なんでも「いいですね！」と賛成しがち。便利な一言が「それ、99%自信ある？反対の意見も教えて」。こう聞くと、弱点やリスクも正直に出してくれます。",
    article: ARTICLES.kddi,
    trigger: "doubt",
  },
  {
    key: "privacy",
    title: "個人情報を入れない",
    body: "大事な約束。お客さんの名前、お金や口座、健康のことなど、大事な個人情報はAIに入れないでください。一度入れた情報は取り消せないと考えるのが安全です。迷ったら、入れない。",
    article: ARTICLES.aiReboot,
    trigger: "privacy",
  },
  // library-only (no inline trigger)
  {
    key: "ai-types",
    title: "AIの3つの種類",
    body: "AIは大きく3つ。「考える相棒」（Claude…文章で相談）、「作るツール」（絵・動画・サイトを作る）、「やってくれるAI（エージェント）」（作業を手順で進める）。この地図があれば、新しいAIも整理できます。",
    article: ARTICLES.smartat,
  },
  {
    key: "commander",
    title: "あなたが司令塔",
    body: "あなたは「司令塔」、AIは優秀なスタッフ。たくさん使っていいし、相談もたくさんしていい。でも、最後に決めるのはいつも自分。AIの言いなりにはなりません。",
    article: ARTICLES.markeMedia,
  },
  {
    key: "research",
    title: "調べてから答えてもらう",
    body: "AIの知識は少し古いことがあります。「最新情報を調べてから答えて」と添えると、新しい情報をふまえた答えになります。値段や最新の道具など、変わりやすいことはとくに。",
    article: ARTICLES.smartat,
  },
  {
    key: "make-tools",
    title: "作るツールに移る",
    body: "考えるのはチャット（Claude）。でも実物を作るときは「作るツール」に移ります。「これを形にするには、どのツールがいい？」とClaudeに聞けば、次の道具を教えてくれます。",
    article: ARTICLES.startLink,
  },
];

export function getHelp(key: string): HelpEntry | undefined {
  return HELP.find((h) => h.key === key);
}

/** The inline card for a given trigger point. */
export function helpForTrigger(trigger: HelpTrigger): HelpEntry | undefined {
  return HELP.find((h) => h.trigger === trigger);
}

/**
 * Prompt-builder: the app asks a few playful questions and assembles a
 * ready-to-paste prompt. Used by the magic hook (lesson 1-2) and the
 * companion setup (lesson 3-2).
 */

export interface BuilderQuestion {
  id: string;
  prompt: string;
  /** Choice chips. If absent, a free-text field is shown. */
  options?: string[];
  placeholder?: string;
}

export interface PromptTemplate {
  id: string;
  emoji: string;
  label: string;
  description: string;
  questions: BuilderQuestion[];
  /** Template with {id} placeholders filled from answers. */
  template: string;
}

/** Magic hook: pick one, answer the questions, get a website prompt. */
export const MAGIC_TEMPLATES: PromptTemplate[] = [
  {
    id: "page",
    emoji: "🌸",
    label: "好きなものページ",
    description: "好きなものについての、動く1ページサイト",
    questions: [
      { id: "theme", prompt: "何についてのページにする？", placeholder: "例：愛犬のポチ、お菓子、好きな場所" },
      { id: "mood", prompt: "どんな雰囲気がいい？", options: ["かわいい", "かっこいい", "たのしい"] },
      { id: "motion", prompt: "動きをつける？", options: ["ふわふわ", "キラキラ", "うごかない"] },
    ],
    template:
      "あなたはプロのウェブデザイナーです。スマートフォンで見られる、1ページの楽しいウェブサイトを作ってください。\nテーマ：「{theme}」。雰囲気：「{mood}」。動き：「{motion}」した軽いアニメーションをつけてください。\n1つのHTMLファイルで、そのまますぐ見られる形にしてください。むずかしい説明はいりません。完成したものを見せてください。",
  },
  {
    id: "tool",
    emoji: "🛠️",
    label: "便利ツール",
    description: "毎日に役立つ、かんたんなツール",
    questions: [
      { id: "what", prompt: "どんなことに使うツール？", placeholder: "例：お菓子作りのタイマー、買い物リスト、貯金の計算" },
      { id: "who", prompt: "だれが使う？", placeholder: "例：自分、子ども、お客さん" },
    ],
    template:
      "あなたはプロのアプリ開発者です。スマートフォンで使える、シンプルで便利なツールを作ってください。\n用途：「{what}」。使う人：「{who}」。\nボタンや入力など、実際に動く形にしてください。1つのHTMLファイルで、そのまますぐ使える形にしてください。完成したものを見せてください。",
  },
  {
    id: "game",
    emoji: "🎮",
    label: "ミニゲーム",
    description: "スマホで遊べる、かんたんなゲーム",
    questions: [
      { id: "theme", prompt: "どんなテーマのゲーム？", placeholder: "例：ねこ、お菓子、宇宙" },
      { id: "type", prompt: "どんな遊び？", options: ["タップして集める", "よけて進む", "クイズ"] },
    ],
    template:
      "あなたはプロのゲームクリエイターです。スマートフォンで遊べる、かんたんで楽しいミニゲームを作ってください。\nテーマ：「{theme}」。遊び方：「{type}」。\nタップで遊べる形で、見た目もかわいくしてください。1つのHTMLファイルで、そのまますぐ遊べる形にしてください。完成したものを見せてください。",
  },
];

/** Companion setup: build a personalised 相棒 system prompt. */
export const COMPANION_BUILDER: PromptTemplate = {
  id: "companion",
  emoji: "🤖",
  label: "相棒づくり",
  description: "あなた専用の相棒の性格を決めます",
  questions: [
    { id: "topic", prompt: "相棒に、どんなことを相談したい？", placeholder: "例：お菓子の副業、子育て、家計、文章づくり" },
    { id: "tone", prompt: "どんな話し方がいい？", options: ["やさしく", "元気に", "おちついて"] },
  ],
  template:
    "あなたは私専用のAI相棒です。「{topic}」について、いっしょに考えてくれる頼れる味方です。\n\n【あなたの態度】\n- {tone}、丁寧な日本語で。一度に1つだけ質問する\n- まず「良いところ」を必ず伝える。否定しない\n- 専門用語は一言で説明する\n\n【大事なルール】\n- 調べてほしいと言われたら、まず調べてから答える\n- 私がうのみにしないように、ときどき反対意見やリスクも教えてほしい\n\n【私のこと】（自分のことを書きます）\n- 得意なこと：＿＿＿\n- 使える時間：＿＿＿\n- やりたいこと：＿＿＿\n\n最初のひとこと：「どんなことでも大丈夫ですよ。今考えていること、思いつくまま教えてください。」",
};

/** Fill {id} placeholders; blanks become ＿＿. */
export function buildPrompt(template: PromptTemplate, answers: Record<string, string>): string {
  return template.template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = answers[key];
    return v && v.trim() ? v.trim() : "＿＿";
  });
}

export function getMagicTemplate(id: string): PromptTemplate | undefined {
  return MAGIC_TEMPLATES.find((t) => t.id === id);
}

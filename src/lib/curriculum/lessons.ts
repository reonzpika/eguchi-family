/**
 * AI-fluency curriculum content (the "learning journey").
 * Single source of truth for lessons, layers, articles, and the ported
 * "相棒" (assistant) system prompt members paste into their own Claude Project.
 *
 * Lessons are static content; per-member progress lives in the `lesson_progress`
 * table. Tasks use a {topic} token replaced with each member's goal noun
 * (from their discovery profile); default is あなたのアイデア.
 *
 * Source: areas/other-projects/working/eguchi-family/ai-fluency-curriculum.md
 */

export interface Article {
  label: string;
  url: string;
}

export const ARTICLES: Record<string, Article> = {
  smartat: { label: "生成AIの種類（7タイプ）", url: "https://smartat.jp/blog/7639/" },
  markeMedia: { label: "AIができること・できないこと", url: "https://www.marke-media.net/whitepaper/ai-005/" },
  fujifilm: { label: "AIプロンプトの書き方・コツ", url: "https://www.fujifilm.com/fb/ja/solutions/columns/ai-14831" },
  globalAxis: { label: "Claude Projectsの使い方", url: "https://global-axis.jp/blog/use_claude_projects/" },
  canva: { label: "Claudeの使い方", url: "https://www.canva.com/ja_jp/learn/how-to-use-claude/" },
  startLink: { label: "ノーコードAIアプリ開発ガイド", url: "https://start-link.jp/hubspot-ai/ai/ai-driven-dev/no-code-ai-app-development" },
  kddi: { label: "ハルシネーションとは？", url: "https://biz.kddi.com/content/column/smb/avoiding-hallucinations/" },
  aiReboot: { label: "生成AIに個人情報を入れても大丈夫？", url: "https://ai-reboot.io/academy/blog/ai-privacy-safety-guide" },
};

export interface Layer {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  /** Optional note shown under the chapter (e.g. ※後からでOK). */
  note?: string;
}

export const LAYERS: Layer[] = [
  { id: "landscape", number: 0, title: "どんなAIがあるか", subtitle: "地図を知る", emoji: "🗺️" },
  { id: "delegation", number: 1, title: "司令塔になる", subtitle: "任せる・自分で決める", emoji: "🎯" },
  { id: "prompt", number: 2, title: "上手な聞き方", subtitle: "プロンプト", emoji: "💬" },
  { id: "project", number: 3, title: "自分専用アシスタント", subtitle: "プロジェクト", emoji: "🤖" },
  { id: "execution", number: 4, title: "形にする", subtitle: "実行・ハーネス", emoji: "🛠️", note: "※後からでOK" },
  { id: "habits", number: 5, title: "4つの習慣", subtitle: "ずっと使える", emoji: "🌱" },
];

export interface Lesson {
  id: string;
  layerId: string;
  title: string;
  /** Plain-language concept, 1-2 short lines. */
  concept: string;
  /** The real task to do in Claude. May contain {topic}. */
  task: string;
  /** Optional copy-paste block (e.g. the system prompt). */
  copyPrompt?: string;
  /** Done-check: how they know they finished. */
  done: string;
  article?: Article;
  /** Advanced lessons are shown but flagged. */
  advanced?: boolean;
  /** Locked teaser (not yet a real lesson). */
  locked?: boolean;
}

/**
 * The "相棒" system prompt. Ported from the app's idea-chat coach
 * (src/lib/idea-chat-prompts.ts), stripped of app-only plumbing, with an
 * "about you" block the member fills in (lesson 3.3).
 */
export const COMPANION_SYSTEM_PROMPT = `あなたは私専用のAIビジネス相棒です。私のアイデアを、楽しく現実的に育てる温かいサポート役です。

【あなたの態度】
- 温かく丁寧な日本語。一度に1つだけ質問する
- まず「良いところ」を必ず伝える。否定しない
- 専門用語は一言で説明する
- 「これがいい？」ではなく「どんな風に？」と、開かれた質問をする
- 私が短い返事のときは、やさしい言葉で合わせる

【大事なルール】
- 調べてほしいと言われたら、まず調べてから答える
- はっきりしないことは「仮説として」「可能性として」と正直に言う。自信がないときは「私の知識では〜（最新と違うかもしれません）」と添える
- 私がうのみにしないように、ときどき反対意見やリスクも教えてほしい

【私のこと】（自分のことを書きます）
- 得意なこと：＿＿＿＿
- 使える時間：＿＿＿＿
- やりたいこと・目標：＿＿＿＿

最初のひとこと：「どんなことでも大丈夫ですよ。今考えていること、思いつくまま教えてください。」`;

export const LESSONS: Lesson[] = [
  // Layer 0 — Landscape
  {
    id: "0-1",
    layerId: "landscape",
    title: "3つのAIを知る",
    concept: "AIは大きく3種類。「考える相棒（チャット）」「作るツール（絵・動画・音楽など）」「やってくれるエージェント」。",
    task: "Claudeに「AIツールの種類を、初心者向けに3つに分けて教えて」と聞いてみる。",
    done: "3つの種類を、自分の言葉で言える。",
    article: ARTICLES.smartat,
  },
  {
    id: "0-2",
    layerId: "landscape",
    title: "今いちばん良いツールの聞き方",
    concept: "ツールは毎月のように変わる。名前を覚えるより、AIに「今いちばん良いのは？」と聞けばいい。",
    task: "Claudeに「{topic}に役立つ、今いちばん良い無料ツールは？」と聞いてみる。",
    done: "試してみたいツールが1つ見つかる。",
    article: ARTICLES.smartat,
  },
  // Layer 1 — Delegation
  {
    id: "1-1",
    layerId: "delegation",
    title: "司令塔の考え方",
    concept: "あなたは司令塔。AIは優秀なスタッフ。たくさん働かせて、最後に決めるのは自分。言いなりにならない。",
    task: "今の悩みを1つClaudeに相談し、出てきた答えを「採用する／しない」を自分で決める。",
    done: "AIの提案を、自分で1つ判断できた。",
    article: ARTICLES.markeMedia,
  },
  {
    id: "1-2",
    layerId: "delegation",
    title: "AIの得意・苦手",
    concept: "得意は、案出し・要約・整理。苦手は、本当の気持ち・人との信頼・最後の決断・責任。",
    task: "Claudeに「{topic}で、AIに任せられること・自分でやるべきことを分けて」と聞く。",
    done: "任せること／自分でやることの線引きが見えた。",
    article: ARTICLES.markeMedia,
  },
  // Layer 2 — Prompt
  {
    id: "2-1",
    layerId: "prompt",
    title: "背景を伝える",
    concept: "だれが・何のために、を最初に書くと答えが良くなる。",
    task: "同じ質問を「背景なし」と「背景あり」で1回ずつ聞き、答えを比べる。",
    done: "背景を伝えると変わる、と体感した。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-2",
    layerId: "prompt",
    title: "今の段階を伝える",
    concept: "「今はアイデア出しの段階」「もう計画したい」と段階を言うと、AIが先走らない。",
    task: "「今はまだアイデア出しの段階です」と前置きしてから、Claudeに相談する。",
    done: "AIが、まだ早い提案をせず付き合ってくれた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-3",
    layerId: "prompt",
    title: "答える前に調べて",
    concept: "「調べてから答えて」と頼むと、新しい情報をふまえた答えになる。",
    task: "Claudeに「最新情報を調べてから答えて」と添えて質問する。",
    done: "調べた上での答えをもらえた。",
    article: ARTICLES.smartat,
  },
  {
    id: "2-4",
    layerId: "prompt",
    title: "うのみにしない",
    concept: "AIはあなたに賛成しがち。便利な一言「99%自信ある？」で、わざと反論させる。",
    task: "AIの提案に「それ、99%自信ある？反対の意見は？」と返してみる。",
    done: "AIが弱点や前提を出してくれた。",
    article: ARTICLES.kddi,
  },
  {
    id: "2-5",
    layerId: "prompt",
    title: "例・条件・役割を与える",
    concept: "例を見せる／条件をつける／役割を与えると、ねらい通りになる。",
    task: "Claudeに「あなたは{topic}の先輩です。○○を箇条書きで5つ」と頼む。",
    done: "ほしかった形で返ってきた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-6",
    layerId: "prompt",
    title: "ワークフローまとめ",
    concept: "1つの長い指示で、発想→比較→検討→決定→成果物まで一気に進める。",
    task: "Claudeに「{topic}について、アイデア出し→比較→おすすめ→次の一歩、まで一気に手伝って」と頼む。",
    done: "計画のたたき台ができた。",
    article: ARTICLES.fujifilm,
    advanced: true,
  },
  // Layer 3 — Project
  {
    id: "3-1",
    layerId: "project",
    title: "なぜプロジェクトを作る",
    concept: "「プロジェクト」に目標と人柄を覚えさせると、毎回ゼロから説明しなくてよくなる。",
    task: "Claudeで新しいプロジェクトを作る（名前は「{topic}」）。",
    done: "プロジェクトができた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-2",
    layerId: "project",
    title: "システムプロンプトを貼る",
    concept: "プロジェクトに「人柄・ルール」を覚えさせる。下の文をそのままコピーして貼るだけ。",
    task: "下の「相棒プロンプト」をコピーし、プロジェクトの指示（カスタム指示）に貼り付ける。",
    copyPrompt: COMPANION_SYSTEM_PROMPT,
    done: "新しいチャットで、相棒がやさしく話しかけてくれた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-3",
    layerId: "project",
    title: "自己紹介を入れる",
    concept: "自分のことを渡すと、相棒があなたに合わせて答えてくれる。",
    task: "相棒プロンプトの「私のこと」（得意・使える時間・目標）を、自分のことで埋める。",
    done: "相棒が、自分の文脈で答えてくれた。",
    article: ARTICLES.canva,
  },
  {
    id: "3-4",
    layerId: "project",
    title: "成果物を保存する",
    concept: "良い答えは、あとで見返せるように保存しておく。",
    task: "気に入った答えを1つ、プロジェクトの中に保存する（またはメモする）。",
    done: "見返せる場所に1つ保存できた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-5",
    layerId: "project",
    title: "メモリ（知識ベース）",
    concept: "システムプロンプトの次の一歩。資料やメモを覚えさせる「記憶の層」。慣れてきたら挑戦。",
    task: "（上級・準備中）プロジェクトに資料を渡して、参照しながら答えてもらう。",
    done: "",
    article: ARTICLES.globalAxis,
    advanced: true,
    locked: true,
  },
  // Layer 4 — Execution / Harness
  {
    id: "4-1",
    layerId: "execution",
    title: "チャットで止まらない",
    concept: "考えるAI（チャット）から、作るツールへ。チャットの中だけで止まらない。",
    task: "Claudeに「{topic}を実際に形にするには、どのツールを使えばいい？」と聞く。",
    done: "次に使うツールが分かった。",
    article: ARTICLES.startLink,
  },
  {
    id: "4-2",
    layerId: "execution",
    title: "ハーネス（組み合わせ）",
    concept: "頭脳（AI）＋手（ツール）＋手順＝ハーネス。道具が新しくなったら入れ替える。",
    task: "Claudeに「{topic}の目標まで、ツールの組み合わせ（手順）を提案して」と頼む。",
    done: "手順の地図ができた。",
    article: ARTICLES.startLink,
  },
  // Layer 5 — Habits
  {
    id: "h-1",
    layerId: "habits",
    title: "何度も直す",
    concept: "最初の答えは下書き。会話であって、自動販売機ではない。",
    task: "AIの答えに「もっと具体的に」と、1回だけ直してもらう。",
    done: "直すと良くなる、と分かった。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "h-2",
    layerId: "habits",
    title: "先に計画する",
    concept: "いきなり作らせない。作る前に8割考える。",
    task: "Claudeに「まず計画を出して。私が見てから進めて」と頼む。",
    done: "作る前に、計画を見られた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "h-3",
    layerId: "habits",
    title: "個人情報を入れない",
    concept: "お客さん・お金・健康などの情報は、AIに貼らない。",
    task: "Claudeに「AIに入れてはいけない情報は？」と聞いて、確認する。",
    done: "入れてはいけない情報が分かった。",
    article: ARTICLES.aiReboot,
  },
];

/** Fill {topic} with the member's goal noun. */
export function fillTopic(text: string, topic: string | null): string {
  return text.replaceAll("{topic}", topic && topic.trim() ? topic : "あなたのアイデア");
}

export const ACTIVE_LESSON_COUNT = LESSONS.filter((l) => !l.locked).length;

export function lessonsByLayer(layerId: string): Lesson[] {
  return LESSONS.filter((l) => l.layerId === layerId);
}

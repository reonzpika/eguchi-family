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
  canva: { label: "Claudeの始め方・使い方", url: "https://www.canva.com/ja_jp/learn/how-to-use-claude/" },
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
  note?: string;
}

export const LAYERS: Layer[] = [
  { id: "start", number: 0, title: "Claudeをはじめる", subtitle: "まずはここから", emoji: "🚀" },
  { id: "landscape", number: 1, title: "どんなAIがあるか", subtitle: "地図を知る", emoji: "🗺️" },
  { id: "delegation", number: 2, title: "司令塔になる", subtitle: "任せる・自分で決める", emoji: "🎯" },
  { id: "prompt", number: 3, title: "上手な聞き方", subtitle: "プロンプト", emoji: "💬" },
  { id: "project", number: 4, title: "自分専用アシスタント", subtitle: "プロジェクト", emoji: "🤖" },
  { id: "execution", number: 5, title: "形にする", subtitle: "実行・ハーネス", emoji: "🛠️", note: "※後からでOK" },
  { id: "habits", number: 6, title: "4つの習慣", subtitle: "ずっと使える", emoji: "🌱" },
];

export interface Lesson {
  id: string;
  layerId: string;
  title: string;
  /** One-line lead. */
  concept: string;
  /** 2-4 short highlights summarising the topic. */
  highlights: string[];
  /** The real task to do in Claude. May contain {topic}. */
  task: string;
  /** Optional copy-paste block (e.g. the system prompt). */
  copyPrompt?: string;
  /** Done-check: how they know they finished. */
  done: string;
  article?: Article;
  advanced?: boolean;
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
  // Start — set up Claude
  {
    id: "s-1",
    layerId: "start",
    title: "Claudeをはじめる",
    concept: "まずは、いちばん使う「考える相棒」Claudeを用意します。無料でOK。",
    highlights: [
      "Claudeは、文章で相談できるAI。最初に覚えるならこれ。",
      "無料アカウントで、これからの練習はぜんぶできます。",
      "メールアドレスがあれば、5分ではじめられます。",
    ],
    task: "下の記事を見ながら、Claudeの無料アカウントを作ってログインする。",
    done: "Claudeにログインできた。",
    article: ARTICLES.canva,
  },
  // Layer 0 — Landscape
  {
    id: "0-1",
    layerId: "landscape",
    title: "3つのAIを知る",
    concept: "AIは大きく3種類。地図を持つと迷わない。",
    highlights: [
      "考える相棒（チャット）：相談・調べもの・整理に。Claude・ChatGPTなど。",
      "作るツール：絵・動画・音楽・サイトを作る専門AI。",
      "やってくれるAI（エージェント）：手順のある作業を自分で進める。いま伸びている。",
    ],
    task: "Claudeに「AIツールの種類を、初心者向けに3つに分けて教えて」と聞いてみる。",
    done: "3つの種類を、自分の言葉で言える。",
    article: ARTICLES.smartat,
  },
  {
    id: "0-2",
    layerId: "landscape",
    title: "今いちばん良いツールの聞き方",
    concept: "ツールは毎月変わる。覚えるより、聞けばいい。",
    highlights: [
      "新しいツールが、毎月のように増えたり消えたりする。",
      "名前を全部覚えなくていい。AIに「今いちばん良いのは？」と聞く。",
      "大事なのは「自分が何をしたいか」をはっきりさせること。",
    ],
    task: "Claudeに「{topic}に役立つ、今いちばん良い無料ツールは？」と聞いてみる。",
    done: "試してみたいツールが1つ見つかる。",
    article: ARTICLES.smartat,
  },
  // Layer 1 — Delegation
  {
    id: "1-1",
    layerId: "delegation",
    title: "司令塔の考え方",
    concept: "あなたは司令塔。AIはスタッフ。決めるのは自分。",
    highlights: [
      "AIはどんどん働かせてOK。たくさん相談していい。",
      "でも、最後に決めるのは自分。AIの言いなりにならない。",
      "全体を高いところから見る。これが一番のコツ。",
    ],
    task: "今の悩みを1つClaudeに相談し、出てきた答えを「採用する／しない」を自分で決める。",
    done: "AIの提案を、自分で1つ判断できた。",
    article: ARTICLES.markeMedia,
  },
  {
    id: "1-2",
    layerId: "delegation",
    title: "AIの得意・苦手",
    concept: "任せること・自分でやることを分ける。",
    highlights: [
      "得意：たたき台づくり、要約、整理、たくさんの案出し。",
      "苦手：あなたの本当の気持ち、人との信頼、最後の決断、責任。",
      "「これはAIに頼む？自分でやる？」と毎回考える。",
    ],
    task: "Claudeに「{topic}で、AIに任せられること・自分でやるべきことを分けて」と聞く。",
    done: "任せること／自分でやることの線引きが見えた。",
    article: ARTICLES.markeMedia,
  },
  // Layer 2 — Prompt
  {
    id: "2-1",
    layerId: "prompt",
    title: "背景を伝える",
    concept: "事情を伝えると、答えがぐっと良くなる。",
    highlights: [
      "AIは、あなたの事情を知らない。",
      "「だれが・何のために」を最初に伝える。",
      "例：「お菓子の副業を考えています」の一言で変わる。",
    ],
    task: "同じ質問を「背景なし」と「背景あり」で1回ずつ聞き、答えを比べる。",
    done: "背景を伝えると変わる、と体感した。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-2",
    layerId: "prompt",
    title: "今の段階を伝える",
    concept: "段階を言うと、AIが先走らない。",
    highlights: [
      "「今はアイデア出し」「もう計画したい」と段階を伝える。",
      "すると、今ほしいことに集中してくれる。",
      "まだ早い提案で、混乱しなくなる。",
    ],
    task: "「今はまだアイデア出しの段階です」と前置きしてから、Claudeに相談する。",
    done: "AIが、まだ早い提案をせず付き合ってくれた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-3",
    layerId: "prompt",
    title: "答える前に調べて",
    concept: "「調べてから答えて」で、新しい情報に。",
    highlights: [
      "AIの知識は、古いことがある。",
      "「調べてから答えて」と頼むと、最新をふまえてくれる。",
      "値段・最新ツール・お店などは、特に調べてもらう。",
    ],
    task: "Claudeに「最新情報を調べてから答えて」と添えて質問する。",
    done: "調べた上での答えをもらえた。",
    article: ARTICLES.smartat,
  },
  {
    id: "2-4",
    layerId: "prompt",
    title: "うのみにしない",
    concept: "AIは賛成しがち。わざと反論させる。",
    highlights: [
      "AIはあなたにやさしく、賛成しがち。",
      "便利な一言：「99%自信ある？」「反対意見は？」",
      "これで、見落としやリスクが見えてくる。",
    ],
    task: "AIの提案に「それ、99%自信ある？反対の意見は？」と返してみる。",
    done: "AIが弱点や前提を出してくれた。",
    article: ARTICLES.kddi,
  },
  {
    id: "2-5",
    layerId: "prompt",
    title: "例・条件・役割を与える",
    concept: "例・条件・役割で、ねらい通りに。",
    highlights: [
      "例を見せる：「こんな感じで」とサンプルを渡す。",
      "条件をつける：「5つ」「やさしい言葉で」など。",
      "役割を与える：「あなたは○○の先輩です」が特に効く。",
    ],
    task: "Claudeに「あなたは{topic}の先輩です。○○を箇条書きで5つ」と頼む。",
    done: "ほしかった形で返ってきた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "2-6",
    layerId: "prompt",
    title: "ワークフローまとめ",
    concept: "1つの指示で、最後まで一気に。",
    highlights: [
      "慣れたら、長い指示でまとめてお願いできる。",
      "発想→比較→検討→決定→成果物まで、一気に進む。",
      "上級。最初は無理しなくてOK。",
    ],
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
    concept: "毎回の自己紹介を、いらなくする。",
    highlights: [
      "毎回ゼロから事情を説明するのは大変。",
      "「プロジェクト」に目標と人柄を覚えさせる。",
      "すると、いつもその文脈で答えてくれる。",
    ],
    task: "Claudeで新しいプロジェクトを作る（名前は「{topic}」）。",
    done: "プロジェクトができた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-2",
    layerId: "project",
    title: "システムプロンプトを貼る",
    concept: "コピペで、自分専用の相棒に。",
    highlights: [
      "システムプロンプト＝AIの人柄とルールの設定。",
      "下の文をコピーして貼るだけ。むずかしくない。",
      "これで、やさしく付き合ってくれる相棒になる。",
    ],
    task: "下の「相棒プロンプト」をコピーし、プロジェクトの指示（カスタム指示）に貼り付ける。",
    copyPrompt: COMPANION_SYSTEM_PROMPT,
    done: "新しいチャットで、相棒がやさしく話しかけてくれた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-3",
    layerId: "project",
    title: "自己紹介を入れる",
    concept: "自分のことを渡すと、合わせてくれる。",
    highlights: [
      "相棒プロンプトの「私のこと」を自分のことで埋める。",
      "得意・使える時間・目標を書く。",
      "すると、あなたに合った提案になる。",
    ],
    task: "相棒プロンプトの「私のこと」（得意・使える時間・目標）を、自分のことで埋める。",
    done: "相棒が、自分の文脈で答えてくれた。",
    article: ARTICLES.canva,
  },
  {
    id: "3-4",
    layerId: "project",
    title: "成果物を保存する",
    concept: "良い答えは、あとで見返せるように。",
    highlights: [
      "気に入った答えは、消えないように保存する。",
      "プロジェクトの中に置いておくと探しやすい。",
      "あとで続きから進められる。",
    ],
    task: "気に入った答えを1つ、プロジェクトの中に保存する（またはメモする）。",
    done: "見返せる場所に1つ保存できた。",
    article: ARTICLES.globalAxis,
  },
  {
    id: "3-5",
    layerId: "project",
    title: "メモリ（知識ベース）",
    concept: "次の一歩。資料を覚えさせる「記憶の層」。",
    highlights: [
      "システムプロンプトの、さらに次のステップ。",
      "資料やメモを渡して、参照しながら答えてもらう。",
      "上級。慣れてきたら挑戦。",
    ],
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
    concept: "考えるのはチャット、作るのは専門ツール。",
    highlights: [
      "チャットの中だけで止まらない。",
      "実物を作るときは、専門ツールに移る。",
      "「どのツール？」とAIに聞いて、次へ進む。",
    ],
    task: "Claudeに「{topic}を実際に形にするには、どのツールを使えばいい？」と聞く。",
    done: "次に使うツールが分かった。",
    article: ARTICLES.startLink,
  },
  {
    id: "4-2",
    layerId: "execution",
    title: "ハーネス（組み合わせ）",
    concept: "頭脳＋手＋手順＝ハーネス。",
    highlights: [
      "頭脳（AI）＋手（ツール）＋手順を組み合わせる。",
      "道具が新しくなったら、入れ替える。",
      "組み合わせの上手さが、うまくいくカギ。",
    ],
    task: "Claudeに「{topic}の目標まで、ツールの組み合わせ（手順）を提案して」と頼む。",
    done: "手順の地図ができた。",
    article: ARTICLES.startLink,
  },
  // Layer 5 — Habits
  {
    id: "h-1",
    layerId: "habits",
    title: "何度も直す",
    concept: "最初の答えは下書き。",
    highlights: [
      "AIの最初の答えは、下書きと考える。",
      "「もっと具体的に」と直していく。",
      "会話であって、自動販売機ではない。",
    ],
    task: "AIの答えに「もっと具体的に」と、1回だけ直してもらう。",
    done: "直すと良くなる、と分かった。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "h-2",
    layerId: "habits",
    title: "先に計画する",
    concept: "作る前に、8割考える。",
    highlights: [
      "いきなり作らせない。",
      "「まず計画を出して。私が見てから進めて」と頼む。",
      "計画を見てから進めると、やり直しが減る。",
    ],
    task: "Claudeに「まず計画を出して。私が見てから進めて」と頼む。",
    done: "作る前に、計画を見られた。",
    article: ARTICLES.fujifilm,
  },
  {
    id: "h-3",
    layerId: "habits",
    title: "個人情報を入れない",
    concept: "入れてはいけない情報を知る。",
    highlights: [
      "お客さん・お金・健康などの情報は、AIに入れない。",
      "一度入れた情報は、取り消せないと考える。",
      "迷ったら、入れない。",
    ],
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

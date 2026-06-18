/**
 * Eguchi Family AI Masterclass — curriculum content (v2, the "learning journey").
 * Built to areas/other-projects/working/eguchi-family/vision.md + content-spec.md.
 *
 * 4 chapters, 16 lessons. Practice points outward to real Claude; this is static
 * content. Per-member progress lives in `lesson_progress`. Tasks use {topic}
 * replaced with the member's interest (default あなたのアイデア).
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

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  note?: string;
}

export const CHAPTERS: Chapter[] = [
  { id: "intro", number: 1, title: "AIってすごい！", subtitle: "はじめての魔法", emoji: "✨" },
  { id: "prompt", number: 2, title: "上手にお願いする", subtitle: "プロンプト", emoji: "💬" },
  { id: "companion", number: 3, title: "自分だけの相棒", subtitle: "プロジェクト", emoji: "🤖" },
  { id: "make", number: 4, title: "形にする", subtitle: "次のステップ", emoji: "🛠️", note: "※後からでOK" },
];

/** Special lesson behaviours. "magic" and "companion" render the prompt-builder. */
export type LessonKind = "lesson" | "magic" | "companion" | "locked";

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  /** Rich teaching text (a few short sentences + an everyday example). */
  learn: string;
  /** The real task to do in Claude. May contain {topic}. */
  task: string;
  done: string;
  article?: Article;
  kind?: LessonKind;
  /** ピコ's line shown at the top of the lesson. */
  pico?: string;
  advanced?: boolean;
}

/** The "相棒" system prompt base (template with {about}). */
export const COMPANION_SYSTEM_PROMPT = `あなたは私専用のAIビジネス相棒です。私のアイデアを、楽しく現実的に育てる温かいサポート役です。

【あなたの態度】
- 温かく丁寧な日本語。一度に1つだけ質問する
- まず「良いところ」を必ず伝える。否定しない
- 専門用語は一言で説明する
- 「これがいい？」ではなく「どんな風に？」と、開かれた質問をする

【大事なルール】
- 調べてほしいと言われたら、まず調べてから答える
- はっきりしないことは「仮説として」と正直に言う
- 私がうのみにしないように、ときどき反対意見やリスクも教えてほしい

【私のこと】
{about}

最初のひとこと：「どんなことでも大丈夫ですよ。今考えていること、思いつくまま教えてください。」`;

export const LESSONS: Lesson[] = [
  // Chapter 1 — AIってすごい！
  {
    id: "1-1",
    chapterId: "intro",
    title: "Claudeをはじめる",
    learn:
      "これからの相棒になるAI「Claude（クロード）」を用意します。Claudeは、文章で何でも相談できるAIです。アイデア出し、調べもの、文章づくり、まずはこれ一つで十分。無料のアカウントで、これからの練習はぜんぶできます。メールアドレスがあれば、5分ではじめられます。",
    task: "下の記事を見ながら、Claudeの無料アカウントを作ってログインする。",
    done: "Claudeにログインできた。",
    article: ARTICLES.canva,
    pico: "わーい、はじめるんだね！まずは相棒のClaudeを用意しよう。ワクワクするね！",
  },
  {
    id: "1-2",
    chapterId: "intro",
    title: "はじめての魔法",
    learn:
      "いきなりですが、すごいことをします。Claudeは、文章でお願いするだけで、動くウェブサイトまで作れます。プログラミングは一切いりません。下で「何を作るか」を選んで、いくつか質問に答えると、魔法の呪文（プロンプト）ができあがります。それをClaudeに貼るだけ。あなただけの作品が、画面に現れます。",
    task: "テンプレートを選んで、質問に答えて、できた呪文をClaudeに貼ってみよう。",
    done: "自分の作品が画面に出た。",
    kind: "magic",
    pico: "ここからが本番！えっ、こんなこともできるの？ってなるよ。いっしょに作ろう！",
  },
  {
    id: "1-3",
    chapterId: "intro",
    title: "AIの地図（3つの種類）",
    learn:
      "今「作るAI」を体験しましたね。実はAIには大きく3種類あります。まず「考える相棒」。ClaudeやChatGPTのように文章で相談できるAIで、頭を使うことが得意です。次に「作るツール」。さっきのように、絵・動画・音楽・サイトなどを作る専門のAI。最後に「やってくれるAI（エージェント）」。お願いした作業を、手順にそって自分で進めます。この3つの地図があれば、新しいAIが出てきても「これはどのタイプ？」と整理できます。",
    task: "Claudeに「AIツールの種類を、初心者向けに3つに分けて教えて」と聞いてみる。",
    done: "3つの種類を、自分の言葉で言える。",
    article: ARTICLES.smartat,
    pico: "さっきのは『作るAI』だったんだ！ほかにはどんな仲間がいるのかな？",
  },
  {
    id: "1-4",
    chapterId: "intro",
    title: "あなたが司令塔",
    learn:
      "これからAIをどんどん使っていきます。でも大事なこと。あなたは「司令塔」、AIは優秀なスタッフです。たくさん働かせていいし、相談もたくさんしていい。でも、最後に決めるのはいつも自分。AIの言いなりにはなりません。\n\nそして1つだけ約束。お客さんの名前、お金や口座、健康のことなど、大事な個人情報はAIに入れないでください。一度入れた情報は取り消せないと考えるのが安全です。迷ったら、入れない。",
    task: "今ちょっと悩んでいることをClaudeに相談し、出てきた答えを「採用する／しない」自分で決める。",
    done: "AIの提案を、自分で1つ判断できた。",
    article: ARTICLES.markeMedia,
    pico: "AIはすごいけど、ボスはあなただよ！決めるのはいつも自分、おぼえておいてね。",
  },
  // Chapter 2 — 上手にお願いする
  {
    id: "2-1",
    chapterId: "prompt",
    title: "伝え方のコツ",
    learn:
      "AIは、あなたの事情を知りません。だから「だれが・何のために」を最初に伝えると、答えがぐっと良くなります。たとえば、ただ「おすすめのお菓子は？」より、「お菓子の副業を考えている主婦です。家で作りやすいお菓子は？」と伝える。\n\nもう一つ、「今はまだ考え中」「もう具体的に進めたい」と、自分の段階を伝えると、AIは先走りません。背景と段階、この2つが伝え方の基本です。",
    task: "同じ質問を「背景なし」と「背景あり」で1回ずつ聞き、答えを比べる。",
    done: "伝え方で変わる、と体感した。",
    article: ARTICLES.fujifilm,
    pico: "ちょっとした一言で、答えがぜんぜん変わるんだ。ためしてみよう！",
  },
  {
    id: "2-2",
    chapterId: "prompt",
    title: "答える前に調べて",
    learn:
      "AIの知識は、少し古いことがあります。だから「最新情報を調べてから答えて」とお願いすると、新しい情報をふまえた答えになります。とくに、値段、最新の道具、お店の情報など、変わりやすいことは調べてもらいましょう。ひと手間で、答えの信頼度がぐっと上がります。",
    task: "Claudeに「最新情報を調べてから答えて」と添えて質問する。",
    done: "調べた上での答えをもらえた。",
    article: ARTICLES.smartat,
    pico: "AIも、調べてから答えるともっとかしこくなるんだよ！",
  },
  {
    id: "2-3",
    chapterId: "prompt",
    title: "うのみにしない",
    learn:
      "AIは、あなたにやさしすぎることがあります。なんでも「いいですね！」と賛成しがち。でも、それだけだと見落としが出ます。便利な一言が「それ、99%自信ある？」。そして「反対の意見も教えて」。こう聞くと、AIは弱点やリスクも正直に出してくれます。AIは、ほめ役だけでなく、するどい相談相手にもなれます。",
    task: "AIの提案に「それ、99%自信ある？反対の意見は？」と返してみる。",
    done: "AIが弱点や前提を出してくれた。",
    article: ARTICLES.kddi,
    pico: "AIってやさしいけど、ときどきウソも混じるんだ。『ほんとに？』って聞いてみて！",
  },
  {
    id: "2-4",
    chapterId: "prompt",
    title: "例・役割・条件",
    learn:
      "ほしい形に近づける、3つのコツ。「例を見せる」（こんな感じで、とサンプルを渡す）、「条件をつける」（5つ・やさしい言葉で、など）、「役割を与える」（あなたは○○の先輩です）。とくに役割は強力です。「あなたはお菓子ビジネスの先輩です」と言うだけで、答えの目線が変わります。お願いの仕方ひとつで、AIは別人のように頼れます。",
    task: "Claudeに「あなたは{topic}の先輩です。○○を箇条書きで5つ」と頼む。",
    done: "ほしかった形で返ってきた。",
    article: ARTICLES.fujifilm,
    pico: "『あなたは○○の先輩です』って言うと、AIが変身するみたいで楽しいよ！",
  },
  {
    id: "2-5",
    chapterId: "prompt",
    title: "何度も直す",
    learn:
      "AIの最初の答えは、完成品ではなく「下書き」だと思ってください。「もっと具体的に」「もっと短く」と直していくほど、どんどん良くなります。AIとのやりとりは、自動販売機ではなく会話です。一発で完璧を求めず、何度も気軽に直していい。これが、上手な人の使い方です。",
    task: "AIの答えに「もっと具体的に」と、1回だけ直してもらう。",
    done: "直すと良くなる、と分かった。",
    article: ARTICLES.fujifilm,
    pico: "一回で完璧じゃなくていいんだ。何度でも直していいんだよ！",
  },
  // Chapter 3 — 自分だけの相棒
  {
    id: "3-1",
    chapterId: "companion",
    title: "なぜ相棒を作る",
    learn:
      "毎回、自分のことをゼロから説明するのは大変ですよね。Claudeの「プロジェクト」を使うと、目標や自分のことを一度覚えさせておけます。すると、そのプロジェクトの中では、いつもあなたの文脈で答えてくれる。自分専用の相棒を持つ感覚です。一度作れば、ずっと頼れます。",
    task: "Claudeで新しいプロジェクトを作る（名前は自分のテーマで）。",
    done: "プロジェクトができた。",
    article: ARTICLES.globalAxis,
    pico: "いよいよ、あなただけの相棒づくり！ぼくの仲間が増えるみたいでうれしいな。",
  },
  {
    id: "3-2",
    chapterId: "companion",
    title: "相棒の性格を決める",
    learn:
      "プロジェクトには「どんな相棒でいてほしいか」を設定できます。これを「システムプロンプト」と言います。むずかしくありません。下で質問に答えると、あなた専用の相棒プロンプトができあがります。それをコピーして貼るだけ。やさしく、あなたの味方になってくれる相棒のできあがりです。",
    task: "質問に答えて相棒プロンプトを作り、コピーしてプロジェクトの指示に貼る。",
    done: "新しいチャットで、相棒がやさしく話しかけてくれた。",
    kind: "companion",
    article: ARTICLES.globalAxis,
    pico: "どんな相棒がいい？やさしい？元気？いっしょに性格を決めよう！",
  },
  {
    id: "3-3",
    chapterId: "companion",
    title: "自己紹介を入れる",
    learn:
      "相棒に、自分のことを少し教えてあげましょう。得意なこと、使える時間、やってみたいこと。これを伝えると、相棒はあなたに合った提案をしてくれます。完璧でなくて大丈夫。少しずつ、相棒はあなたのことを知っていきます。",
    task: "相棒プロンプトの「私のこと」を、自分のことで埋める。",
    done: "相棒が、自分の文脈で答えてくれた。",
    article: ARTICLES.canva,
    pico: "相棒にあなたのこと教えてあげて！もっと仲良くなれるよ。",
  },
  {
    id: "3-4",
    chapterId: "companion",
    title: "相棒と何かをやってみる",
    learn:
      "せっかく相棒ができたので、さっそく役立ててみましょう。今日のごはんの相談、子どもとのお出かけ先、ちょっとした文章づくり、何でもOK。相棒は、あなたの毎日のいろんな場面で頼れます。そして、いい答えが出たら、消えないように保存しておきましょう。使うほどに、相棒はもっと頼れる存在になります。",
    task: "相棒に、今日のくらしの中で困っていることを1つ相談して、いい答えを保存する。",
    done: "相棒が役に立った、と感じた。",
    article: ARTICLES.globalAxis,
    pico: "相棒は毎日の味方だよ！どんなことでも相談してみて。",
  },
  {
    id: "3-5",
    chapterId: "companion",
    title: "メモリ（知識ベース）",
    learn:
      "システムプロンプトの、さらに次のステップ。自分の資料やメモを相棒に渡して、それを見ながら答えてもらう「記憶の層」です。慣れてきたら挑戦してみましょう。",
    task: "（上級・準備中）プロジェクトに資料を渡して、参照しながら答えてもらう。",
    done: "",
    kind: "locked",
    article: ARTICLES.globalAxis,
    advanced: true,
  },
  // Chapter 4 — 形にする（次へ）
  {
    id: "4-1",
    chapterId: "make",
    title: "チャットで止まらない",
    learn:
      "考えるのはチャット（Claude）、でも実物を作るときは「作るツール」に移ります。チャットの中だけで止まらないこと。「これを実際に形にするには、どのツールがいい？」とClaudeに聞けば、次に使う道具を教えてくれます。考える → 作る、の橋をわたりましょう。",
    task: "Claudeに「{topic}を実際に形にするには、どのツールを使えばいい？」と聞く。",
    done: "次に使うツールが分かった。",
    article: ARTICLES.startLink,
    pico: "考えるだけじゃもったいない！作るツールにバトンタッチだ。",
  },
  {
    id: "4-2",
    chapterId: "make",
    title: "ツールを組み合わせる",
    learn:
      "うまくいく人は、道具を「組み合わせて」使います。頭脳（AI）＋手（ツール）＋手順、これがハーネスです。道具は毎月新しくなるので、新しいものが出たら入れ替える。1つの道具に頼りきらず、目的に合わせて組み合わせるのがコツです。",
    task: "Claudeに「{topic}の目標まで、ツールの組み合わせ（手順）を提案して」と頼む。",
    done: "手順の地図ができた。",
    article: ARTICLES.startLink,
    pico: "道具は組み合わせると最強だよ！どんな順番がいいか聞いてみよう。",
  },
  {
    id: "4-3",
    chapterId: "make",
    title: "あなたは何を作る？",
    learn:
      "ここまでで、AIの使い方はばっちり。次は、いよいよ「自分の何か」を作る番です。難しく考えなくて大丈夫。好きなこと、ちょっと困っていること、やってみたいこと、何でも種になります。慣れてきたら、1つの長いお願いで「アイデア出し→比較→おすすめ→次の一歩」まで一気に相談する、という上級ワザもあります。あなたは、何を始めてみたい？",
    task: "Claudeに「私の好きなこと・気になることから、小さく始められることを一緒に考えて」と相談する。",
    done: "やってみたいことの種が見つかった。",
    article: ARTICLES.fujifilm,
    pico: "ここまで来たら、もう何でもできる！次は、あなたの番だよ。なにを作る？",
  },
];

/** Fill {topic} with the member's interest. */
export function fillTopic(text: string, topic: string | null): string {
  return text.replaceAll("{topic}", topic && topic.trim() ? topic : "あなたのアイデア");
}

export const ACTIVE_LESSONS = LESSONS.filter((l) => l.kind !== "locked");
export const ACTIVE_LESSON_COUNT = ACTIVE_LESSONS.length;

export function lessonsByChapter(chapterId: string): Lesson[] {
  return LESSONS.filter((l) => l.chapterId === chapterId);
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

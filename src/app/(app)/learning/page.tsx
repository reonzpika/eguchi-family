import { ARTICLES } from "@/lib/curriculum/lessons";

/**
 * Library: the AI landscape map (3 modes) + the curated Japanese articles.
 * Static, points outward. Reuses the verified article set from the curriculum.
 */

const MODES = [
  {
    emoji: "💬",
    title: "考える相棒",
    note: "チャット型。相談・調べもの・整理に。",
    examples: "ChatGPT・Claude・Gemini・Perplexity",
  },
  {
    emoji: "🎨",
    title: "作るツール",
    note: "専門のAI。実物を作る。",
    examples: "絵 Midjourney／動画 Veo・Runway／音楽 Suno／サイト Lovable",
  },
  {
    emoji: "🤖",
    title: "やってくれるAI",
    note: "手順のある作業を自分で進める（エージェント）。",
    examples: "ChatGPT Agent・Claude・Manus",
  },
];

const ARTICLE_ORDER: { key: keyof typeof ARTICLES; note: string }[] = [
  { key: "smartat", note: "AIの種類を知る" },
  { key: "markeMedia", note: "AIの得意・苦手" },
  { key: "fujifilm", note: "上手な聞き方" },
  { key: "globalAxis", note: "自分専用アシスタント" },
  { key: "canva", note: "Claudeのはじめ方" },
  { key: "startLink", note: "AIで形にする" },
  { key: "kddi", note: "AIのうそを見抜く" },
  { key: "aiReboot", note: "個人情報の守り方" },
];

export default function LibraryPage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <h1 className="mb-6 font-headline text-2xl font-bold text-on-surface">
          ライブラリ
        </h1>

        {/* AI map */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
            <span>🗺️</span>AIの地図（3つの使い方）
          </h2>
          <div className="space-y-3">
            {MODES.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-4"
              >
                <p className="mb-1 flex items-center gap-2 font-bold text-on-surface">
                  <span className="text-lg">{m.emoji}</span>
                  {m.title}
                </p>
                <p className="text-sm text-on-surface-variant">{m.note}</p>
                <p className="mt-1 text-xs text-on-surface-variant">例：{m.examples}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-on-surface-variant">
            ツールは毎月のように変わります。「今いちばん良いツールは？」とAIに聞くのが、いちばん確実です。
          </p>
        </section>

        {/* Articles */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
            <span>📚</span>記事で学ぶ
          </h2>
          <div className="space-y-3">
            {ARTICLE_ORDER.map(({ key, note }) => {
              const a = ARTICLES[key];
              return (
                <a
                  key={key}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-on-surface">{a.label}</p>
                    <p className="text-xs text-on-surface-variant">{note}</p>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-base text-on-surface-variant">
                    open_in_new
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

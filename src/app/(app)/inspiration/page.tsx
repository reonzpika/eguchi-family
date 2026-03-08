"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const PROMPTS = [
  {
    emoji: "🌟",
    question: "自分が得意なことで、よく頼まれることは？",
  },
  {
    emoji: "💭",
    question: "毎日の生活で「これ不便だな」と感じることは？",
  },
  {
    emoji: "❤️",
    question: "好きなことや趣味で、世界と共有したいものは？",
  },
];

export default function InspirationPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-warm bg-white text-base"
        >
          ←
        </Link>
        <h2 className="text-lg font-extrabold text-foreground">アイデアのヒント</h2>
      </div>

      <p className="mb-6 text-sm text-muted">
        次の質問を考えてみてください。ピンときたらAIと話してみましょう！
      </p>

      <div className="flex flex-col gap-4">
        {PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => router.push("/ideas/new")}
            className="rounded-2xl border border-border-warm bg-secondary/10 p-5 text-left transition-transform active:scale-[0.98]"
          >
            <div className="mb-3 text-3xl">{prompt.emoji}</div>
            <p className="mb-4 text-sm font-semibold leading-relaxed text-foreground">
              {prompt.question}
            </p>
            <div className="text-sm font-semibold text-primary">
              このテーマでAIと話す →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

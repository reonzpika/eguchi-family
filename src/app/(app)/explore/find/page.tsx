"use client";

import Link from "next/link";
import { useState } from "react";
import { IDEA_FINDER_RECIPE, SUMMARY_CLOSING_PROMPT } from "@/lib/workshop/recipes";
import { PicoBubble } from "@/components/journey/Pico";
import { HelpCard } from "@/components/workshop/HelpCard";

const CLAUDE_URL = "https://claude.ai/";

/** A copy box with its own copied state + a Claude link. */
function CopyBox({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* manual select fallback */
    }
  }
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
      <p className="mb-2 text-xs font-bold text-primary">{label}</p>
      <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
        {text}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
          {copied ? "コピーした！" : "コピー"}
        </button>
        <a
          href={CLAUDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
          Claudeを開く
        </a>
      </div>
    </div>
  );
}

/** アイデアを見つける: hands the idea-finder recipe to set up a Claude project. */
export default function FindPage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <Link href="/explore" className="mb-4 inline-flex items-center gap-1 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          アイデアさがし
        </Link>
        <PicoBubble line="アイデア探し専用のClaudeを作ろう！このレシピを貼ってね。" size={52} />

        <ol className="mb-4 space-y-2 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          <li>1. 下のレシピをコピー</li>
          <li>2. Claudeで新しいプロジェクトを作る</li>
          <li>3. レシピを貼って、Claudeと話そう</li>
          <li>4. 気に入ったアイデアが見つかったら、アイデアさがしの「アイデアできた！」へ</li>
        </ol>

        <HelpCard trigger="project" />
        <HelpCard trigger="privacy" />

        <div className="mb-4">
          <CopyBox text={IDEA_FINDER_RECIPE} label="アイデア発見レシピ" />
        </div>

        <CopyBox text={SUMMARY_CLOSING_PROMPT} label="おわったら、これを貼って「まとめ」をもらおう" />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHelp } from "@/lib/workshop/learn";
import { PicoBubble } from "@/components/journey/Pico";

const CLAUDE_URL = "https://claude.ai/";

/** First-run setup: get a Claude account, learn what a project is. Skippable. */
export default function SetupPage() {
  const router = useRouter();
  const account = getHelp("claude-account");

  function done() {
    localStorage.setItem("claude_setup_done", "1");
    router.push("/explore");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line="はじめる前に、あいぼうのClaudeを用意しよう！かんたんだよ。" size={52} />

        {/* 1. account */}
        <div className="mb-4 rounded-2xl border border-border-warm bg-white p-5">
          <p className="mb-1 text-sm font-bold text-on-surface">{account?.title}</p>
          <p className="mb-3 text-sm leading-relaxed text-on-surface-variant">{account?.body}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={CLAUDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Claudeを開く
            </a>
            {account?.article && (
              <a
                href={account.article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary"
              >
                作り方を見る
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={done}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary transition-transform active:scale-[0.98]"
        >
          用意できた！はじめる
        </button>
        <Link href="/explore" className="mt-3 block text-center text-xs text-on-surface-variant underline">
          あとで（スキップ）
        </Link>
      </div>
    </div>
  );
}

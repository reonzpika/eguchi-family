"use client";

import Link from "next/link";

interface StatsCardsProps {
  ideaCount: number;
  projectCount: number;
}

const cardClass =
  "block rounded-xl border border-border-warm bg-white p-4 shadow-sm transition-colors hover:bg-muted/50 active:scale-[0.98] cursor-pointer";

export function StatsCards({ ideaCount, projectCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/ideas" className={cardClass} aria-label="アイデア一覧を見る">
        <p className="text-2xl" aria-hidden>
          💡
        </p>
        <p className="mt-1 text-xl font-bold text-foreground">{ideaCount}</p>
        <p className="text-xs text-muted">アイデア</p>
      </Link>
      <Link
        href="/projects"
        className={`mt-2 ${cardClass}`}
        aria-label="プロジェクト一覧を見る"
      >
        <p className="text-2xl" aria-hidden>
          📁
        </p>
        <p className="mt-1 text-xl font-bold text-foreground">{projectCount}</p>
        <p className="text-xs text-muted">プロジェクト</p>
      </Link>
    </div>
  );
}

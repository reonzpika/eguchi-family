"use client";

interface StatsCardsProps {
  ideaCount: number;
  projectCount: number;
}

export function StatsCards({ ideaCount, projectCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border-warm bg-white p-4 shadow-sm">
        <p className="text-2xl" aria-hidden>
          💡
        </p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {ideaCount}
        </p>
        <p className="text-xs text-muted">アイデア</p>
      </div>
      <div className="mt-2 rounded-xl border border-border-warm bg-white p-4 shadow-sm">
        <p className="text-2xl" aria-hidden>
          📁
        </p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {projectCount}
        </p>
        <p className="text-xs text-muted">プロジェクト</p>
      </div>
    </div>
  );
}

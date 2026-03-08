"use client";

import type { Milestone } from "@/types/database";

interface AtAGlanceCardProps {
  currentMilestone: Milestone | null;
  completedCount: number;
  totalCount: number;
  overallPercentage: number;
  aiInsight?: string | null;
}

function progressBarColourClass(percentage: number): string {
  if (percentage <= 33) return "bg-error";
  if (percentage <= 66) return "bg-secondary";
  return "bg-success";
}

export function AtAGlanceCard({
  currentMilestone,
  completedCount,
  totalCount,
  overallPercentage,
  aiInsight,
}: AtAGlanceCardProps) {
  const pct = Math.min(100, Math.max(0, overallPercentage));
  const fillClass = progressBarColourClass(pct);

  return (
    <div className="mb-6 rounded-2xl border border-border-warm bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-foreground">
        {currentMilestone?.title ?? "マイルストーンはありません"}
      </p>
      <p className="mb-3 text-xs text-muted">
        {totalCount > 0 ? `${completedCount} / ${totalCount} タスク完了` : "タスクなし"}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border-warm">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{overallPercentage}% 完了</p>
      {aiInsight && aiInsight.trim() && (
        <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2">
          <p className="text-xs font-semibold text-muted">AI からの一言</p>
          <p className="mt-0.5 text-sm text-foreground">{aiInsight}</p>
        </div>
      )}
    </div>
  );
}

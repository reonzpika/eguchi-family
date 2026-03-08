"use client";

import type { Milestone } from "@/types/database";

interface AtAGlanceCardProps {
  currentMilestone: Milestone | null;
  completedCount: number;
  totalCount: number;
  overallPercentage: number;
}

export function AtAGlanceCard({
  currentMilestone,
  completedCount,
  totalCount,
  overallPercentage,
}: AtAGlanceCardProps) {
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
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{overallPercentage}% 完了</p>
    </div>
  );
}

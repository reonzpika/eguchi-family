"use client";

interface ReflectionInsightProps {
  insight: string;
  livingDocUpdated?: boolean;
  newMilestonesGenerated?: boolean;
}

export function ReflectionInsight({
  insight,
  livingDocUpdated = false,
  newMilestonesGenerated = false,
}: ReflectionInsightProps) {
  return (
    <div className="rounded-2xl border border-border-warm bg-white p-4">
      <p className="mb-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
        {insight}
      </p>
      {(livingDocUpdated || newMilestonesGenerated) && (
        <div className="flex flex-wrap gap-2">
          {livingDocUpdated && (
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              リビングドキュメントを更新しました
            </span>
          )}
          {newMilestonesGenerated && (
            <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
              新しいマイルストーンを追加しました
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

export interface ValidationSummary {
  ideaPitch?: string;
  targetCustomer?: string;
  problem?: string;
  solution?: string;
  differentiation?: string;
  pricing?: string;
  firstCustomers?: string;
  realityCheck?: string[];
  nextStep?: string;
}

interface BusinessSummaryProps {
  summary: ValidationSummary;
  onSaveIdea?: () => void;
  onPromoteToProject?: () => void;
  isSaved?: boolean;
  saving?: boolean;
  /** When true, do not render Save/Promote buttons (actions are in page header). */
  hideActions?: boolean;
}

const sectionTitle = (emoji: string, title: string) => (
  <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
    {emoji} {title}
  </div>
);

export function BusinessSummary({
  summary,
  onSaveIdea,
  onPromoteToProject,
  isSaved = false,
  saving = false,
  hideActions = false,
}: BusinessSummaryProps) {
  return (
    <div className="space-y-5">
      {summary.ideaPitch && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("🎯", "アイデア")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.ideaPitch}
          </p>
        </div>
      )}

      {summary.targetCustomer && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("👥", "誰向け")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.targetCustomer}
          </p>
        </div>
      )}

      {summary.problem && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("💡", "解決する問題")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.problem}
          </p>
        </div>
      )}

      {summary.solution && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("✨", "解決策")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.solution}
          </p>
        </div>
      )}

      {summary.differentiation && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("🌟", "違い")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.differentiation}
          </p>
        </div>
      )}

      {summary.pricing && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("💰", "お金のイメージ")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.pricing}
          </p>
        </div>
      )}

      {summary.firstCustomers && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          {sectionTitle("🎣", "最初の客")}
          <p className="text-sm leading-relaxed text-foreground">
            {summary.firstCustomers}
          </p>
        </div>
      )}

      {summary.realityCheck && summary.realityCheck.length > 0 && (
        <div className="rounded-2xl border border-border-warm bg-bg-warm p-4">
          {sectionTitle("✅", "リアリティチェック")}
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
            {summary.realityCheck.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.nextStep && (
        <div className="rounded-2xl border border-border-warm bg-primary-light p-4">
          {sectionTitle("👣", "まずやること")}
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {summary.nextStep}
          </p>
        </div>
      )}

      {!hideActions && onSaveIdea && (
        <button
          type="button"
          onClick={onSaveIdea}
          disabled={saving || isSaved}
          className={`min-h-[48px] w-full rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50 ${
            isSaved ? "bg-success" : "bg-primary"
          }`}
        >
          {isSaved ? "✓ 保存しました" : saving ? "保存中..." : "💾 保存する"}
        </button>
      )}

      {!hideActions && onPromoteToProject && isSaved && (
        <button
          type="button"
          onClick={onPromoteToProject}
          className="min-h-[48px] w-full rounded-xl border-2 border-primary bg-white px-5 py-3.5 font-semibold text-primary transition-transform active:scale-[0.97]"
        >
          🚀 プロジェクトに昇格する
        </button>
      )}
    </div>
  );
}

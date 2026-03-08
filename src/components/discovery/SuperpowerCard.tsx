"use client";

export interface SuggestedIdea {
  emoji: string;
  title: string;
  description: string;
}

interface SuperpowerCardProps {
  title: string;
  description: string;
  suggestedIdeas?: SuggestedIdea[];
}

export function SuperpowerCard({
  title,
  description,
  suggestedIdeas = [],
}: SuperpowerCardProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-primary-light to-secondary/20 p-5 text-center">
        <div className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          ✨ あなたの強み
        </div>
        <h3 className="mb-3 text-xl font-bold text-primary">{title}</h3>
        <p className="text-sm leading-relaxed text-foreground">{description}</p>
      </div>

      {suggestedIdeas.length > 0 && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          <div className="mb-3 text-sm font-bold text-foreground">
            💡 おすすめのアイデア
          </div>
          <ul className="space-y-3">
            {suggestedIdeas.map((idea, i) => (
              <li
                key={i}
                className="rounded-xl bg-bg-warm p-3"
              >
                <div className="mb-1 font-semibold text-foreground">
                  {idea.emoji} {idea.title}
                </div>
                <div className="text-xs text-muted">{idea.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

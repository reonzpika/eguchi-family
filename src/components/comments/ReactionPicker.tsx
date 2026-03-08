"use client";

import { REACTION_EMOJIS } from "@/types/database";

interface ReactionPickerProps {
  commentId: string;
  userReaction: string | null;
  reactionCounts: Record<string, number>;
  onToggle: (emoji: string) => void;
  onSelect?: (emoji: string) => void;
  existing?: string[];
}

export function ReactionPicker({
  existing = [],
  commentId: _commentId,
  userReaction,
  reactionCounts,
  onToggle,
}: ReactionPickerProps) {
  const emojis = REACTION_EMOJIS;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {emojis.map((emoji) => {
        const count = reactionCounts[emoji] ?? 0;
        const isActive = userReaction === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            className={`flex min-h-[32px] items-center gap-1 rounded-full border px-2 text-sm transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-warm bg-white text-muted hover:bg-border-warm/50"
            }`}
            aria-label={`${emoji} ${count > 0 ? count : ""}`}
          >
            <span aria-hidden>{emoji}</span>
            {count > 0 ? <span className="text-xs">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

interface WeeklyReflectionFormProps {
  projectId: string;
  onSubmit: (responses: {
    what_worked: string;
    wins: string;
    blockers: string;
  }) => void;
  isSubmitting?: boolean;
}

export function WeeklyReflectionForm({
  projectId,
  onSubmit,
  isSubmitting = false,
}: WeeklyReflectionFormProps) {
  const [what_worked, setWhat_worked] = useState("");
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ what_worked, wins, blockers });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="what_worked"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          何を進めましたか？
        </label>
        <textarea
          id="what_worked"
          value={what_worked}
          onChange={(e) => setWhat_worked(e.target.value)}
          placeholder="今週取り組んだことを自由に書いてください"
          className="min-h-[48px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="wins"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          うまくいったことは？
        </label>
        <textarea
          id="wins"
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          placeholder="小さな成果でも大丈夫です"
          className="min-h-[48px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
      <div>
        <label
          htmlFor="blockers"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          困っていることは？
        </label>
        <textarea
          id="blockers"
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder="あれば教えてください"
          className="min-h-[48px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-[48px] w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? "送信中..." : "振り返りを送信"}
      </button>
    </form>
  );
}

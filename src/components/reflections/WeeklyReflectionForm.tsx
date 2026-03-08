"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";

interface WeeklyReflectionFormProps {
  projectId: string;
  onSubmit: (responses: {
    what_worked: string;
    wins: string;
    blockers: string;
  }) => void;
  isSubmitting?: boolean;
}

const BLOCKER_CHIPS = [
  "特になし",
  "時間",
  "お金",
  "スキル",
  "モチベーション",
  "その他",
] as const;

export function WeeklyReflectionForm({
  projectId,
  onSubmit,
  isSubmitting = false,
}: WeeklyReflectionFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [what_worked, setWhat_worked] = useState("");
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [blockerChip, setBlockerChip] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  const handleQ1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (what_worked.trim()) setStep(2);
  };

  const handleQ2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (wins.trim()) setStep(3);
  };

  const handleQ3 = (e: React.FormEvent) => {
    e.preventDefault();
    const blockerText = [blockerChip, blockers.trim()].filter(Boolean).join(" / ");
    onSubmit({
      what_worked: what_worked.trim(),
      wins: wins.trim(),
      blockers: blockerText || blockers.trim(),
    });
  };

  const addChipToBlockers = (label: string) => {
    setBlockerChip((prev) => (prev === label ? null : label));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Conversation thread */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white">
            <ChatMarkdown>今週何に取り組みましたか？</ChatMarkdown>
          </div>
        </div>

        {step >= 2 && what_worked.trim() && (
          <>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-border-warm bg-white px-4 py-3 text-sm text-foreground">
                <ChatMarkdown>{what_worked}</ChatMarkdown>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white">
                <ChatMarkdown>いいですね。うまくいったことはありますか？ 小さなことでも大丈夫です。</ChatMarkdown>
              </div>
            </div>
          </>
        )}

        {step >= 3 && wins.trim() && (
          <>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-border-warm bg-white px-4 py-3 text-sm text-foreground">
                <ChatMarkdown>{wins}</ChatMarkdown>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white">
                <ChatMarkdown>困っていることはありますか？ 下から選んでも、自由に書いても大丈夫です。</ChatMarkdown>
              </div>
            </div>
          </>
        )}
      </div>

      <div ref={messagesEndRef} />

      {/* Step 1: What did you work on */}
      {step === 1 && (
        <form onSubmit={handleQ1} className="border-t border-border-warm pt-4">
          <textarea
            value={what_worked}
            onChange={(e) => setWhat_worked(e.target.value)}
            placeholder="今週取り組んだことを自由に書いてください"
            className="mb-3 min-h-[80px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!what_worked.trim()}
            className="min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            次へ
          </button>
        </form>
      )}

      {/* Step 2: Wins */}
      {step === 2 && (
        <form onSubmit={handleQ2} className="border-t border-border-warm pt-4">
          <textarea
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            placeholder="小さな成果でも大丈夫です"
            className="mb-3 min-h-[80px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!wins.trim()}
            className="min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            次へ
          </button>
        </form>
      )}

      {/* Step 3: Blockers with chips */}
      {step === 3 && (
        <form onSubmit={handleQ3} className="border-t border-border-warm pt-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {BLOCKER_CHIPS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => addChipToBlockers(label)}
                className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-transform active:scale-[0.95] ${
                  blockerChip === label
                    ? "border-primary bg-primary text-white"
                    : "border-primary bg-white text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="その他あれば自由に書いてください"
            className="mb-3 min-h-[60px] w-full rounded-xl border border-border-warm bg-white p-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "送信中..." : "振り返りを送信"}
          </button>
        </form>
      )}
    </div>
  );
}

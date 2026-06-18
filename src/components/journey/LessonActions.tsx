"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { picoCelebration } from "@/lib/curriculum/pico";
import { PicoAvatar } from "./Pico";

interface Props {
  lessonId: string;
  alreadyDone: boolean;
  existingReflection: string;
  doneLabel: string;
}

export function LessonActions({ lessonId, alreadyDone, existingReflection, doneLabel }: Props) {
  const router = useRouter();
  const [reflection, setReflection] = useState(existingReflection);
  const [showMemo, setShowMemo] = useState(!!existingReflection);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDone() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, reflection }),
      });
      if (!res.ok) throw new Error();
      setCelebrating(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch {
      setError("保存できませんでした。もう一度おためしください。");
      setSaving(false);
    }
  }

  if (celebrating) {
    const seed = lessonId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary-container p-6 text-center">
        <PicoAvatar size={56} />
        <p className="font-headline text-base font-bold text-on-secondary-container">
          {picoCelebration(seed)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-4">
      {doneLabel && (
        <p className="mb-3 text-xs font-bold text-on-surface-variant">
          できたら：{doneLabel}
          {alreadyDone && <span className="ml-2 text-primary">✓ 完了ずみ</span>}
        </p>
      )}
      <button
        type="button"
        onClick={handleDone}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-lg">done</span>
        {saving ? "ほぞん中..." : "できた！"}
      </button>

      {showMemo ? (
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="ひとことメモ（任意）：やってみてどうだった？"
          rows={2}
          className="mt-3 w-full resize-none rounded-xl border border-surface-variant bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowMemo(true)}
          className="mt-3 block w-full text-center text-xs text-on-surface-variant underline"
        >
          ひとことメモを残す（任意）
        </button>
      )}
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}

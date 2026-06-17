"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLAUDE_URL = "https://claude.ai/";

interface Props {
  lessonId: string;
  copyPrompt?: string;
  alreadyDone: boolean;
  existingReflection: string;
  doneLabel: string;
}

export function LessonActions({
  lessonId,
  copyPrompt,
  alreadyDone,
  existingReflection,
  doneLabel,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [reflection, setReflection] = useState(existingReflection);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(alreadyDone);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    if (!copyPrompt) return;
    try {
      await navigator.clipboard.writeText(copyPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("コピーできませんでした。長押しで選択してコピーしてください。");
    }
  }

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
      setDone(true);
      router.push("/");
      router.refresh();
    } catch {
      setError("保存できませんでした。もう一度おためしください。");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Copy-paste prompt */}
      {copyPrompt && (
        <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
          <pre className="mb-3 max-h-60 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
            {copyPrompt}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "コピーしました" : "コピーする"}
          </button>
        </div>
      )}

      {/* Open Claude */}
      <a
        href={CLAUDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-base font-bold text-on-secondary shadow-sm transition-transform active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">open_in_new</span>
        Claudeで試す
      </a>

      {/* Done + reflection */}
      <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-4">
        <p className="mb-2 text-xs font-bold text-on-surface-variant">
          できたら：{doneLabel}
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="ひとことメモ（任意）：やってみてどうでしたか？"
          rows={2}
          className="mb-3 w-full resize-none rounded-xl border border-surface-variant bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={handleDone}
          disabled={saving}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-6 py-3 text-base font-bold transition-transform active:scale-[0.98] disabled:opacity-60 ${
            done
              ? "bg-primary-container text-primary"
              : "bg-primary text-on-primary"
          }`}
        >
          <span
            className="material-symbols-outlined text-lg"
            style={done ? { fontVariationSettings: '"FILL" 1' } : undefined}
          >
            {done ? "check_circle" : "done"}
          </span>
          {saving ? "保存中..." : done ? "完了ずみ（もう一度保存）" : "できた！"}
        </button>
        {error && <p className="mt-2 text-xs text-error">{error}</p>}
      </div>
    </div>
  );
}

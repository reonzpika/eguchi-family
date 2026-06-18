"use client";

import { useState } from "react";
import {
  MAGIC_TEMPLATES,
  COMPANION_BUILDER,
  buildPrompt,
  type PromptTemplate,
} from "@/lib/curriculum/prompt-builder";

const CLAUDE_URL = "https://claude.ai/";

/**
 * The prompt-builder: pick a template (magic only), answer a few playful
 * questions, and get a ready-to-paste prompt. Used by lesson 1-2 (magic) and
 * 3-2 (companion).
 */
export function PromptBuilder({ mode }: { mode: "magic" | "companion" }) {
  const [template, setTemplate] = useState<PromptTemplate | null>(
    mode === "companion" ? COMPANION_BUILDER : null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setGenerated(null);
    setCopied(false);
    if (mode === "magic") {
      setTemplate(null);
      setAnswers({});
    }
  }

  async function copy() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fall back to manual select */
    }
  }

  // Step 1 (magic): pick a template
  if (mode === "magic" && !template) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-bold text-on-surface">何を作る？</p>
        {MAGIC_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTemplate(t)}
            className="flex w-full items-center gap-3 rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 text-left transition-transform active:scale-[0.98] hover:bg-surface-container-low"
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className="min-w-0">
              <span className="block font-bold text-on-surface">{t.label}</span>
              <span className="block text-xs text-on-surface-variant">{t.description}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (!template) return null;

  // Step 3: the generated prompt
  if (generated) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
          <p className="mb-2 text-xs font-bold text-primary">できた！この呪文をコピーしてね</p>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
            {generated}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "コピーした！" : "呪文をコピー"}
          </button>
        </div>
        <a
          href={CLAUDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-base font-bold text-on-secondary shadow-sm transition-transform active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">open_in_new</span>
          Claudeに貼って魔法をかける
        </a>
        <button
          type="button"
          onClick={reset}
          className="block w-full text-center text-xs text-on-surface-variant underline"
        >
          もう一度つくる
        </button>
      </div>
    );
  }

  // Step 2: answer the questions
  return (
    <div className="space-y-5">
      {template.questions.map((q) => (
        <div key={q.id}>
          <p className="mb-2 text-sm font-bold text-on-surface">{q.prompt}</p>
          {q.options ? (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const active = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                      active
                        ? "bg-primary text-on-primary"
                        : "border border-surface-variant bg-white text-on-surface"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              placeholder={q.placeholder}
              className="w-full rounded-xl border border-surface-variant bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
            />
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGenerated(buildPrompt(template, answers))}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-base font-bold text-on-primary transition-transform active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-lg">auto_awesome</span>
        呪文をつくる
      </button>
    </div>
  );
}

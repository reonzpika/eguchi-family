"use client";

import { useEffect, useState } from "react";
import { getHelp, helpForTrigger, type HelpTrigger } from "@/lib/workshop/learn";

/**
 * A dismissible, just-in-time help card. Shows the first time a step needs a
 * skill; once dismissed (per device), it stays hidden inline but remains in the
 * library. Pass either a help `entryKey` or a `trigger`.
 */
export function HelpCard({ entryKey, trigger }: { entryKey?: string; trigger?: HelpTrigger }) {
  const entry = entryKey ? getHelp(entryKey) : trigger ? helpForTrigger(trigger) : undefined;
  // start hidden to avoid a flash before localStorage is read
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!entry) return;
    setHidden(localStorage.getItem(`help_dismissed_${entry.key}`) === "1");
  }, [entry]);

  if (!entry || hidden) return null;

  function dismiss() {
    if (!entry) return;
    localStorage.setItem(`help_dismissed_${entry.key}`, "1");
    setHidden(true);
  }

  return (
    <div className="mb-4 rounded-2xl border border-secondary/40 bg-secondary-container/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-on-secondary-container">💡 {entry.title}</p>
        <button type="button" onClick={dismiss} aria-label="閉じる" className="shrink-0 text-on-surface-variant transition-transform active:scale-90">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-on-surface">{entry.body}</p>
      {entry.article && (
        <a
          href={entry.article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
        >
          もっと詳しく：{entry.article.label}
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      )}
    </div>
  );
}

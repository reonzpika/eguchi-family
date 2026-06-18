"use client";

import { useEffect, useRef, useState } from "react";
import { PicoBubble, PicoAvatar } from "./Pico";

const CLAUDE_URL = "https://claude.ai/";

type Msg = { role: "user" | "assistant"; content: string };

const KICKOFF: Record<string, string> = {
  magic: "Claudeで何か作ってみたいです。手伝ってください。",
  companion: "自分専用の相棒を作りたいです。手伝ってください。",
};

/**
 * Conversational AI prompt-builder. ピコ (via the Claude API) asks what it needs,
 * then crafts a ready-to-paste prompt. Used by lesson 1-2 (magic) and 3-2 (companion).
 */
export function PromptBuilder({ mode }: { mode: "magic" | "companion" }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  async function send(history: Msg[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prompt-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: history }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "うまくつくれませんでした。もう一度ためしてください。");
        return;
      }
      if (data.type === "prompt") {
        setFinalPrompt(data.content);
        setQuestion(null);
      } else {
        setQuestion(data.content);
        setMessages([...history, { role: "assistant", content: data.content }]);
      }
    } catch {
      setError("つうしんに失敗しました。もう一度ためしてください。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const seed: Msg[] = [{ role: "user", content: KICKOFF[mode] }];
    setMessages(seed);
    send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    const answer = input.trim();
    if (!answer || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: answer }];
    setMessages(next);
    setInput("");
    setQuestion(null);
    send(next);
  }

  function restart() {
    setFinalPrompt(null);
    setError(null);
    setQuestion(null);
    setInput("");
    const seed: Msg[] = [{ role: "user", content: KICKOFF[mode] }];
    setMessages(seed);
    send(seed);
  }

  async function copy() {
    if (!finalPrompt) return;
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* manual select fallback */
    }
  }

  // Final prompt
  if (finalPrompt) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
          <p className="mb-2 text-xs font-bold text-primary">できた！この呪文をコピーしてね</p>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
            {finalPrompt}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
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
        <button type="button" onClick={restart} className="block w-full text-center text-xs text-on-surface-variant underline">
          もう一度つくる
        </button>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5 text-center">
        <p className="mb-3 text-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          もう一度
        </button>
      </div>
    );
  }

  // Question / loading
  return (
    <div>
      {question ? (
        <PicoBubble line={question} />
      ) : (
        <div className="mb-4 flex items-center gap-3 text-sm text-on-surface-variant">
          <PicoAvatar size={40} />
          ピコが考えているよ...
        </div>
      )}
      {question && (
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ここに答えを書いてね"
            rows={2}
            className="w-full resize-none rounded-xl border border-surface-variant bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading || !input.trim()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-base font-bold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            {loading ? "考え中..." : "送信"}
          </button>
        </div>
      )}
    </div>
  );
}

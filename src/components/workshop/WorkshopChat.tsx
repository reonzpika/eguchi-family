"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PicoBubble, PicoAvatar } from "@/components/journey/Pico";

const CLAUDE_URL = "https://claude.ai/";

type Msg = { role: "user" | "assistant"; content: string };

interface StageInfo {
  key: string;
  label: string;
  emoji: string;
  goal: string;
  recipe: string;
}

/** A small copy-to-clipboard box for a mega-prompt / recipe. */
function CopyBox({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* manual select fallback */
    }
  }
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
      <p className="mb-2 text-xs font-bold text-primary">{label}</p>
      <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-on-surface">
        {text}
      </pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
          {copied ? "コピーした！" : "コピー"}
        </button>
        <a
          href={CLAUDE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-on-secondary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
          Claudeを開く
        </a>
      </div>
    </div>
  );
}

/**
 * ピコ as the workshop interface.
 * mode "gate": the readiness chat -> on ready, creates a business and goes to /business.
 * mode "stage": hands the stage recipe, takes a pasted summary, ピコ judges and either
 *   advances (saves + back to /business) or returns a continuation mega-prompt.
 */
export function WorkshopChat({
  mode,
  businessId,
  idea = "",
  stage,
}: {
  mode: "gate" | "stage";
  businessId?: string;
  idea?: string;
  stage?: StageInfo;
}) {
  const router = useRouter();

  // shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // gate state
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [readyIdea, setReadyIdea] = useState<string | null>(null);
  const [readyLine, setReadyLine] = useState<string>("");
  const started = useRef(false);

  // stage state
  const [verdict, setVerdict] = useState<{ ready: boolean; content: string; megaPrompt: string } | null>(null);
  const [done, setDone] = useState(false);

  async function gateSend(history: Msg[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workshop/pico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "gate", messages: history }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "うまくいきませんでした。");
        return;
      }
      if (data.type === "ready") {
        setReadyIdea(data.idea);
        setReadyLine(data.content);
        setQuestion(null);
      } else {
        setQuestion(data.content);
        setMessages([...history, { role: "assistant", content: data.content }]);
      }
    } catch {
      setError("つうしんに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode !== "gate" || started.current) return;
    started.current = true;
    const seed: Msg[] = [{ role: "user", content: "アイデアができました。見てください。" }];
    setMessages(seed);
    gateSend(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function gateSubmit() {
    const answer = input.trim();
    if (!answer || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: answer }];
    setMessages(next);
    setInput("");
    setQuestion(null);
    gateSend(next);
  }

  async function startBusiness() {
    if (!readyIdea || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workshop/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: readyIdea }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "はじめられませんでした。");
        return;
      }
      router.push("/business");
      router.refresh();
    } catch {
      setError("つうしんに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function judge() {
    const summary = input.trim();
    if (!summary || loading || !stage) return;
    setLoading(true);
    setError(null);
    setVerdict(null);
    try {
      const res = await fetch("/api/workshop/pico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "judge", stage: stage.key, idea, summary }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "うまくいきませんでした。");
        return;
      }
      const v = { ready: !!data.ready, content: data.content ?? "", megaPrompt: data.megaPrompt ?? "" };
      setVerdict(v);
      // record the summary (advances the stage only on a ready verdict)
      if (businessId) {
        await fetch("/api/workshop/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: businessId,
            stage: stage.key,
            summary,
            verdict: v.ready ? "ready" : "retry",
          }),
        });
      }
      if (v.ready) setDone(true);
    } catch {
      setError("つうしんに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  // ---------- GATE ----------
  if (mode === "gate") {
    if (error) {
      return <p className="rounded-2xl bg-surface-container-lowest p-5 text-center text-sm text-on-surface-variant">{error}</p>;
    }
    if (readyIdea) {
      return (
        <div className="space-y-4">
          <PicoBubble line={readyLine || "いいね！これは面白いよ。一緒に形にしよう！"} size={52} />
          <div className="rounded-2xl border border-primary/30 bg-primary-container/30 p-4">
            <p className="mb-1 text-xs font-bold text-primary">あなたのアイデア</p>
            <p className="text-sm text-on-surface">{readyIdea}</p>
          </div>
          <button
            type="button"
            onClick={startBusiness}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined">rocket_launch</span>
            {loading ? "はじめています..." : "このアイデアでビジネスをはじめる"}
          </button>
        </div>
      );
    }
    return (
      <div>
        {question ? (
          <PicoBubble line={question} size={52} />
        ) : (
          <div className="mb-4 flex items-center gap-3 text-sm text-on-surface-variant">
            <PicoAvatar size={44} />
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
              onClick={gateSubmit}
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

  // ---------- STAGE ----------
  if (!stage) return null;

  if (done && verdict?.ready) {
    return (
      <div className="space-y-4 text-center">
        <PicoBubble line={verdict.content || `「${stage.label}」クリア！よくやったね、ほんとにすごいよ。`} size={52} />
        <button
          type="button"
          onClick={() => {
            router.push("/business");
            router.refresh();
          }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary transition-transform active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          つぎへ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PicoBubble line={`${stage.emoji} ${stage.goal}`} size={52} />

      {/* 1. the recipe to use in their Claude project */}
      <CopyBox text={stage.recipe} label="① このレシピをClaudeで使ってね" />

      {/* ピコ's feedback if not ready yet, plus a continuation prompt */}
      {verdict && !verdict.ready && (
        <>
          <PicoBubble line={verdict.content || "いい線だよ。もう少しだけ深めてみよう。"} size={44} />
          {verdict.megaPrompt && <CopyBox text={verdict.megaPrompt} label="つづきは、これをClaudeに貼ってね" />}
        </>
      )}

      {/* 2. paste the summary back */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-on-surface">② おわったら、まとめを貼ってね</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Claudeが作った「まとめ」をここに貼ってね"
          rows={4}
          className="w-full resize-none rounded-xl border border-surface-variant bg-white p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={judge}
          disabled={loading || !input.trim()}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-base font-bold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">send</span>
          {loading ? "ピコが読んでいるよ..." : "ピコに見てもらう"}
        </button>
        {error && <p className="text-center text-sm text-on-surface-variant">{error}</p>}
      </div>
    </div>
  );
}

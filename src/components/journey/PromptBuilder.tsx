"use client";

import { useEffect, useRef, useState } from "react";
import { PicoBubble, PicoAvatar } from "./Pico";

const CLAUDE_URL = "https://claude.ai/";

type Msg = { role: "user" | "assistant"; content: string };

type Preset = { id: string; emoji: string; label: string };
type Track = { id: string; emoji: string; label: string; presets: Preset[] };

// The magic-hook menu. Each tap seeds a strong creative brief; the member just
// adds their own idea + a vibe, then Claude fills the rest boldly.
const TRACKS: Track[] = [
  {
    id: "game",
    emoji: "🎮",
    label: "ゲーム",
    presets: [
      { id: "quiz", emoji: "❓", label: "○×クイズ" },
      { id: "omikuji", emoji: "🔮", label: "占い・おみくじ" },
      { id: "memory", emoji: "🃏", label: "記憶ゲーム" },
      { id: "raise", emoji: "🌱", label: "タップ育成" },
      { id: "roulette", emoji: "🎯", label: "ルーレットで決める" },
    ],
  },
  {
    id: "site",
    emoji: "🌐",
    label: "ウェブサイト・ツール",
    presets: [
      { id: "about", emoji: "🙋", label: "自己紹介ページ" },
      { id: "card", emoji: "🎉", label: "お祝いカード" },
      { id: "countdown", emoji: "⏳", label: "カウントダウン" },
      { id: "gallery", emoji: "🖼️", label: "思い出ギャラリー" },
      { id: "habit", emoji: "✅", label: "習慣トラッカー" },
    ],
  },
];

const KICKOFF_COMPANION = "自分専用の相棒を作りたいです。手伝ってください。";

const seedForPreset = (trackLabel: string, label: string) =>
  `「${label}」（${trackLabel}）を作りたい。まず私自身のアイデア（テーマ・中身）をひとつ聞いて、次に雰囲気を聞いて、あとはあなたが大胆に楽しく考えて。`;
const SEED_SURPRISE =
  "おまかせで作りたい（ゲームでもページでもOK）。私の「好きなこと・興味」をひとつ聞いて、あとはぜんぶあなたが楽しく考えて。";
const SEED_FREE =
  "自分で作りたいものを考えたい。何が作れるか具体例も出しながら、何を作りたいか聞いて。";

/**
 * Conversational AI prompt-builder. For the magic hook (mode "magic") the member
 * first taps a preset, then ピコ asks 1-2 short questions (with tappable example
 * suggestions) and crafts a ready-to-paste mega-prompt. mode "companion" skips
 * the picker and goes straight to the conversation.
 */
export function PromptBuilder({ mode }: { mode: "magic" | "companion" }) {
  const [phase, setPhase] = useState<"pick" | "chat">(
    mode === "magic" ? "pick" : "chat"
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  async function send(history: Msg[]) {
    setLoading(true);
    setError(null);
    setSuggestions([]);
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
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setMessages([...history, { role: "assistant", content: data.content }]);
      }
    } catch {
      setError("つうしんに失敗しました。もう一度ためしてください。");
    } finally {
      setLoading(false);
    }
  }

  // Companion mode has no picker; start the conversation on mount.
  useEffect(() => {
    if (mode !== "companion" || started.current) return;
    started.current = true;
    const seed: Msg[] = [{ role: "user", content: KICKOFF_COMPANION }];
    setMessages(seed);
    send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start(seedText: string) {
    const seed: Msg[] = [{ role: "user", content: seedText }];
    setMessages(seed);
    setPhase("chat");
    setFinalPrompt(null);
    setError(null);
    setQuestion(null);
    setInput("");
    send(seed);
  }

  function submit() {
    const answer = input.trim();
    if (!answer || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: answer }];
    setMessages(next);
    setInput("");
    setQuestion(null);
    setSuggestions([]);
    send(next);
  }

  function addSuggestion(s: string) {
    setInput((prev) => (prev.trim() ? `${prev.trim()}、${s}` : s));
  }

  function restart() {
    setFinalPrompt(null);
    setError(null);
    setQuestion(null);
    setSuggestions([]);
    setInput("");
    if (mode === "magic") {
      setMessages([]);
      setPhase("pick");
    } else {
      const seed: Msg[] = [{ role: "user", content: KICKOFF_COMPANION }];
      setMessages(seed);
      send(seed);
    }
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

  // Preset picker (magic mode, before the conversation)
  if (phase === "pick") {
    return (
      <div className="space-y-5">
        <PicoBubble line="何を作ってみる？ えらんでね（あとから自由に変えられるよ）" />
        {TRACKS.map((track) => (
          <div key={track.id}>
            <p className="mb-2 text-xs font-bold text-on-surface-variant">
              {track.emoji} {track.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {track.presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => start(seedForPreset(track.label, p.label))}
                  className="rounded-full border border-surface-variant bg-white px-3 py-2 text-sm text-on-surface transition-transform active:scale-95"
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => start(SEED_SURPRISE)}
            className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-on-secondary transition-transform active:scale-95"
          >
            🎲 おまかせ
          </button>
          <button
            type="button"
            onClick={() => start(SEED_FREE)}
            className="rounded-full border border-surface-variant bg-white px-3 py-2 text-sm text-on-surface transition-transform active:scale-95"
          >
            ✏️ 自分で考える
          </button>
        </div>
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
          {suggestions.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs text-on-surface-variant">タップで追加できるよ：</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addSuggestion(s)}
                    className="rounded-full border border-primary/40 bg-primary-container/40 px-3 py-1.5 text-xs text-on-surface transition-transform active:scale-95"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
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

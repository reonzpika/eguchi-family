"use client";

import { useEffect, useRef, useState } from "react";
import { PicoAvatar } from "@/components/journey/Pico";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "やあ！ぼくピコ。なんでもきいてね 😊 作りたいもの、調べたいこと、こまっていること、なんでもどうぞ。";

/** ピコ, the flexible conversational helper (free chat, web-search-capable). */
export function PicoChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workshop/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        let msg = "うまくいきませんでした。";
        try {
          const d = await res.json();
          if (d?.error) msg = d.error;
        } catch {
          /* not json */
        }
        setError(msg);
        return;
      }
      // stream the reply in as it arrives
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let started = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        acc += chunk;
        if (!started) {
          started = true;
          setLoading(false);
        }
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      if (!started) {
        setMessages([...next, { role: "assistant", content: "うまくいきませんでした。もう一度ためしてね。" }]);
      }
    } catch {
      setError("つうしんに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 pb-32 pt-6 text-on-surface">
      <div className="flex-1 space-y-4">
        {/* greeting */}
        <div className="flex items-start gap-3">
          <PicoAvatar size={44} />
          <div className="mt-1 max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary-container px-4 py-3 text-sm leading-relaxed text-on-secondary-container">
            {GREETING}
          </div>
        </div>

        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="flex items-start gap-3">
              <PicoAvatar size={44} />
              <div className="mt-1 max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary-container px-4 py-3 text-sm leading-relaxed text-on-secondary-container">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-on-primary">
                {m.content}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <PicoAvatar size={40} />
            ピコが考えているよ...
          </div>
        )}
        {error && <p className="text-center text-sm text-on-surface-variant">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div className="sticky bottom-24 mt-4 flex items-end gap-2 rounded-2xl border border-surface-variant bg-white p-2 shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="ピコに きいてみる..."
          rows={1}
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-transform active:scale-90 disabled:opacity-40"
          aria-label="送信"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </div>
    </div>
  );
}

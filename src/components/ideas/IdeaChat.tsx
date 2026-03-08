"use client";

import { useRef, useEffect, useState } from "react";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";

export interface ChatMessage {
  role: "agent" | "user";
  content: string;
  options?: string[];
}

interface IdeaChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  inputPlaceholder?: string;
}

export function IdeaChat({
  messages,
  onSendMessage,
  isLoading = false,
  inputPlaceholder = "メッセージを入力...",
}: IdeaChatProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const lastAgentMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === "agent") {
      lastAgentMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            ref={i === messages.length - 1 && msg.role === "agent" ? lastAgentMessageRef : undefined}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "bg-white border border-border-warm text-foreground"
              }`}
            >
              <ChatMarkdown>{msg.content}</ChatMarkdown>
              {msg.options && msg.options.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.options.map((opt, j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => onSendMessage(opt)}
                      disabled={isLoading}
                      className="rounded-lg border border-current px-3 py-1.5 text-xs font-medium opacity-90 hover:opacity-100 disabled:opacity-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border-warm bg-white px-4 py-3 text-sm text-muted">
              ...
            </div>
          </div>
        )}
      </div>
      <div ref={endRef} />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={isLoading}
          className="min-h-[48px] flex-1 rounded-xl border border-border-warm bg-white px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[48px] rounded-xl bg-primary px-4 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  );
}


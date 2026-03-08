"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

type ChatMessage = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  chat_history?: ChatMessage[] | null;
  chat_summary?: string | null;
}

/** Minimum new messages in this session to consider "substantial" and run AI update on exit. */
const SUBSTANTIAL_THRESHOLD = 1;

export default function IdeaChatPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAgentMessageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const skipNextScrollRef = useRef(false);
  const initialHistoryLengthRef = useRef<number>(0);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const SCROLL_THRESHOLD = 50;

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  useEffect(() => {
    if (!ideaId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (!res.ok) {
          if (res.status === 404 || res.status === 403) {
            router.push("/ideas");
            return;
          }
          throw new Error("Failed to fetch idea");
        }
        const data = (await res.json()) as Idea;
        setIdea(data);
        const history = data.chat_history && Array.isArray(data.chat_history) ? data.chat_history : [];
        setChatHistory(history);
        initialHistoryLengthRef.current = history.length;
        if (history.length > 0) skipNextScrollRef.current = true;
        if (data.chat_summary) setShowSummaryModal(true);
      } catch (err) {
        console.error(err);
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    })();
  }, [ideaId, router]);

  useEffect(() => {
    if (chatHistory.length === 0) return;
    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      return;
    }
    const last = chatHistory[chatHistory.length - 1];
    if (last.role === "agent") {
      lastAgentMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    lastScrollTopRef.current = el.scrollTop;
    const onScroll = () => {
      const top = el.scrollTop;
      const prev = lastScrollTopRef.current;
      lastScrollTopRef.current = top;
      if (top > SCROLL_THRESHOLD && top > prev) {
        setHeaderHidden(true);
      } else if (top <= SCROLL_THRESHOLD || top < prev) {
        setHeaderHidden(false);
      }
      const distFromBottom = el.scrollHeight - top - el.clientHeight;
      setShowScrollToBottom(distFromBottom > 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const hasSubstantialChanges =
    chatHistory.length > initialHistoryLengthRef.current &&
    chatHistory.length - initialHistoryLengthRef.current >= SUBSTANTIAL_THRESHOLD;

  const runSaveAndNavigate = async () => {
    if (!idea) return;
    if (!hasSubstantialChanges) {
      router.push(`/ideas/${idea.id}`);
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/ideas/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id, chatHistory }),
      });
    } finally {
      router.push(`/ideas/${idea.id}`);
    }
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      if (!ideaId || chatHistoryRef.current.length <= initialHistoryLengthRef.current) return;
      if (chatHistoryRef.current.length - initialHistoryLengthRef.current < SUBSTANTIAL_THRESHOLD) return;
      const payload = JSON.stringify({
        ideaId: ideaId,
        chatHistory: chatHistoryRef.current,
      });
      navigator.sendBeacon(
        "/api/ideas/chat/save",
        new Blob([payload], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [ideaId]);

  const handleSendMessage = async (message: string) => {
    if (!idea || !message.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setCurrentInput("");
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch("/api/ideas/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          message,
          chatHistory: updatedHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "メッセージの送信に失敗しました");
      }

      const data = await response.json();
      setChatHistory([
        ...updatedHistory,
        {
          role: "agent",
          content: data.message,
          options: data.options ?? undefined,
        },
      ]);
      setChatError(null);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : "メッセージの送信に失敗しました"
      );
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {showSummaryModal && idea?.chat_summary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowSummaryModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-modal-title"
        >
          <div
            className="scrollbar-hide max-h-[80vh] w-full max-w-[350px] overflow-y-auto rounded-2xl border border-border-warm bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="summary-modal-title" className="mb-1 text-xs font-semibold text-muted">
              これまでの話
            </p>
            <p className="mb-4 text-sm text-foreground">{idea.chat_summary}</p>
            <button
              type="button"
              onClick={() => setShowSummaryModal(false)}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-transform active:scale-[0.98]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      <div
        className={`shrink-0 overflow-hidden transition-[height] duration-200 ease-out ${
          headerHidden ? "h-0" : "h-[69px]"
        }`}
      >
        <header
          data-testid="idea-chat-header"
          className={`sticky top-0 z-10 border-b border-border-warm bg-white px-4 py-3 transition-transform duration-200 ease-out ${
            headerHidden ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={runSaveAndNavigate}
              disabled={saving}
              className="flex h-11 w-11 min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-border-warm bg-white text-base transition-transform active:scale-[0.97] disabled:opacity-70"
            >
              {saving ? "…" : "←"}
            </button>
            <h2 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
              {idea.title || "このアイデアについて話す"}
            </h2>
            <div className="h-11 w-11 min-h-[44px]" aria-hidden />
          </div>
        </header>
      </div>

      <div
        className={`flex flex-1 flex-col overflow-hidden px-5 ${
          headerHidden ? "pt-0 pb-4" : "py-4"
        }`}
      >
        {chatError && (
          <div className="shrink-0 mb-4">
            <ErrorMessage message={chatError} />
          </div>
        )}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            data-testid="idea-chat-scroll"
            className="scrollbar-hide h-full space-y-4 overflow-y-auto pb-4"
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                ref={idx === chatHistory.length - 1 && msg.role === "agent" ? lastAgentMessageRef : undefined}
              >
                {msg.role === "agent" ? (
                  <div className="flex flex-col gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white">
                      <ChatMarkdown>{msg.content}</ChatMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-border-warm bg-white px-4 py-3 text-sm text-foreground">
                      <ChatMarkdown>{msg.content}</ChatMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {showScrollToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label="最新メッセージへ"
              className="absolute bottom-6 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-border-warm bg-white shadow-md text-foreground transition-transform active:scale-[0.95]"
            >
              ↓
            </button>
          )}
        </div>
        <div className="border-t border-border-warm bg-white pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(currentInput);
                }
              }}
              placeholder="メッセージを入力..."
              disabled={chatLoading}
              className="flex-1 rounded-xl border border-border-warm bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleSendMessage(currentInput)}
              disabled={!currentInput.trim() || chatLoading}
              className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

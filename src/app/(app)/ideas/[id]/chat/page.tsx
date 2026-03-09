"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ChatScrollArea } from "@/components/chat/ChatScrollArea";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useChatScroll } from "@/hooks/useChatScroll";

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

type PageProps = { params: Promise<{ id: string }> };

export default function IdeaChatPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ideaId = resolvedParams.id;
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const initialHistoryLengthRef = useRef<number>(0);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const {
    scrollContainerRef,
    messagesEndRef,
    lastAgentMessageRef,
    showScrollToBottom,
    scrollToBottom,
    setSkipNextScroll,
  } = useChatScroll({
    chatHistory,
    skipInitialScroll: true,
  });

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
        const history =
          data.chat_history && Array.isArray(data.chat_history)
            ? data.chat_history
            : [];
        setChatHistory(history);
        initialHistoryLengthRef.current = history.length;
        if (history.length > 0) setSkipNextScroll(true);
        if (data.chat_summary) setShowSummaryModal(true);
      } catch (err) {
        console.error(err);
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    })();
  }, [ideaId, router, setSkipNextScroll]);

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
      if (
        !ideaId ||
        chatHistoryRef.current.length <= initialHistoryLengthRef.current
      )
        return;
      if (
        chatHistoryRef.current.length - initialHistoryLengthRef.current <
        SUBSTANTIAL_THRESHOLD
      )
        return;
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
            <p
              id="summary-modal-title"
              className="mb-1 text-xs font-semibold text-muted"
            >
              これまでの話
            </p>
            <p className="mb-4 text-sm text-foreground">
              {idea.chat_summary}
            </p>
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
      <ChatHeader
        onBack={runSaveAndNavigate}
        title={idea.title || "このアイデアについて話す"}
        backDisabled={saving}
        data-testid="idea-chat-header"
      >
        <span className="w-11" aria-hidden />
      </ChatHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
        {chatError && (
          <div className="shrink-0 mb-4">
            <ErrorMessage message={chatError} />
          </div>
        )}
        <ChatScrollArea
          ref={scrollContainerRef}
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
          data-testid="idea-chat-scroll"
        >
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              ref={
                idx === chatHistory.length - 1 && msg.role === "agent"
                  ? lastAgentMessageRef
                  : undefined
              }
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
        </ChatScrollArea>
        <ChatFooter
          value={currentInput}
          onChange={setCurrentInput}
          onSend={() => handleSendMessage(currentInput)}
          disabled={chatLoading}
        />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ChatScrollArea } from "@/components/chat/ChatScrollArea";
import { useChatScroll } from "@/hooks/useChatScroll";

type Message = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

export default function NewIdeaPage() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [startLoading, setStartLoading] = useState(true);
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null);
  const [ideaTitle, setIdeaTitle] = useState<string>("アイデアを育てる");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    scrollContainerRef,
    messagesEndRef,
    lastAgentMessageRef,
    showScrollToBottom,
    scrollToBottom,
  } = useChatScroll({ chatHistory });

  const saveDraft = useCallback(async (): Promise<{ ideaId: string; title: string } | null> => {
    if (chatHistory.length === 0) return null;
    setSaveLoading(true);
    try {
      const response = await fetch("/api/ideas/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          savedIdeaId ? { chatHistory, ideaId: savedIdeaId } : { chatHistory }
        ),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました");
      }
      const data = await response.json();
      setSavedIdeaId(data.ideaId);
      if (data.title) setIdeaTitle(data.title);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return { ideaId: data.ideaId, title: data.title };
    } catch (err) {
      console.error("Save draft:", err);
      setChatError(err instanceof Error ? err.message : "保存に失敗しました");
      return null;
    } finally {
      setSaveLoading(false);
    }
  }, [chatHistory, savedIdeaId]);

  const handleBack = useCallback(async () => {
    if (chatHistory.length > 0 && !savedIdeaId) {
      const result = await saveDraft();
      if (result) router.push("/ideas");
      else return;
    } else {
      router.push("/ideas");
    }
  }, [chatHistory.length, savedIdeaId, saveDraft, router]);

  // Start chat on mount (no pastedText)
  const startChat = useCallback(async () => {
    setStartLoading(true);
    setChatError(null);
    try {
      const response = await fetch("/api/ideas/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start chat");
      }

      const data = await response.json();
      if (data.error) {
        setChatError(data.error);
      } else {
        setSessionId(data.sessionId);
        setChatHistory([
          {
            role: "agent",
            content: data.firstMessage,
            options: data.options ?? undefined,
          },
        ]);
        setChatError(null);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      setChatError(
        error instanceof Error
          ? error.message
          : "チャットの開始に失敗しました。もう一度お試しください。"
      );
    } finally {
      setStartLoading(false);
    }
  }, []);

  useEffect(() => {
    startChat();
  }, [startChat]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || chatLoading) return;

    const userMessage: Message = { role: "user", content: message };
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
          ...(savedIdeaId ? { ideaId: savedIdeaId } : { sessionId }),
          message,
          chatHistory: updatedHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "メッセージの送信に失敗しました");
      }

      const data = await response.json();
      if (data.error) {
        setChatError(data.error);
      } else {
        setChatHistory([
          ...updatedHistory,
          {
            role: "agent",
            content: data.message,
            options: data.options ?? undefined,
          },
        ]);
        setChatError(null);
        if (data.isComplete) {
          setIsComplete(true);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatError(
        error instanceof Error ? error.message : "メッセージの送信に失敗しました"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    handleSendMessage(option);
  };

  const handleViewResult = useCallback(async () => {
    if (savedIdeaId) {
      router.push(`/ideas/new-result?id=${savedIdeaId}`);
      return;
    }
    const result = await saveDraft();
    if (result) router.push(`/ideas/new-result?id=${result.ideaId}`);
  }, [savedIdeaId, saveDraft, router]);

  const handleRename = useCallback(async () => {
    if (!savedIdeaId || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const response = await fetch(`/api/ideas/${savedIdeaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (!response.ok) throw new Error("保存に失敗しました");
      setIdeaTitle(renameValue.trim());
      setRenameOpen(false);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "タイトルの更新に失敗しました");
    } finally {
      setRenameLoading(false);
    }
  }, [savedIdeaId, renameValue]);

  useEffect(() => {
    function closeMenu(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  if (startLoading && chatHistory.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-10 border-b border-border-warm bg-white px-5 py-4">
          <Link
            href="/ideas"
            className="inline-flex h-11 w-11 min-h-[44px] items-center justify-center rounded-lg border border-border-warm bg-white text-base"
          >
            ←
          </Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-8">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
          <p className="text-sm text-muted">準備しています...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ChatHeader onBack={handleBack} title={ideaTitle} backDisabled={saveLoading}>
        {saveSuccess && (
          <span className="text-xs text-success">保存しました</span>
        )}
        <button
          type="button"
          onClick={() => saveDraft()}
          disabled={saveLoading || chatHistory.length === 0}
          className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          {saveLoading ? "保存中..." : "保存"}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 min-h-[44px] items-center justify-center rounded-lg border border-border-warm bg-white text-foreground transition-transform active:scale-[0.97]"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-border-warm bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setRenameValue(ideaTitle);
                  setRenameOpen(true);
                  setMenuOpen(false);
                }}
                disabled={!savedIdeaId}
                className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm disabled:opacity-50"
              >
                タイトルを変更
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (savedIdeaId)
                    router.push(`/ideas/${savedIdeaId}/validate`);
                }}
                disabled={!savedIdeaId}
                className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm disabled:opacity-50"
              >
                プロジェクトに昇格
              </button>
            </div>
          )}
        </div>
      </ChatHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
        <div className="shrink-0 mb-4 text-center">
          <p className="text-sm text-muted">
            AIコーチと一緒にアイデアを整理しましょう
          </p>
        </div>

        {chatError && (
          <div className="shrink-0 mb-4">
            <ErrorMessage message={chatError} />
          </div>
        )}

        <ChatScrollArea
          ref={scrollContainerRef}
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
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
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(option)}
                          disabled={chatLoading || isComplete}
                          className="rounded-full border-2 border-primary bg-white px-4 py-2 text-xs font-semibold text-primary transition-transform active:scale-[0.95] disabled:opacity-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
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

        {!isComplete && (
          <ChatFooter
            value={currentInput}
            onChange={setCurrentInput}
            onSend={() => handleSendMessage(currentInput)}
            disabled={chatLoading}
            showOptionsHint={
              chatHistory.length > 0 &&
              !!chatHistory[chatHistory.length - 1].options
            }
          />
        )}

        {isComplete && (
          <button
            type="button"
            onClick={handleViewResult}
            disabled={saveLoading}
            className="mt-4 min-h-[44px] w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            結果を見る
          </button>
        )}
      </div>

      {renameOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-warm bg-white p-4 shadow-lg">
            <p className="mb-3 text-sm font-semibold text-foreground">タイトルを変更</p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mb-4 w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              placeholder="アイデアのタイトル"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRenameOpen(false)}
                className="min-h-[44px] flex-1 rounded-xl border border-border-warm bg-white font-semibold text-foreground"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleRename}
                disabled={renameLoading || !renameValue.trim()}
                className="min-h-[44px] flex-1 rounded-xl bg-primary font-semibold text-white disabled:opacity-50"
              >
                {renameLoading ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

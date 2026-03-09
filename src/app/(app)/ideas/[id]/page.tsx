"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BusinessSummary } from "@/components/ideas/BusinessSummary";
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
  ai_suggestions: {
    suggestions?: string[];
    nextStep?: string;
  } | null;
  user_id: string;
  chat_history?: ChatMessage[] | null;
  chat_summary?: string | null;
}

type PageProps = { params: Promise<{ id: string }> };

export default function IdeaDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ideaId = resolvedParams.id;
  const { data: session } = useSession();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
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
    setSkipNextScroll,
  } = useChatScroll({ chatHistory, skipInitialScroll: true });

  useEffect(() => {
    if (idea?.chat_history && Array.isArray(idea.chat_history)) {
      const history = idea.chat_history;
      setChatHistory(history);
      if (history.length > 0) setSkipNextScroll(true);
    }
  }, [idea?.id, idea?.chat_history, setSkipNextScroll]);

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
      if (data.isComplete) setIsComplete(true);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "メッセージの送信に失敗しました");
    } finally {
      setChatLoading(false);
    }
  };

  const refetchIdea = useCallback(async () => {
    if (!ideaId || !session?.user?.id) return;
    const res = await fetch(`/api/ideas/${ideaId}`);
    if (!res.ok) return;
    const data = (await res.json()) as Idea;
    setIdea(data);
  }, [ideaId, session?.user?.id]);

  const handleSaveDraft = useCallback(async () => {
    if (!idea || chatHistory.length === 0) return;
    setSaveLoading(true);
    try {
      const response = await fetch("/api/ideas/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id, chatHistory }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました");
      }
      const data = await response.json();
      if (data.title) setTitle(data.title);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await refetchIdea();
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaveLoading(false);
    }
  }, [idea, chatHistory, refetchIdea]);

  const handleRename = useCallback(async () => {
    if (!idea || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (!response.ok) throw new Error("保存に失敗しました");
      setTitle(renameValue.trim());
      setRenameOpen(false);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "タイトルの更新に失敗しました");
    } finally {
      setRenameLoading(false);
    }
  }, [idea, renameValue]);

  useEffect(() => {
    function closeMenu(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    async function fetchIdea() {
      if (!ideaId || !session?.user?.id) {
        setLoading(false);
        return;
      }

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
        setTitle(data.title);
        setIsOwner(true);
      } catch (error) {
        console.error("Error:", error);
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, session?.user?.id, router]);

  const handleSave = async () => {
    if (!idea || !title.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setSaved(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving idea:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!idea || !isOwner) {
    return null;
  }

  const isDraft =
    idea.chat_history &&
    Array.isArray(idea.chat_history) &&
    idea.chat_history.length > 0 &&
    !idea.polished_content;

  const nextStep = idea.ai_suggestions?.nextStep || "";

  const summary = {
    ideaPitch: idea.polished_content || undefined,
    nextStep: nextStep || undefined,
  };

  const hasSummary = summary.ideaPitch || summary.nextStep;

  if (isDraft) {
    return (
      <div className="flex h-full flex-col">
        <ChatHeader
          onBack={() => router.push("/ideas")}
          title={title || "アイデアを育てる"}
        >
          {saveSuccess && (
            <span className="text-xs text-success">保存しました</span>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
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
                    setRenameValue(title);
                    setRenameOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm"
                >
                  タイトルを変更
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/ideas/${idea.id}/validate`);
                  }}
                  className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm"
                >
                  プロジェクトに昇格
                </button>
              </div>
            )}
          </div>
        </ChatHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
          {idea.chat_summary && (
            <div className="mb-4 shrink-0 rounded-2xl border border-border-warm bg-white p-4">
              <p className="mb-1 text-xs font-semibold text-muted">
                これまでの話
              </p>
              <p className="text-sm text-foreground">{idea.chat_summary}</p>
            </div>
          )}
          {chatError && (
            <div className="mb-4 shrink-0">
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
            />
          )}
          {isComplete && (
            <button
              type="button"
              onClick={() => router.push(`/ideas/new-result?id=${idea.id}`)}
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border-warm bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/ideas"
            className="flex h-11 w-11 min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-border-warm bg-white text-base"
          >
            ←
          </Link>
          <h2 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
            {title || "アイデア"}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-success">保存しました</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
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
                      setRenameValue(title);
                      setRenameOpen(true);
                      setMenuOpen(false);
                    }}
                    className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm"
                  >
                    タイトルを変更
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/ideas/${idea.id}/validate`);
                    }}
                    className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-foreground hover:bg-bg-warm"
                  >
                    プロジェクトに昇格
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-5 w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-lg font-bold text-foreground focus:border-primary focus:outline-none"
          placeholder="アイデアのタイトル"
        />

        {hasSummary ? (
          <BusinessSummary
            summary={summary}
            onSaveIdea={handleSave}
            onPromoteToProject={() => router.push(`/ideas/${idea.id}/validate`)}
            isSaved={saved}
            saving={saving}
            hideActions
          />
        ) : (
          <>
            <div className="mb-5 rounded-2xl border border-border-warm bg-white p-4">
              <p className="text-sm text-muted">AIが整理した内容がここに表示されます。</p>
            </div>
          </>
        )}

        <Link
          href={`/ideas/${idea.id}/chat`}
          className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
        >
          このアイデアについて話す
        </Link>
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

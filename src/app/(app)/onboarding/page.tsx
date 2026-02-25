"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

type Step = 1 | 2 | 3 | "chat";

type Message = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

const PROMPT_TEXT = `私はビジネスアイデアを考えているのですが、まだはっきりとした形になっていません。
一度に一つずつ質問しながら、私のアイデアを一緒に整理してもらえますか？

まず最初に「どんなビジネスをやってみたいか、一言で教えてください」と聞いてください。`;

const AI_TOOLS = [
  { name: "ChatGPT", emoji: "🤖", url: "https://chat.openai.com", recommended: true },
  { name: "Claude", emoji: "✨", url: "https://claude.ai", recommended: false },
  { name: "Perplexity", emoji: "🔍", url: "https://perplexity.ai", recommended: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load selected tool from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("selectedAITool");
      if (stored) {
        setSelectedTool(stored);
      }
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (step === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, step]);

  const handleToolSelect = (toolName: string, url: string) => {
    setSelectedTool(toolName);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedAITool", toolName);
      sessionStorage.setItem("selectedAIToolUrl", url);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_TEXT);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleOpenAITool = () => {
    if (typeof window !== "undefined") {
      const url = sessionStorage.getItem("selectedAIToolUrl");
      if (url) {
        window.open(url, "_blank");
      }
    }
  };

  const handleStartChat = async () => {
    if (pastedText.length < 20) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ideas/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastedText }),
      });

      if (!response.ok) {
        throw new Error("Failed to start chat");
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
            options: data.options,
          },
        ]);
        setStep("chat");
        setChatError(null);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      setChatError("チャットの開始に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || chatLoading) return;

    const userMessage: Message = { role: "user", content: message };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setCurrentInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/ideas/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          chatHistory: updatedHistory,
          pastedText,
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
            options: data.options,
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

  const handleFinalize = async () => {
    setIsLoading(true);
    setFinalizeError(null);
    try {
      const response = await fetch("/api/ideas/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, chatHistory, pastedText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "アイデアの保存に失敗しました");
      }

      const data = await response.json();
      if (data.error) {
        setFinalizeError(data.error);
      } else {
        router.push(`/ideas/new-result?id=${data.ideaId}`);
      }
    } catch (error) {
      console.error("Error finalizing:", error);
      setFinalizeError(
        error instanceof Error ? error.message : "アイデアの保存に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Progress bar (hidden during chat)
  const showProgress = step !== "chat";

  return (
    <div className="flex min-h-screen flex-col">
      {showProgress && (
        <div className="border-b border-border-warm bg-white px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-warm bg-white text-base"
            >
              ←
            </Link>
            <div className="text-xs text-muted">ステップ {step} / 3</div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded ${
                  s <= step ? "bg-primary" : "bg-border-warm"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Step 1: Tool Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-2 text-lg font-extrabold text-foreground">
                AIツールを選んでください
              </h3>
              <p className="text-sm text-muted">
                無料のAIツールでアイデアを育てます。どれを使いますか？
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {AI_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name, tool.url)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    selectedTool === tool.name
                      ? "border-primary bg-primary-light"
                      : "border-border-warm bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-foreground">{tool.name}</div>
                      {tool.recommended && (
                        <div className="text-xs text-primary">★ おすすめ</div>
                      )}
                    </div>
                    {selectedTool === tool.name && (
                      <span className="text-lg text-primary">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted">
              迷ったらChatGPTがおすすめです
            </p>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedTool}
              className={`mt-auto rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] ${
                selectedTool ? "bg-primary" : "bg-muted opacity-50"
              }`}
            >
              次へ →
            </button>
          </div>
        )}

        {/* Step 2: Copy Prompt */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-2 text-lg font-extrabold text-foreground">
                プロンプトをコピーしてください
              </h3>
              <p className="text-sm text-muted">
                下のボタンを押してコピーし、AIツールに貼り付けてください。
              </p>
            </div>

            <div className="rounded-xl border border-border-warm bg-bg-warm p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {PROMPT_TEXT}
              </pre>
            </div>

            <button
              onClick={handleCopyPrompt}
              className={`rounded-xl px-5 py-3.5 font-semibold transition-transform active:scale-[0.98] ${
                hasCopied
                  ? "bg-success text-white"
                  : "bg-primary text-white"
              }`}
            >
              {hasCopied ? "✓ コピーしました！" : "プロンプトをコピーする"}
            </button>

            <button
              onClick={handleOpenAITool}
              className="rounded-xl border-2 border-primary bg-white px-5 py-3.5 font-semibold text-primary transition-transform active:scale-[0.98]"
            >
              AIツールを開く ↗
            </button>

            <p className="text-center text-xs text-muted">
              AIと話し終わったら次のステップへ
            </p>

            <button
              onClick={() => setStep(3)}
              disabled={!hasCopied}
              className={`mt-auto rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] ${
                hasCopied ? "bg-primary" : "bg-muted opacity-50"
              }`}
            >
              AIと話し終わりました → 次へ
            </button>
          </div>
        )}

        {/* Step 3: Paste Output */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-2 text-lg font-extrabold text-foreground">
                AIの返答を貼り付けてください
              </h3>
              <p className="text-sm text-muted">
                AIとの会話の結果をここに貼り付けてください。あとはEguchi HubのAIがサポートします！
              </p>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="ここに貼り付け..."
              className="min-h-[180px] rounded-xl border border-border-warm bg-white p-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />

            {chatError && (
              <ErrorMessage message={chatError} />
            )}

            <button
              onClick={handleStartChat}
              disabled={pastedText.length < 20 || isLoading}
              className={`rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] ${
                pastedText.length >= 20 && !isLoading
                  ? "bg-primary"
                  : "bg-muted opacity-50"
              }`}
            >
              {isLoading ? "整理中..." : "AIに整理してもらう ✨"}
            </button>
          </div>
        )}

        {/* Chat Agent Phase */}
        {step === "chat" && (
          <div className="flex min-h-[calc(100vh-140px)] flex-col">
            {/* Chat Header */}
            <div className="mb-4 text-center">
              <h3 className="text-lg font-extrabold text-foreground">
                江口AIコーチ 🌸
              </h3>
              <p className="text-sm text-muted">アイデアを一緒に育てましょう</p>
            </div>

            {/* Error message */}
            {chatError && (
              <div className="mb-4">
                <ErrorMessage message={chatError} />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto pb-4 min-h-0">
              {chatHistory.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === "agent" ? (
                    <div className="flex flex-col gap-2">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary px-4 py-3 text-sm text-white">
                        {msg.content}
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
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!isComplete && (
              <div className="border-t border-border-warm bg-white pt-4">
                {chatHistory.length > 0 &&
                chatHistory[chatHistory.length - 1].options ? (
                  // Multiple choice buttons are shown above
                  <div className="text-center text-xs text-muted">
                    上から選択してください
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => {
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
                      onClick={() => handleSendMessage(currentInput)}
                      disabled={!currentInput.trim() || chatLoading}
                      className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                      送信
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Finalize Error */}
            {finalizeError && (
              <div className="mt-4">
                <ErrorMessage message={finalizeError} />
              </div>
            )}

            {/* Finalize Button */}
            {isComplete && (
              <button
                onClick={handleFinalize}
                disabled={isLoading}
                className="mt-4 w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "処理中..." : "アイデアをまとめる ✨"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

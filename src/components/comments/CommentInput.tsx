"use client";

import { useState } from "react";

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function CommentInput({
  onSubmit,
  placeholder = "コメントを入力...",
  autoFocus = false,
  disabled = false,
}: CommentInputProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={2}
        className="min-h-[48px] w-full resize-y rounded-xl border border-border-warm bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted"
        maxLength={2000}
      />
      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="self-end rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
      >
        送信
      </button>
    </form>
  );
}

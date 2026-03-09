"use client";

interface ChatFooterProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  showOptionsHint?: boolean;
}

/**
 * Sticky chat footer (56–64px). Input + send, safe-area padding, 44px touch target.
 */
export function ChatFooter({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "メッセージを入力...",
  showOptionsHint = false,
}: ChatFooterProps) {
  return (
    <div className="shrink-0 -mx-5 border-t border-border-warm bg-white px-5 pt-4 pb-safe">
      {showOptionsHint ? (
        <p className="text-center text-xs text-muted">上から選択してください</p>
      ) : (
        <div className="flex min-h-[56px] items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] flex-1 rounded-xl border border-border-warm bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="min-h-[44px] shrink-0 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            送信
          </button>
        </div>
      )}
    </div>
  );
}

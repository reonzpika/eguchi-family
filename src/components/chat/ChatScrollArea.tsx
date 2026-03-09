"use client";

import { forwardRef } from "react";

interface ChatScrollAreaProps {
  children: React.ReactNode;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  className?: string;
  "data-testid"?: string;
}

/**
 * Scrollable chat area with optional floating scroll-to-bottom button.
 * Uses -webkit-overflow-scrolling: touch for iOS momentum.
 */
export const ChatScrollArea = forwardRef<HTMLDivElement, ChatScrollAreaProps>(
  (
    {
      children,
      showScrollToBottom = false,
      onScrollToBottom,
      className = "",
      "data-testid": dataTestId,
    },
    ref
  ) => {
    return (
      <div className="relative min-h-0 flex-1">
        <div
          ref={ref}
          data-testid={dataTestId}
          className={`scrollbar-hide h-full space-y-4 overflow-x-hidden overflow-y-auto pb-4 [-webkit-overflow-scrolling:touch] ${className}`}
        >
          {children}
        </div>
        {showScrollToBottom && onScrollToBottom && (
          <button
            type="button"
            onClick={onScrollToBottom}
            aria-label="最新メッセージへ"
            className="absolute bottom-6 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-border-warm bg-white shadow-md text-foreground transition-transform active:scale-[0.95]"
          >
            ↓
          </button>
        )}
      </div>
    );
  }
);

ChatScrollArea.displayName = "ChatScrollArea";

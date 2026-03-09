"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const PROXIMITY_THRESHOLD = 100;
const SCROLL_TO_BOTTOM_THRESHOLD = 80;

export type ChatMessage = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

interface UseChatScrollOptions {
  chatHistory: ChatMessage[];
  /** Skip initial scroll on load. Call setSkipNextScroll(true) when loading existing history. */
  skipInitialScroll?: boolean;
}

export function useChatScroll({
  chatHistory,
  skipInitialScroll = false,
}: UseChatScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAgentMessageRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const skipNextScrollRef = useRef(skipInitialScroll);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return (
      el.scrollTop + el.clientHeight + PROXIMITY_THRESHOLD >= el.scrollHeight
    );
  }, []);

  useEffect(() => {
    if (chatHistory.length === 0) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    if (skipNextScrollRef.current) {
      skipNextScrollRef.current = false;
      return;
    }

    const last = chatHistory[chatHistory.length - 1];
    const nearBottom = isNearBottom();

    if (last.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (last.role === "agent" && nearBottom) {
      lastAgentMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [chatHistory, isNearBottom]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollToBottom(distFromBottom > SCROLL_TO_BOTTOM_THRESHOLD);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const setSkipNextScroll = useCallback((value: boolean) => {
    skipNextScrollRef.current = value;
  }, []);

  return {
    scrollContainerRef,
    messagesEndRef,
    lastAgentMessageRef,
    showScrollToBottom,
    scrollToBottom,
    setSkipNextScroll,
  };
}

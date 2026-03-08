"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type ProjectTabId = "milestones" | "living-doc" | "activity" | "history" | "reflection" | "comments";

interface ProjectTabsProps {
  activeTab: ProjectTabId;
  onTabChange: (tab: ProjectTabId) => void;
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  const tabs: { id: ProjectTabId; label: string }[] = [
    { id: "milestones", label: "マイルストーン" },
    { id: "living-doc", label: "内容" },
    { id: "activity", label: "アクティビティ" },
    { id: "history", label: "履歴" },
    { id: "reflection", label: "振り返り" },
    { id: "comments", label: "コメント" },
  ];

  return (
    <div className="mb-6 border-b border-border-warm">
      <div className="relative">
        {/* Left fade when scrollable */}
        {canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-bg-warm to-transparent"
            aria-hidden
          />
        )}
        {/* Right fade when more tabs to scroll */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-bg-warm to-transparent"
            aria-hidden
          />
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-px pr-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] shrink-0 whitespace-nowrap pb-2 pr-1 text-sm font-semibold transition-colors first:pl-0 ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

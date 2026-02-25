"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

const memberColors: Record<string, string> = {
  Ryo: "#7CC9A0",
  Yoko: "#F9C784",
  Haruhi: "#B5A4E0",
  Natsumi: "#F97B6B",
  Motoharu: "#7BBFDC",
};

interface Resource {
  title: string;
  category: string;
  url: string;
  target: string | null;
  level: string;
}

const resources: Resource[] = [
  {
    title: "HTMLとCSSの基本",
    category: "HTML/CSS",
    url: "https://developer.mozilla.org/ja/docs/Learn/HTML",
    target: "Haruhi",
    level: "入門",
  },
  {
    title: "はじめてのウェブサイト公開",
    category: "HTML/CSS",
    url: "https://developer.mozilla.org/ja/docs/Learn/Getting_started_with_the_web",
    target: "Haruhi",
    level: "中級",
  },
  {
    title: "Shopifyでネットショップを始める",
    category: "EC",
    url: "https://www.shopify.com/jp/blog/start-online-store",
    target: "Natsumi",
    level: "入門",
  },
  {
    title: "メルカリで販売を始める方法",
    category: "EC",
    url: "https://www.mercari.com/jp/help_center/",
    target: "Natsumi",
    level: "入門",
  },
  {
    title: "ChatGPTをビジネスに使う方法",
    category: "AI",
    url: "https://openai.com/blog",
    target: null,
    level: "入門",
  },
  {
    title: "Claudeで文章を改善する",
    category: "AI",
    url: "https://claude.ai",
    target: null,
    level: "入門",
  },
  {
    title: "SNSマーケティング基礎",
    category: "ビジネス",
    url: "https://www.instagram.com",
    target: "Natsumi",
    level: "入門",
  },
  {
    title: "ゼロからのビジネスプラン作成",
    category: "ビジネス",
    url: "https://j-net21.smrj.go.jp",
    target: null,
    level: "入門",
  },
];

const categories = ["すべて", "HTML/CSS", "ビジネス", "AI", "EC"];

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case "HTML/CSS":
      return "💻";
    case "EC":
      return "🛒";
    case "AI":
      return "🤖";
    case "ビジネス":
      return "📖";
    default:
      return "📚";
  }
};

export default function LearningHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");

  const filteredResources =
    selectedCategory === "すべて"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const handleResourceClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-foreground">学習リソース</h1>

      {/* Filter chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-white text-foreground border border-border-warm"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources list */}
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-muted">該当するリソースがありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredResources.map((resource, index) => {
            const categoryEmoji = getCategoryEmoji(resource.category);
            const targetColor = resource.target
              ? memberColors[resource.target] || "#F97B6B"
              : null;

            return (
              <div
                key={index}
                onClick={() => handleResourceClick(resource.url)}
                className="cursor-pointer rounded-2xl border border-border-warm bg-white p-4 transition-transform active:scale-[0.98]"
              >
                {/* Icon area */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl">
                  {categoryEmoji}
                </div>

                {/* Resource title */}
                <h3 className="mb-2 text-base font-bold text-foreground">
                  {resource.title}
                </h3>

                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                    {resource.category}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-white">
                    {resource.level}
                  </span>
                  {resource.target && targetColor && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${targetColor}33`,
                        color: targetColor,
                      }}
                    >
                      {resource.target}さんにおすすめ
                    </span>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center justify-end">
                  <span className="text-xs text-primary">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

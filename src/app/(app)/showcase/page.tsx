"use client";

import { Avatar } from "@/components/ui/Avatar";

const memberColors: Record<string, string> = {
  Ryo: "#7CC9A0",
  Yoko: "#F9C784",
  Haruhi: "#B5A4E0",
  Natsumi: "#F97B6B",
  Motoharu: "#7BBFDC",
};

interface Business {
  name: string;
  title: string;
  url: string | null;
  emoji: string;
  desc: string;
  live: boolean;
}

const businesses: Business[] = [
  {
    name: "Ryo",
    title: "ClinicPro",
    url: "https://clinicpro.co.nz",
    emoji: "🏥",
    desc: "クリニック向け予約・管理システム",
    live: true,
  },
  {
    name: "Ryo",
    title: "Ahuru Candles",
    url: "https://ahurucandles.co.nz",
    emoji: "🕯️",
    desc: "NZのハンドメイドキャンドルブランド",
    live: true,
  },
  {
    name: "Ryo",
    title: "Miozuki",
    url: "https://miozuki.co.nz",
    emoji: "🌙",
    desc: "近日公開",
    live: true,
  },
  {
    name: "Yoko",
    title: "Cloud9 Japan",
    url: "https://cloud9japan.com",
    emoji: "🇯🇵",
    desc: "日本文化・旅行情報サイト",
    live: true,
  },
  {
    name: "Natsumi",
    title: "ラッピングショップ",
    url: null,
    emoji: "🎁",
    desc: "プレゼント用ラッピング用品 (準備中)",
    live: false,
  },
  {
    name: "Haruhi",
    title: "はるひのプロジェクト",
    url: null,
    emoji: "🌸",
    desc: "近日公開",
    live: false,
  },
];

export default function ShowcasePage() {
  const handleBusinessClick = (business: Business) => {
    if (business.live && business.url) {
      window.open(business.url, "_blank");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
      {/* Page title */}
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        江口ファミリーのビジネス
      </h1>
      <p className="mb-6 text-sm text-muted">
        家族のプロジェクトをすべて紹介します
      </p>

      {/* Businesses list */}
      <div className="flex flex-col gap-4">
        {businesses.map((business, index) => {
          const memberColor = memberColors[business.name] || "#F97B6B";
          const isClickable = business.live && business.url;

          return (
            <div
              key={index}
              onClick={() => handleBusinessClick(business)}
              className={`rounded-2xl border bg-white p-4 transition-transform ${
                isClickable
                  ? "cursor-pointer border-border-warm active:scale-[0.98]"
                  : "cursor-default border-dashed border-border-warm"
              }`}
            >
              {/* Emoji icon area */}
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${memberColor}33` }}
              >
                {business.emoji}
              </div>

              {/* Business title */}
              <h3 className="mb-2 text-base font-bold text-foreground">
                {business.title}
              </h3>

              {/* Description */}
              <p className="mb-3 text-sm text-muted">{business.desc}</p>

              {/* Owner and status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={business.name} size={24} />
                  <span className="text-xs text-muted">{business.name}</span>
                </div>
                {!business.live && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-white">
                    準備中
                  </span>
                )}
                {business.live && business.url && (
                  <span className="text-xs text-primary">→</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

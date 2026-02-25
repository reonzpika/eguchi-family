"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { id: "home", label: "ホーム", icon: "🏠", path: "/" },
  { id: "ideas", label: "アイデア", icon: "💡", path: "/ideas" },
  { id: "projects", label: "プロジェクト", icon: "📁", path: "/projects" },
  { id: "menu", label: "メニュー", icon: "☰", path: "/menu" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[390px] -translate-x-1/2 border-t border-border-warm bg-white pb-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className="flex flex-1 flex-col items-center gap-1 px-1 pt-2.5"
          >
            <span className="text-xl">{tab.icon}</span>
            <span
              className={`text-[10px] ${
                isActive
                  ? "font-bold text-primary"
                  : "font-normal text-muted"
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <div className="h-1 w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

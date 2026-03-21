"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Strategy A: Stitch bottom bar (hub + workspace). Settings: header gear only. */
const tabs = [
  { id: "home", label: "ホーム", icon: "home", path: "/" },
  { id: "missions", label: "ミッション", icon: "task_alt", path: "/missions" },
  { id: "tools", label: "ツール", icon: "category", path: "/tools" },
  { id: "ideas", label: "アイデア", icon: "lightbulb", path: "/ideas" },
  { id: "projects", label: "プロジェクト", icon: "folder", path: "/projects" },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-7xl -translate-x-1/2 rounded-t-[2rem] bg-white/85 px-1 py-2 shadow-[0px_-4px_24px_rgba(0,0,0,0.04)] backdrop-blur-lg pb-safe sm:px-3 sm:py-3"
      aria-label="メイン"
    >
      <div className="scrollbar-hide flex items-stretch justify-between gap-0 overflow-x-auto sm:justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/"
              ? pathname === "/"
              : pathname === tab.path || pathname.startsWith(`${tab.path}/`);
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={`flex min-h-[48px] min-w-[3rem] shrink-0 flex-col items-center justify-center rounded-[1.25rem] px-1.5 py-1 transition-transform duration-150 active:scale-90 sm:min-w-[3.5rem] sm:px-2 ${
                isActive
                  ? "bg-primary-container text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined text-[20px] sm:text-[22px]"
                style={isActive ? { fontVariationSettings: '"FILL" 1' } : undefined}
                aria-hidden
              >
                {tab.icon}
              </span>
              <span
                className={`max-w-[4.2rem] truncate text-center text-[8px] leading-tight sm:max-w-none sm:text-[10px] ${
                  isActive ? "font-bold text-primary" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

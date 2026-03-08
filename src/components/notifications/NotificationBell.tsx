"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notifications?limit=1")
      .then((res) => (res.ok ? res.json() : { unread_count: 0 }))
      .then((data) => {
        if (!cancelled) setUnreadCount(data.unread_count ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex min-h-[48px] min-w-[48px] items-center justify-center text-foreground"
      aria-label={unreadCount > 0 ? `通知が${unreadCount}件あります` : "通知"}
    >
      <span className="text-xl" aria-hidden>
        🔔
      </span>
      {unreadCount > 0 ? (
        <span
          className="absolute right-0 top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white"
          aria-hidden
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

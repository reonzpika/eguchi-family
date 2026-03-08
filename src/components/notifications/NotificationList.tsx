"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Notification } from "@/types/database";

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    if (res.ok) fetchNotifications();
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (res.ok) await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">読み込み中...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {unreadCount > 0 ? (
        <button
          type="button"
          onClick={markAllRead}
          disabled={markingAll}
          className="self-end text-sm font-semibold text-primary disabled:opacity-50"
        >
          {markingAll ? "処理中..." : "すべて既読にする"}
        </button>
      ) : null}
      {notifications.length === 0 ? (
        <p className="text-sm text-muted">通知はありません。</p>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="通知一覧">
          {notifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.action_url ?? "#"}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`block rounded-xl border border-border-warm bg-white p-4 transition-colors ${
                  n.is_read ? "opacity-80" : "border-primary/30"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted line-clamp-2">{n.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(n.created_at).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

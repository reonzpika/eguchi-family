"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { ActivityFeed } from "@/types/database";

export interface ActivityWithUser extends ActivityFeed {
  user: { id: string; name: string };
}

interface ActivityCardProps {
  activity: ActivityWithUser;
  onClick?: () => void;
  staggerIndex?: number;
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function ActivityCard({
  activity,
  onClick,
  staggerIndex = 0,
}: ActivityCardProps) {
  const marginLeft = staggerIndex % 2 === 1 ? "ml-2" : "";
  const content = (
    <div
      className={
        "flex min-h-[48px] gap-3 rounded-xl border border-border-warm bg-white p-4 shadow-sm transition-transform active:scale-[0.98] " +
        marginLeft
      }
      role={onClick ? "button" : undefined}
    >
      <Avatar name={activity.user.name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{activity.user.name}</span>
          {activity.emoji ? (
            <span className="ml-1" aria-hidden>
              {activity.emoji}
            </span>
          ) : null}{" "}
          {activity.title}
        </p>
        {activity.project_id ? (
          <p className="mt-0.5 text-xs text-muted">
            <Link
              href={"/projects/" + activity.project_id}
              className="underline hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              プロジェクトを見る
            </Link>
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted">
          {formatTimeAgo(activity.created_at)}
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }
  return content;
}

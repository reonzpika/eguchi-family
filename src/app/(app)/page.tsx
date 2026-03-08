"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ActivityCard, type ActivityWithUser } from "@/components/feed/ActivityCard";
import { StatsCards } from "@/components/feed/StatsCards";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

interface Stats {
  ideaCount: number;
  projectCount: number;
}

const PAGE_SIZE = 20;

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || activities.length === 0) return;
    const last = activities[activities.length - 1];
    const before = last?.created_at;
    if (!before) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/activity-feed?limit=${PAGE_SIZE}&before=${encodeURIComponent(before)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const next = (data.activities ?? []) as ActivityWithUser[];
      setActivities((prev) => {
        const prevIds = new Set(prev.map((a) => a.id));
        const newItems = next.filter((a) => !prevIds.has(a.id));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
      setHasMore(!!data.has_more);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [activities.length, hasMore, loadingMore]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [feedRes, statsRes] = await Promise.all([
          fetch(`/api/activity-feed?limit=${PAGE_SIZE}`),
          fetch("/api/me/stats"),
        ]);

        if (cancelled) return;
        if (!feedRes.ok) {
          setError("アクティビティの読み込みに失敗しました");
          setLoading(false);
          return;
        }
        if (!statsRes.ok) {
          setStats({ ideaCount: 0, projectCount: 0 });
        } else {
          const statsData = await statsRes.json();
          setStats({ ideaCount: statsData.ideaCount ?? 0, projectCount: statsData.projectCount ?? 0 });
        }

        const data = await feedRes.json();
        setActivities(data.activities ?? []);
        setHasMore(!!data.has_more);
      } catch (e) {
        if (!cancelled) {
          setError("読み込みに失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasMore || loadingMore || activities.length === 0) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, activities.length, loadMore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm px-4 pb-24 pt-6">
        <h1 className="mb-4 text-xl font-bold text-foreground">家族の活動</h1>
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-warm px-4 pb-24 pt-6">
        <h1 className="mb-4 text-xl font-bold text-foreground">家族の活動</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">家族の活動</h1>

      <PushPermissionPrompt />

      {stats ? (
        <div className="mb-6">
          <StatsCards ideaCount={stats.ideaCount} projectCount={stats.projectCount} />
        </div>
      ) : null}

      <section aria-label="アクティビティ一覧" className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-muted">
            まだアクティビティはありません。プロジェクトを作成したり、マイルストーンを完了するとここに表示されます。
          </p>
        ) : (
          <>
            {activities.map((activity, i) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                staggerIndex={i}
              />
            ))}
            <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
            {loadingMore && (
              <p className="py-2 text-center text-sm text-muted">読み込み中...</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

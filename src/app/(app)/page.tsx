"use client";

import { useEffect, useState } from "react";
import { ActivityCard, type ActivityWithUser } from "@/components/feed/ActivityCard";
import { StatsCards } from "@/components/feed/StatsCards";

interface Stats {
  ideaCount: number;
  projectCount: number;
}

export default function HomePage() {
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [feedRes, statsRes] = await Promise.all([
          fetch("/api/activity-feed?limit=30"),
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
          activities.map((activity, i) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              staggerIndex={i}
            />
          ))
        )}
      </section>
    </div>
  );
}

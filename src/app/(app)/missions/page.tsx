"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

interface MissionRow {
  id: string;
  tool_id: string;
  tool_name: string;
  title: string;
  estimated_minutes: number | null;
  updated_at: string;
}

export default function MissionsIndexPage() {
  const [missions, setMissions] = useState<MissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/hub/missions");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMissions(data.missions ?? []);
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
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-28 pt-6 sm:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">ミッション</h1>
      <p className="text-sm text-on-surface-variant">
        公開中のツールに紐づくミッション一覧です。
      </p>
      {missions.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-8 text-center text-sm text-on-surface-variant editorial-shadow">
          まだ公開ミッションがありません。管理者がツールにミッションを追加すると表示されます。
        </p>
      ) : (
        <ul className="space-y-3">
          {missions.map((m) => (
            <li key={m.id}>
              <Link
                href={`/tools/${m.tool_id}/missions/${m.id}`}
                className="editorial-shadow block rounded-xl bg-surface-container-lowest p-5 transition-shadow hover:shadow-md"
              >
                <p className="mb-1 font-headline font-bold text-on-surface">{m.title}</p>
                <p className="text-xs text-on-surface-variant">
                  {m.tool_name}
                  {m.estimated_minutes != null ? ` · 約${m.estimated_minutes}分` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

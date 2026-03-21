"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FamilyToolRow } from "@/types/hub";

export default function ToolsListPage() {
  const [published, setPublished] = useState<FamilyToolRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/hub/tools");
      if (res.ok) {
        const data = await res.json();
        setPublished(data.published ?? []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
          AIツール一覧
        </h1>
        <Link
          href="/tools/new"
          className="flex h-11 min-w-[44px] items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-on-primary"
        >
          追加
        </Link>
      </div>
      {loading ? (
        <p className="text-on-surface-variant">読み込み中…</p>
      ) : published.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          まだツールがありません。「追加」から登録してください。
        </p>
      ) : (
        <ul className="space-y-3">
          {published.map((t) => {
            const prof = t.profile_json as { summary?: string };
            return (
              <li key={t.id}>
                <Link
                  href={`/tools/${t.id}`}
                  className="block rounded-xl bg-surface-container-lowest p-4 editorial-shadow transition-transform active:scale-[0.99]"
                >
                  <h2 className="font-headline text-lg font-bold text-on-surface">{t.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                    {prof.summary}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { FamilyToolThreadRow } from "@/types/hub";

export default function DiscussionsPlazaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [threads, setThreads] = useState<FamilyToolThreadRow[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/hub/threads?plaza=1");
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session) return;
    const res = await fetch("/api/hub/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "general", title: title.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setTitle("");
      router.push(`/discussions/${data.thread.id}`);
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
          aria-label="戻る"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline flex-1 text-lg font-bold text-primary">みんなの相談広場</h1>
      </header>

      <div className="space-y-4 px-6 pt-4">
        <form onSubmit={createThread} className="rounded-xl bg-surface-container-low p-4">
          <label className="mb-2 block text-xs font-bold text-on-surface-variant">
            新しいトピック（全体）
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            作成
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-on-surface-variant">読み込み中…</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-on-surface-variant">まだトピックがありません。</p>
        ) : (
          <ul className="space-y-2">
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/discussions/${t.id}`}
                  className="block rounded-xl bg-surface-container-lowest p-4 editorial-shadow"
                >
                  <p className="font-semibold text-on-surface">{t.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

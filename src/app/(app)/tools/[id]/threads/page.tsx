"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { FamilyToolThreadRow } from "@/types/hub";

export default function ToolThreadsPage() {
  const params = useParams();
  const toolId = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [threads, setThreads] = useState<FamilyToolThreadRow[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"qa" | "general">("qa");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/hub/threads?tool_id=${encodeURIComponent(toolId)}`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [toolId]);

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session) return;
    const res = await fetch("/api/hub/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool_id: toolId, kind, title: title.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setTitle("");
      router.push(`/tools/${toolId}/threads/${data.thread.id}`);
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
          aria-label="戻る"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline flex-1 text-lg font-bold text-primary">スレッド</h1>
      </header>

      <div className="space-y-4 px-6 pt-4">
        <form onSubmit={createThread} className="rounded-xl bg-surface-container-low p-4">
          <label className="mb-2 block text-xs font-bold text-on-surface-variant">新しいスレッド</label>
          <div className="mb-2 flex gap-2 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="kind"
                checked={kind === "qa"}
                onChange={() => setKind("qa")}
              />
              質問
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="kind"
                checked={kind === "general"}
                onChange={() => setKind("general")}
              />
              雑談
            </label>
          </div>
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
          <p className="text-sm text-on-surface-variant">スレッドはまだありません。</p>
        ) : (
          <ul className="space-y-2">
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tools/${toolId}/threads/${t.id}`}
                  className="block rounded-xl bg-surface-container-lowest p-4 editorial-shadow"
                >
                  <span className="text-xs text-on-surface-variant">
                    {t.kind === "qa" ? "質問" : "雑談"}
                  </span>
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

"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { FamilyToolPostRow, FamilyToolThreadRow } from "@/types/hub";

export default function ToolThreadDetailPage() {
  const params = useParams();
  const toolId = params.id as string;
  const threadId = params.threadId as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [thread, setThread] = useState<FamilyToolThreadRow | null>(null);
  const [posts, setPosts] = useState<FamilyToolPostRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/hub/threads/${threadId}`);
    if (res.ok) {
      const data = await res.json();
      setThread(data.thread);
      setPosts(data.posts ?? []);
      setNames(data.userNames ?? {});
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [threadId]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !session) return;
    const res = await fetch(`/api/hub/threads/${threadId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    if (res.ok) {
      setBody("");
      load();
    }
  }

  if (loading || !thread) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6">
        <p className="text-on-surface-variant">{loading ? "読み込み中…" : "見つかりません"}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push(`/tools/${toolId}/threads`)}
          className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
          aria-label="戻る"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="min-w-0 flex-1 truncate font-headline text-lg font-bold text-on-surface">
          {thread.title}
        </h1>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl bg-surface-container-low p-3">
            <p className="text-xs font-semibold text-on-surface-variant">
              {names[p.user_id] ?? "家族"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-on-surface">{p.body}</p>
            {session?.user?.id === p.user_id && !p.deleted_at && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs text-error"
                  onClick={async () => {
                    await fetch(`/api/hub/posts/${p.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  削除
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={sendReply}
        className="border-t border-outline-variant/20 bg-surface-container-lowest p-4 pb-safe"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="返信を書く"
          className="mb-2 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-on-primary"
        >
          送信
        </button>
      </form>
    </div>
  );
}

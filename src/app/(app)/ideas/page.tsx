"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { IdeaCard, type Idea } from "@/components/ideas/IdeaCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function IdeasPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renameIdeaId, setRenameIdeaId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  useEffect(() => {
    async function fetchIdeas() {
      if (status === "unauthenticated") {
        setLoading(false);
        return;
      }
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/ideas");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "アイデアの読み込みに失敗しました");
          setIdeas([]);
        } else {
          const ideasData = (await res.json()) as Idea[];
          setIdeas(ideasData ?? []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("データの読み込みに失敗しました");
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, [status]);

  const handleRename = (idea: Idea) => {
    setRenameIdeaId(idea.id);
    setRenameValue(idea.title);
  };

  const handleRenameSubmit = async () => {
    if (!renameIdeaId || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const res = await fetch(`/api/ideas/${renameIdeaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "更新に失敗しました");
      }
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === renameIdeaId
            ? { ...i, title: renameValue.trim(), updated_at: new Date().toISOString() }
            : i
        )
      );
      setRenameIdeaId(null);
      setRenameValue("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setRenameLoading(false);
    }
  };

  const handleMoveToProject = (idea: Idea) => {
    router.push(`/ideas/${idea.id}/validate`);
  };

  const handleDelete = async (idea: Idea) => {
    if (!confirm("このアイデアを削除しますか？")) return;
    const idToRemove = idea.id;
    try {
      const res = await fetch(`/api/ideas/${idToRemove}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "削除に失敗しました");
      }
      setIdeas((prev) => prev.filter((i) => i.id !== idToRemove));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold text-foreground">私のアイデア</h1>
          <span className="text-[10px] text-muted">🔒 このページはあなただけが見られます</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : ideas.length === 0 ? (
          <EmptyState
            emoji="💡"
            title="まだアイデアがありません"
            description="最初のアイデアを追加しましょう"
            action={{
              label: "アイデアを追加する →",
              onClick: () => router.push("/ideas/new"),
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                href={`/ideas/${idea.id}`}
                onRename={handleRename}
                onMoveToProject={handleMoveToProject}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {renameIdeaId != null && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !renameLoading && setRenameIdeaId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border-warm bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-semibold text-foreground">タイトルを変更</p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mb-4 w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              placeholder="アイデアのタイトル"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !renameLoading && setRenameIdeaId(null)}
                disabled={renameLoading}
                className="flex-1 rounded-xl border border-border-warm bg-white py-3 font-semibold text-foreground disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleRenameSubmit}
                disabled={renameLoading || !renameValue.trim()}
                className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-50"
              >
                {renameLoading ? "..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button */}
      <Link
        href="/ideas/new"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition-transform active:scale-[0.95]"
      >
        ＋
      </Link>
    </div>
  );
}

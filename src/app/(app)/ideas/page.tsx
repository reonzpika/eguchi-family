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
  const { status } = useSession();
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
    <div className="min-h-[max(884px,100dvh)] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-8">
        <section className="mb-10">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            私のアイデア
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            この一覧はあなただけが見られます。
          </p>
        </section>

        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : ideas.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-8 text-center editorial-shadow">
            <EmptyState
              emoji="💡"
              title="まだアイデアがありません"
              description="最初のアイデアを追加しましょう"
              action={{
                label: "アイデアを追加する",
                onClick: () => router.push("/ideas/new"),
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
            className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-5 editorial-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-semibold text-on-surface">タイトルを変更</p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mb-4 w-full rounded-xl bg-surface-container-low px-4 py-3 text-on-surface ring-2 ring-transparent placeholder:text-on-surface-variant focus:outline-none focus:ring-primary/30"
              placeholder="アイデアのタイトル"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !renameLoading && setRenameIdeaId(null)}
                disabled={renameLoading}
                className="flex-1 rounded-xl bg-surface-container-high py-3 font-semibold text-on-surface transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleRenameSubmit}
                disabled={renameLoading || !renameValue.trim()}
                className="flex-1 rounded-xl bg-primary-gradient py-3 font-semibold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {renameLoading ? "..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/ideas/new"
        className="fixed bottom-24 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0px_12px_32px_rgba(36,110,0,0.3)] transition-transform active:scale-90"
        aria-label="新しいアイデア"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </div>
  );
}

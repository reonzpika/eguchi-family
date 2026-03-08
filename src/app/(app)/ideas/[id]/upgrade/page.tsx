"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Idea {
  id: string;
  title: string;
  user_id: string;
}

type PageProps = { params: Promise<{ id: string }> };

export default function UpgradePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ideaId = resolvedParams.id;
  const { data: session } = useSession();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");

  useEffect(() => {
    async function fetchIdea() {
      if (!ideaId || !session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            router.push("/ideas");
            return;
          }
          throw new Error("Failed to fetch idea");
        }

        const data = (await res.json()) as Idea;
        setIdea(data);
      } catch (err) {
        console.error("Error:", err);
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, session?.user?.id, router]);

  const handleCreate = async () => {
    if (!idea) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id, visibility }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "プロジェクトの作成に失敗しました");
      }

      const { projectId } = await response.json();
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← 戻る
        </button>

        {/* Title */}
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          アイデアをプロジェクトに昇格する
        </h1>

        {/* Explanation card */}
        <div className="mb-6 rounded-2xl bg-secondary p-4 text-white">
          <p className="mb-2 text-sm font-semibold">
            🌟 プロジェクトにすると、アイデアが家族全員に公開されます。
          </p>
          <p className="text-sm">
            リビングドキュメントが作成され、追加のブレインストーミングで育てることができます。
          </p>
        </div>

        {/* Visibility selector */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-foreground">
            公開設定
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 rounded-xl border-2 border-border-warm bg-white p-4 cursor-pointer transition-colors hover:bg-bg-warm">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={(e) => setVisibility(e.target.value as "public")}
                className="h-4 w-4 text-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  公開 — 家族全員が見られます
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border-2 border-border-warm bg-white p-4 cursor-pointer transition-colors hover:bg-bg-warm">
              <input
                type="radio"
                name="visibility"
                value="unlisted"
                checked={visibility === "unlisted"}
                onChange={(e) => setVisibility(e.target.value as "unlisted")}
                className="h-4 w-4 text-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  限定公開 — リンクを知っている人だけ
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleCreate}
          disabled={creating}
          className={`w-full rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] ${
            creating
              ? "bg-muted opacity-50"
              : "bg-primary"
          }`}
        >
          {creating ? "作成中..." : "🚀 プロジェクトを作成する"}
        </button>
      </div>
    </div>
  );
}

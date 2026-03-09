"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CreateSharedProjectButtonProps {
  hasSharedProject: boolean;
}

export function CreateSharedProjectButton({
  hasSharedProject,
}: CreateSharedProjectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (hasSharedProject) {
    return (
      <div className="rounded-2xl border border-border-warm bg-white p-4">
        <div className="text-base font-bold text-foreground">
          📁 共有プロジェクト
        </div>
        <p className="mt-1 text-xs text-muted">
          Family Workspace アプリ改善プロジェクトは既に作成されています。
        </p>
        <Link
          href="/projects"
          className="mt-2 inline-block text-sm font-semibold text-primary"
        >
          プロジェクト一覧へ →
        </Link>
      </div>
    );
  }

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects/create-shared", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "作成に失敗しました");
        return;
      }
      router.push(`/projects/${data.projectId}`);
      router.refresh();
    } catch (e) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-warm bg-white p-4">
      <div className="text-base font-bold text-foreground">
        📁 共有プロジェクト作成
      </div>
      <p className="mt-1 text-xs text-muted">
        Family Workspace アプリ改善用の共有プロジェクトを作成（全員が編集可能）
      </p>
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "作成中..." : "作成する"}
      </button>
    </div>
  );
}

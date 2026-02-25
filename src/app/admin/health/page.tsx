"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HealthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/test-ai", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "テストに失敗しました");
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
      >
        ← ダッシュボードに戻る
      </button>

      {/* Title */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
        <h1 className="text-lg font-extrabold text-foreground">AIヘルスチェック</h1>
        <p className="mt-1 text-xs text-muted">
          AIサービスの動作を確認します
        </p>
      </div>

      {/* Test button */}
      <button
        onClick={handleTest}
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors active:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "テスト中..." : "AIをテストする"}
      </button>

      {/* Response display */}
      {response && (
        <div className="rounded-2xl border border-border-warm bg-white p-4">
          <h2 className="mb-2 text-sm font-bold text-foreground">AIの応答:</h2>
          <div className="rounded-lg bg-bg-warm p-3 text-sm text-foreground">
            {response}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 text-sm font-bold text-red-600">エラー:</h2>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewToolPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [note, setNote] = useState("");
  const [enrich, setEnrich] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/hub/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          website_url: websiteUrl.trim() || undefined,
          note: note.trim() || undefined,
          enrich,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      const id = data.tool?.id;
      if (id) router.push(`/tools/${id}`);
    } catch {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pb-28 pt-4">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant"
          aria-label="戻る"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline text-xl font-bold text-primary">ツールを追加</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            名前 <span className="text-error">*</span>
          </label>
          <Input
            value={name}
            onChange={setName}
            placeholder="例: ChatGPT"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            公式サイト（任意）
          </label>
          <Input
            value={websiteUrl}
            onChange={setWebsiteUrl}
            placeholder="https://"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            メモ（任意）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="min-h-[100px] w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-muted focus:border-primary focus:outline-none"
            placeholder="家族向けに伝えたいこと"
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={enrich}
            onChange={(e) => setEnrich(e.target.checked)}
            className="h-5 w-5 rounded border-outline-variant text-primary"
          />
          AIに説明とミッション案を自動生成する
        </label>
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "処理中…" : "下書きを作成"}
        </Button>
      </form>
    </div>
  );
}

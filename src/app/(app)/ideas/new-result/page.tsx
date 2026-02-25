"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase-client";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  ai_suggestions: {
    suggestions?: string[];
    nextStep?: string;
  } | null;
}

function NewResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = searchParams.get("id");
  const supabase = createClientComponentClient();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIdea() {
      if (!ideaId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("id, title, polished_content, ai_suggestions")
          .eq("id", ideaId)
          .single();

        if (error || !data) {
          console.error("Error fetching idea:", error);
          setError("アイデアの読み込みに失敗しました");
          setLoading(false);
          return;
        }

        setIdea(data);
        setTitle(data.title);
      } catch (error) {
        console.error("Error:", error);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, supabase, router]);

  const handleSave = async () => {
    if (!idea || !title.trim()) return;

    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "保存に失敗しました");
      }

      setSaved(true);
    } catch (error) {
      console.error("Error saving idea:", error);
      setSaveError(
        error instanceof Error ? error.message : "保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col px-5 py-6">
        <SkeletonCard height="h-6" className="w-32 mb-4" />
        <SkeletonCard height="h-12" className="mb-5" />
        <SkeletonCard height="h-48" className="mb-5" />
        <SkeletonCard height="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col px-5 py-6">
        <Link
          href="/ideas"
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← アイデア一覧に戻る
        </Link>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  const suggestions = idea.ai_suggestions?.suggestions || [];
  const nextStep = idea.ai_suggestions?.nextStep || "";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Back button */}
        <Link
          href="/ideas"
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← アイデア一覧に戻る
        </Link>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-5 w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-lg font-bold text-foreground focus:border-primary focus:outline-none"
          placeholder="アイデアのタイトル"
        />

        {/* AI summary card */}
        <div className="mb-5 rounded-2xl border border-border-warm bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary p-4">
            <p className="font-bold text-white">✨ AIが整理しました</p>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed text-foreground">
              {idea.polished_content || ""}
            </p>
          </div>
        </div>

        {/* AI suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-5 rounded-2xl border border-border-warm bg-white p-4">
            <p className="mb-3 text-sm font-bold text-foreground">💬 AIからの提案</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="text-sm text-foreground">
                  → {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next step card */}
        {nextStep && (
          <div className="mb-5 rounded-2xl border border-border-warm bg-bg-warm p-4">
            <p className="mb-2 text-sm font-bold text-foreground">👣 まずやること</p>
            <p className="text-sm text-foreground">{nextStep}</p>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="mb-3">
            <ErrorMessage message={saveError} />
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || saved}
          className={`mb-3 w-full rounded-xl px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98] ${
            saved
              ? "bg-success"
              : saving || !title.trim()
              ? "bg-muted opacity-50"
              : "bg-primary"
          }`}
        >
          {saved ? "✓ 保存しました！" : saving ? "保存中..." : "💾 アイデアを保存する"}
        </button>

        {/* Upgrade button (revealed after save) */}
        {saved && (
          <button
            onClick={() => router.push(`/ideas/${idea.id}/upgrade`)}
            className="w-full rounded-xl border-2 border-primary bg-white px-5 py-3.5 font-semibold text-primary transition-transform active:scale-[0.98]"
          >
            🚀 プロジェクトに昇格する
          </button>
        )}
      </div>
    </div>
  );
}

export default function NewResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col px-5 py-6">
          <SkeletonCard height="h-6" className="w-32 mb-4" />
          <SkeletonCard height="h-12" className="mb-5" />
          <SkeletonCard height="h-48" className="mb-5" />
          <SkeletonCard height="h-32" />
        </div>
      }
    >
      <NewResultPageContent />
    </Suspense>
  );
}

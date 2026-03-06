"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import Link from "next/link";

interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  ai_suggestions: {
    suggestions?: string[];
    nextStep?: string;
  } | null;
  user_id: string;
}

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchIdea() {
      const userId = session?.user?.id;
      if (!ideaId || !userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("id, title, polished_content, ai_suggestions, user_id")
          .eq("id", ideaId)
          .single();

        if (error || !data) {
          console.error("Error fetching idea:", error);
          router.push("/ideas");
          return;
        }

        // Check ownership
        if (data.user_id !== userId) {
          router.push("/ideas");
          return;
        }

        setIdea(data);
        setTitle(data.title);
        setIsOwner(true);
      } catch (error) {
        console.error("Error:", error);
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, supabase, session?.user?.id, router]);

  const handleSave = async () => {
    if (!idea || !title.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setSaved(true);
    } catch (error) {
      console.error("Error saving idea:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!idea || !isOwner) {
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

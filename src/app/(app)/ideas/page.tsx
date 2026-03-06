"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  updated_at: string;
}

export default function IdeasPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIdeas() {
      const userId = session?.user?.id;
      if (!userId) return;

      try {
        const { data: ideasData, error } = await supabase
          .from("ideas")
          .select("id, title, polished_content, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching ideas:", error);
          setError("アイデアの読み込みに失敗しました");
        } else {
          setIdeas(ideasData || []);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();
  }, [supabase, session?.user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h1 className="mb-5 text-xl font-extrabold text-foreground">私のアイデア</h1>

        {/* Privacy notice */}
        <div className="mb-5 rounded-2xl border border-border-warm bg-bg-warm p-4">
          <p className="text-sm text-muted">🔒 このページはあなただけが見られます</p>
        </div>

        {/* Ideas list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-center text-sm text-muted">
              まだアイデアがありません。最初のアイデアを追加しましょう！
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
            >
              アイデアを追加する →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                onClick={() => router.push(`/ideas/${idea.id}`)}
                className="rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
              >
                <div className="mb-2 font-bold text-foreground">
                  💡 {idea.title}
                </div>
                <p className="mb-2 text-xs leading-relaxed text-muted">
                  {truncateText(idea.polished_content, 60)}
                </p>
                <div className="text-xs text-muted">
                  保存日: {formatDate(idea.updated_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      <Link
        href="/onboarding"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition-transform active:scale-[0.95]"
      >
        ＋
      </Link>
    </div>
  );
}

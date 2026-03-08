"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  updated_at: string;
}

interface Stats {
  ideasCount: number;
  projectsCount: number;
}

interface ReturningMemberHomeProps {
  name: string;
}

export function ReturningMemberHome({ name }: ReturningMemberHomeProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState<Stats>({ ideasCount: 0, projectsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchData() {
      if (status === "unauthenticated") {
        setLoading(false);
        return;
      }
      if (status !== "authenticated") return;

      try {
        const [statsRes, ideasRes] = await Promise.all([
          fetch("/api/me/stats"),
          fetch("/api/ideas"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            ideasCount: statsData.ideaCount ?? 0,
            projectsCount: statsData.projectCount ?? 0,
          });
        }

        if (ideasRes.ok) {
          const ideasData = (await ideasRes.json()) as Idea[];
          setIdeas((ideasData ?? []).slice(0, 3));
        } else {
          setError("アイデアの読み込みに失敗しました");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今日";
    if (diffDays === 1) return "昨日";
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 px-5 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
          <h2 className="text-lg font-extrabold text-foreground">
            おかえりなさい、{name}さん！
          </h2>
          <p className="mt-1 text-xs text-muted">今日も一緒に頑張りましょう</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard height="h-24" />
          <SkeletonCard height="h-24" />
        </div>
        <SkeletonCard height="h-14" />
        <SkeletonCard height="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 px-5 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
          <h2 className="text-lg font-extrabold text-foreground">
            おかえりなさい、{name}さん！
          </h2>
          <p className="mt-1 text-xs text-muted">今日も一緒に頑張りましょう</p>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
        <h2 className="text-lg font-extrabold text-foreground">
          おかえりなさい、{name}さん！
        </h2>
        <p className="mt-1 text-xs text-muted">今日も一緒に頑張りましょう</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">💡</div>
          <div className="mt-1 text-xl font-extrabold text-primary">
            {stats.ideasCount}件
          </div>
          <div className="text-xs text-muted">アイデア</div>
        </div>
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">📁</div>
          <div className="mt-1 text-xl font-extrabold text-[#6B9EF9]">
            {stats.projectsCount}件
          </div>
          <div className="text-xs text-muted">プロジェクト</div>
        </div>
      </div>

      {/* Add new idea button */}
      <button
        onClick={() => router.push("/ideas/new")}
        className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
      >
        ＋ 新しいアイデアを追加する
      </button>

      {/* Recent updates */}
      {ideas.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold text-muted">最近の更新</p>
          <div className="flex flex-col gap-2">
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
        </div>
      )}
    </div>
  );
}

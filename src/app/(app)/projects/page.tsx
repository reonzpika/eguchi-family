"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";

interface Project {
  id: string;
  title: string;
  status: string;
  visibility: string;
  created_at: string;
  user_id: string;
  progress_percentage?: number;
  shared_with_all?: boolean;
  users: {
    name: string;
    avatar_color: string | null;
  };
}

interface ProjectWithDescription extends Project {
  description: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [projects, setProjects] = useState<ProjectWithDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownershipFilter, setOwnershipFilter] = useState<"mine" | "others">("mine");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchProjects() {
      if (sessionStatus === "unauthenticated") {
        setLoading(false);
        return;
      }
      if (sessionStatus !== "authenticated" || !session?.user?.id) return;

      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error ?? "プロジェクトの読み込みに失敗しました");
          setProjects([]);
        } else {
          const data = await res.json();
          setProjects((data.projects ?? []) as ProjectWithDescription[]);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("データの読み込みに失敗しました");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [sessionStatus, session?.user?.id]);

  const userId = session?.user?.id ?? "";

  const filteredProjects = projects.filter((p) => {
    if (ownershipFilter === "mine") {
      const isMine = p.user_id === userId || !!p.shared_with_all;
      if (!isMine) return false;
    } else {
      const isOthers = p.user_id !== userId && !p.shared_with_all;
      if (!isOthers) return false;
    }

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return p.status === "active";
    if (statusFilter === "planning") return p.status === "planning";
    if (statusFilter === "complete") return p.status === "complete";
    return true;
  });

  const getStatusStyle = (statusLabel: string) => {
    if (statusLabel === "計画中") return "bg-secondary-container text-on-secondary-container";
    if (statusLabel === "進行中") return "bg-primary-container text-on-primary-container";
    if (statusLabel === "完了") return "bg-surface-container-high text-on-surface";
    return "bg-surface-container-high text-on-surface";
  };

  const getStatusLabel = (status: string) => {
    if (status === "planning") return "計画中";
    if (status === "active") return "進行中";
    if (status === "complete") return "完了";
    return status;
  };

  const statusOptions = [
    { value: "all", label: "すべて" },
    { value: "active", label: "進行中" },
    { value: "planning", label: "計画中" },
    { value: "complete", label: "完了" },
  ];

  if (loading) {
    return (
      <div className="min-h-[max(884px,100dvh)] bg-background px-4 pb-8 pt-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 font-headline text-3xl font-bold text-on-surface">プロジェクト</h1>
          <PageSkeleton variant="default" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[max(884px,100dvh)] bg-background px-4 pb-8 pt-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 font-headline text-3xl font-bold text-on-surface">プロジェクト</h1>
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[max(884px,100dvh)] bg-background pb-28 text-on-surface">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-8">
        <section className="mb-10">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            プロジェクト
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            家族のマイルストーンと進捗をまとめて見られます。
          </p>
        </section>

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {[
              { value: "mine" as const, label: "自分の" },
              { value: "others" as const, label: "家族の" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setOwnershipFilter(value)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                  ownershipFilter === value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="scrollbar-hide flex flex-wrap gap-3 overflow-x-auto pb-1">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                  statusFilter === value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-8 text-center editorial-shadow">
            <EmptyState
              emoji="📁"
              title={
                ownershipFilter === "others"
                  ? "家族のプロジェクトはまだありません"
                  : "自分のプロジェクトはまだありません"
              }
              description={
                ownershipFilter === "mine"
                  ? "アイデアをプロジェクトに昇格させましょう"
                  : "家族がプロジェクトを作成するとここに表示されます"
              }
              action={
                ownershipFilter === "mine"
                  ? {
                      label: "アイデアへ",
                      onClick: () => router.push("/ideas"),
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProjects.map((project) => {
              const ownerName = project.shared_with_all
                ? "家族"
                : (project.users?.name || "不明");
              const statusLabel = getStatusLabel(project.status);

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="editorial-shadow w-full rounded-2xl bg-surface-container-lowest p-5 text-left transition-transform active:scale-[0.98]"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
                    <span
                      className="material-symbols-outlined text-3xl text-primary"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      folder
                    </span>
                  </div>
                  <h3 className="mb-2 font-headline text-base font-bold text-on-surface">
                    {project.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-on-surface-variant">
                    {project.description}
                  </p>
                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, project.progress_percentage ?? 0))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={ownerName} size={24} />
                      <span className="text-xs text-on-surface-variant">{ownerName}</span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        statusLabel
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

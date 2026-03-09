"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MoreVertical } from "lucide-react";
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
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

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

  const getStatusColor = (status: string) => {
    if (status === "計画中") return "bg-secondary text-white";
    if (status === "進行中") return "bg-success text-white";
    if (status === "完了") return "bg-muted text-white";
    return "bg-muted text-white";
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
      <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">プロジェクト</h1>
        <PageSkeleton variant="default" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">プロジェクト</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 py-6">
      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-foreground">プロジェクト</h1>

      {/* Ownership filter + status menu */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {[
            { value: "mine" as const, label: "自分の" },
            { value: "others" as const, label: "家族の" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setOwnershipFilter(value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                ownershipFilter === value
                  ? "bg-primary text-white"
                  : "bg-white text-foreground border border-border-warm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-warm bg-white text-muted transition-colors hover:bg-gray-50"
            aria-label="フィルター"
            aria-expanded={filterMenuOpen}
          >
            <MoreVertical size={20} strokeWidth={2} />
          </button>

          {filterMenuOpen && (
            <div
              className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-border-warm bg-white py-1 shadow-lg"
              role="menu"
            >
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setStatusFilter(value);
                    setFilterMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm ${
                    statusFilter === value
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
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
                  label: "アイデアをプロジェクトに昇格させる →",
                  onClick: () => router.push("/ideas"),
                }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredProjects.map((project) => {
            const ownerName = project.shared_with_all
              ? "家族"
              : (project.users?.name || "不明");
            const ownerColor = project.shared_with_all
              ? "#7CC9A0"
              : (project.users?.avatar_color || "#F97B6B");
            const statusLabel = getStatusLabel(project.status);

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="cursor-pointer rounded-2xl border border-border-warm bg-white p-4 transition-transform active:scale-[0.98]"
              >
                {/* Emoji icon area */}
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${ownerColor}33` }}
                >
                  📁
                </div>

                {/* Project title */}
                <h3 className="mb-2 text-base font-bold text-foreground">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="mb-2 text-sm text-muted">{project.description}</p>

                {/* Progress bar */}
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border-warm">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, project.progress_percentage ?? 0))}%`,
                    }}
                  />
                </div>

                {/* Owner and status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={ownerName} size={24} />
                    <span className="text-xs text-muted">{ownerName}</span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      statusLabel
                    )}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

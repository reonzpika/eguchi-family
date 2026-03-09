"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";

interface Project {
  id: string;
  title: string;
  status: string;
  visibility: string;
  created_at: string;
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
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [projects, setProjects] = useState<ProjectWithDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("すべて");

  useEffect(() => {
    async function fetchProjects() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          setError("プロジェクトの読み込みに失敗しました");
          setLoading(false);
          return;
        }

        if (!projectsData || projectsData.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // Fetch user info for all projects
        const userIds = [...new Set(projectsData.map((p) => p.user_id))];
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, avatar_color")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
          setError("ユーザー情報の読み込みに失敗しました");
          setLoading(false);
          return;
        }

        // Create user map
        const userMap = new Map(
          (usersData || []).map((u) => [
            u.id,
            { name: u.name, avatar_color: u.avatar_color },
          ])
        );

        // For each project, get the latest living document for description
        const projectsWithDesc: ProjectWithDescription[] = await Promise.all(
          projectsData.map(async (project) => {
            const { data: latestDoc } = await supabase
              .from("living_documents")
              .select("content")
              .eq("project_id", project.id)
              .order("version_number", { ascending: false })
              .limit(1)
              .single();

            const description = latestDoc?.content
              ? latestDoc.content.slice(0, 60).replace(/\n/g, " ")
              : "説明なし";

            const userInfo = userMap.get(project.user_id) || {
              name: "不明",
              avatar_color: null,
            };

            return {
              ...project,
              users: userInfo,
              description,
            };
          })
        );

        setProjects(projectsWithDesc);
      } catch (error) {
        console.error("Error:", error);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [supabase, session?.user?.id]);

  const filteredProjects =
    filter === "すべて"
      ? projects
      : projects.filter((p) => {
          if (filter === "進行中") return p.status === "active";
          if (filter === "計画中") return p.status === "planning";
          if (filter === "完了") return p.status === "complete";
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

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] flex-col gap-4 px-5 py-6">
        <SkeletonCard height="h-8" className="w-32" />
        <div className="flex gap-2">
          <SkeletonCard height="h-10" className="w-20" />
          <SkeletonCard height="h-10" className="w-20" />
          <SkeletonCard height="h-10" className="w-20" />
        </div>
        <SkeletonCard height="h-40" />
        <SkeletonCard height="h-40" />
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

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["すべて", "進行中", "計画中", "完了"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === tab
                ? "bg-primary text-white"
                : "bg-white text-foreground border border-border-warm"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState
          emoji="📁"
          title="まだプロジェクトはありません"
          description="アイデアをプロジェクトに昇格させましょう"
          action={{
            label: "アイデアをプロジェクトに昇格させる →",
            onClick: () => router.push("/ideas"),
          }}
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

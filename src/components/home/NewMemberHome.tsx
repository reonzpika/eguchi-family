"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase-client";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface Project {
  id: string;
  title: string;
  user_id: string;
  users: {
    name: string;
  };
}

interface NewMemberHomeProps {
  name: string;
}

export function NewMemberHome({ name }: NewMemberHomeProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, title, user_id")
          .order("created_at", { ascending: false })
          .limit(2);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          setLoading(false);
          return;
        }

        if (!projectsData || projectsData.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch user names for each project
        const userIds = [...new Set(projectsData.map((p) => p.user_id))];
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
          setLoading(false);
          return;
        }

        // Map projects with user names
        const userMap = new Map(
          (usersData || []).map((u) => [u.id, u.name])
        );

        const transformedProjects = projectsData.map((project) => ({
          id: project.id,
          title: project.title,
          user_id: project.user_id,
          users: {
            name: userMap.get(project.user_id) || "Unknown",
          },
        }));

        setProjects(transformedProjects);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5 text-center">
        <h2 className="text-xl font-extrabold text-foreground">
          こんにちは、{name}さん！
        </h2>
        <p className="mt-2 text-sm text-muted">
          ようこそ江口ファミリーハブへ。まず、あなたのアイデアを育てましょう。
        </p>
      </div>

      {/* Section title */}
      <p className="text-base font-semibold text-foreground">
        ビジネスアイデアはありますか？
      </p>

      {/* Action cards */}
      <div className="flex flex-col gap-3">
        {/* Card 1: Yes, I have an idea */}
        <button
          onClick={() => router.push("/ideas/new")}
          className="rounded-2xl bg-gradient-to-br from-primary to-[#F9826B] p-5 text-left shadow-lg transition-transform active:scale-[0.98]"
        >
          <div className="mb-2 text-3xl">✨</div>
          <div className="font-bold text-white">はい、あります！</div>
          <div className="mt-1 text-sm text-white/85">
            AIと一緒にアイデアを育てましょう →
          </div>
        </button>

        {/* Card 2: Still thinking */}
        <button
          onClick={() => router.push("/inspiration")}
          className="rounded-2xl border-2 border-secondary bg-white p-5 text-left transition-transform active:scale-[0.98]"
        >
          <div className="mb-2 text-3xl">🌱</div>
          <div className="font-bold text-foreground">まだ考え中です</div>
          <div className="mt-1 text-sm text-muted">
            インスピレーションをもらいましょう →
          </div>
        </button>
      </div>

      {/* Recent family projects */}
      {loading ? (
        <div className="mt-2">
          <p className="mb-3 text-sm font-semibold text-muted">家族のプロジェクト</p>
          <div className="flex flex-col gap-2">
            <SkeletonCard height="h-20" />
            <SkeletonCard height="h-20" />
          </div>
        </div>
      ) : (
        projects.length > 0 && (
          <div className="mt-2">
            <p className="mb-3 text-sm font-semibold text-muted">家族のプロジェクト</p>
            <div className="flex flex-col gap-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-border-warm bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={project.users.name} size={32} />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {project.title}
                      </div>
                      <div className="text-xs text-muted">{project.users.name}さん</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

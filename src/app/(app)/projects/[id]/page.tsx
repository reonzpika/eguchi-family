"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import ReactMarkdown from "react-markdown";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface Project {
  id: string;
  title: string;
  status: string;
  visibility: string;
  user_id: string;
  users: {
    name: string;
    avatar_color: string | null;
  };
}

interface LivingDocument {
  id: string;
  content: string;
  version_number: number;
  change_summary: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [project, setProject] = useState<Project | null>(null);
  const [latestDoc, setLatestDoc] = useState<LivingDocument | null>(null);
  const [allVersions, setAllVersions] = useState<LivingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "history">("content");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const userId = session?.user?.id;
      if (!projectId || !userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError || !projectData) {
          console.error("Error fetching project:", projectError);
          setError("プロジェクトの読み込みに失敗しました");
          setLoading(false);
          return;
        }

        // Fetch owner info
        const { data: ownerData } = await supabase
          .from("users")
          .select("name, avatar_color")
          .eq("id", projectData.user_id)
          .single();

        const projectWithOwner = {
          ...projectData,
          users: ownerData || { name: "不明", avatar_color: null },
        };

        setProject(projectWithOwner);
        setIsOwner(projectData.user_id === userId);

        // Fetch latest living document
        const { data: latestDocData } = await supabase
          .from("living_documents")
          .select("*")
          .eq("project_id", projectId)
          .order("version_number", { ascending: false })
          .limit(1)
          .single();

        setLatestDoc(latestDocData || null);

        // Fetch all versions for history
        const { data: allVersionsData } = await supabase
          .from("living_documents")
          .select("*")
          .eq("project_id", projectId)
          .order("version_number", { ascending: false });

        setAllVersions(allVersionsData || []);
      } catch (error) {
        console.error("Error:", error);
        setError("データの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, supabase, session?.user?.id, router]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays === 0) return "今日";
    if (diffDays === 1) return "昨日";
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const handleUpdate = async () => {
    if (!newContent.trim() || !project) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newContent }),
      });

      if (!response.ok) {
        throw new Error("更新に失敗しました");
      }

      // Refresh data
      const { data: latestDocData } = await supabase
        .from("living_documents")
        .select("*")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      setLatestDoc(latestDocData || null);

      const { data: allVersionsData } = await supabase
        .from("living_documents")
        .select("*")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false });

      setAllVersions(allVersionsData || []);

      setNewContent("");
      setShowUpdateForm(false);
      setActiveTab("content");
    } catch (error) {
      console.error("Error updating:", error);
      alert("更新に失敗しました");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col px-5 py-6">
        <SkeletonCard height="h-6" className="w-16 mb-4" />
        <SkeletonCard height="h-8" className="w-24 mb-6" />
        <SkeletonCard height="h-12" className="mb-6" />
        <SkeletonCard height="h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col px-5 py-6">
        <button
          onClick={() => router.push("/projects")}
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← 戻る
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!project || !latestDoc) {
    return null;
  }

  const ownerName = project.users?.name || "不明";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/projects")}
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← 戻る
        </button>

        {/* Visibility tag */}
        <div className="mb-4">
          <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            {project.visibility === "public" ? "公開" : "限定公開"}
          </span>
        </div>

        {/* Owner info */}
        <div className="mb-6 flex items-center gap-3">
          <Avatar name={ownerName} size={32} />
          <div>
            <p className="text-sm font-semibold text-foreground">{ownerName}</p>
            <p className="text-xs text-muted">
              最終更新 {formatRelativeTime(latestDoc.created_at)}
            </p>
          </div>
        </div>

        {/* Project title */}
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {project.title}
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border-warm">
          <button
            onClick={() => setActiveTab("content")}
            className={`pb-2 text-sm font-semibold transition-colors ${
              activeTab === "content"
                ? "border-b-2 border-primary text-primary"
                : "text-muted"
            }`}
          >
            内容
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-primary text-primary"
                : "text-muted"
            }`}
          >
            更新履歴
          </button>
        </div>

        {/* Content tab */}
        {activeTab === "content" && (
          <div>
            {/* Living document content */}
            <div className="mb-6 rounded-2xl border border-border-warm bg-white p-4">
              <div className="markdown-content text-sm text-foreground [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:mb-3 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-1 [&_strong]:font-semibold">
                <ReactMarkdown>{latestDoc.content}</ReactMarkdown>
              </div>
            </div>

            {/* Update form (owner only) */}
            {isOwner && (
              <div>
                {!showUpdateForm ? (
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="w-full rounded-xl border-2 border-primary bg-white px-5 py-3.5 font-semibold text-primary transition-transform active:scale-[0.98]"
                  >
                    ＋ 新しい内容を追加して更新する
                  </button>
                ) : (
                  <div className="rounded-2xl border border-border-warm bg-white p-4">
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="新しいブレインストーミングの内容を入力してください..."
                      className="mb-4 min-h-[120px] w-full rounded-xl border border-border-warm bg-bg-warm p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowUpdateForm(false);
                          setNewContent("");
                        }}
                        className="flex-1 rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm font-semibold text-foreground"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={updating || !newContent.trim()}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98] ${
                          updating || !newContent.trim()
                            ? "bg-muted opacity-50"
                            : "bg-primary"
                        }`}
                      >
                        {updating ? "更新中..." : "更新する"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4">
            {allVersions.map((version) => (
              <div
                key={version.id}
                className="flex gap-3 rounded-xl border border-border-warm bg-white p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                  v{version.version_number}
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    {version.change_summary}
                  </p>
                  <p className="text-xs text-muted">
                    {formatRelativeTime(version.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

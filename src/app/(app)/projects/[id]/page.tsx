"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@/lib/supabase-client";
import ReactMarkdown from "react-markdown";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { AtAGlanceCard } from "@/components/projects/AtAGlanceCard";
import { MilestoneCard } from "@/components/projects/MilestoneCard";
import { WeeklyReflectionForm } from "@/components/reflections/WeeklyReflectionForm";
import { ReflectionInsight } from "@/components/reflections/ReflectionInsight";
import { CommentThread, type CommentWithMeta } from "@/components/comments/CommentThread";
import { CommentInput } from "@/components/comments/CommentInput";
import type { MilestoneWithTasks, Reflection } from "@/types/database";
import type { ProjectTabId } from "@/components/projects/ProjectTabs";

interface Project {
  id: string;
  title: string;
  status: string;
  visibility: string;
  user_id: string;
  progress_percentage?: number;
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
  const [activeTab, setActiveTab] = useState<ProjectTabId>("milestones");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneWithTasks[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [generatingMilestones, setGeneratingMilestones] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [comments, setComments] = useState<CommentWithMeta[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  function getStartOfWeekISO(): string {
    const d = new Date();
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  }

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    setLoadingMilestones(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestones(data.milestones ?? []);
      }
    } catch (e) {
      console.error("Error fetching milestones:", e);
    } finally {
      setLoadingMilestones(false);
    }
  }, [projectId]);

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

        const milestonesRes = await fetch(
          `/api/projects/${projectId}/milestones`
        );
        if (milestonesRes.ok) {
          const milestonesData = await milestonesRes.json();
          setMilestones(milestonesData.milestones ?? []);
        }
        const reflectionsRes = await fetch(
          `/api/reflections?project_id=${projectId}&weeks=12`
        );
        if (reflectionsRes.ok) {
          const reflectionsData = await reflectionsRes.json();
          setReflections(reflectionsData.reflections ?? []);
        }
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

  const handleGenerateMilestones = async () => {
    if (!projectId) return;
    setGeneratingMilestones(true);
    try {
      const res = await fetch("/api/milestones/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "マイルストーンの生成に失敗しました");
        return;
      }
      await fetchMilestones();
    } catch (e) {
      console.error("Error generating milestones:", e);
      alert("マイルストーンの生成に失敗しました");
    } finally {
      setGeneratingMilestones(false);
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/start`, {
        method: "POST",
      });
      if (res.ok) await fetchMilestones();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "開始に失敗しました");
      }
    } catch (e) {
      console.error("Error starting milestone:", e);
      alert("開始に失敗しました");
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/milestones/${milestoneId}/complete`, {
        method: "POST",
      });
      if (res.ok) await fetchMilestones();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "完了に失敗しました");
      }
    } catch (e) {
      console.error("Error completing milestone:", e);
      alert("完了に失敗しました");
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: isCompleted }),
      });
      if (res.ok) await fetchMilestones();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "タスクの更新に失敗しました");
      }
    } catch (e) {
      console.error("Error toggling task:", e);
      alert("タスクの更新に失敗しました");
    }
  };

  const fetchReflections = useCallback(async () => {
    if (!projectId) return;
    setLoadingReflections(true);
    try {
      const res = await fetch(
        `/api/reflections?project_id=${projectId}&weeks=12`
      );
      if (res.ok) {
        const data = await res.json();
        setReflections(data.reflections ?? []);
      }
    } catch (e) {
      console.error("Error fetching reflections:", e);
    } finally {
      setLoadingReflections(false);
    }
  }, [projectId]);

  const fetchComments = useCallback(async () => {
    if (!projectId) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setLoadingComments(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "comments" && projectId) fetchComments();
  }, [activeTab, projectId, fetchComments]);

  const handleSubmitReflection = async (responses: {
    what_worked: string;
    wins: string;
    blockers: string;
  }) => {
    if (!projectId) return;
    setSubmittingReflection(true);
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          what_worked: responses.what_worked,
          wins: responses.wins,
          blockers: responses.blockers,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "振り返りの送信に失敗しました");
        return;
      }
      await fetchReflections();
      if (data.new_milestones_generated) await fetchMilestones();
    } catch (e) {
      console.error("Error submitting reflection:", e);
      alert("振り返りの送信に失敗しました");
    } finally {
      setSubmittingReflection(false);
    }
  };

  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    if (!projectId || !content?.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          content: content.trim(),
          parent_comment_id: parentId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "コメントの投稿に失敗しました");
        return;
      }
      await fetchComments();
    } catch (e) {
      console.error("Error submitting comment:", e);
      alert("コメントの投稿に失敗しました");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReactionToggle = async (commentId: string, emoji: string) => {
    const comment = findCommentWithMeta(comments, commentId);
    const hasReaction = comment?.user_reaction === emoji;
    try {
      if (hasReaction) {
        const res = await fetch(
          `/api/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`,
          { method: "DELETE" }
        );
        if (res.ok) await fetchComments();
      } else {
        const res = await fetch(`/api/comments/${commentId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) await fetchComments();
      }
    } catch (e) {
      console.error("Error toggling reaction:", e);
    }
  };

  function findCommentWithMeta(
    list: CommentWithMeta[],
    id: string
  ): CommentWithMeta | null {
    for (const c of list) {
      if (c.id === id) return c;
      const found = findCommentWithMeta(c.replies, id);
      if (found) return found;
    }
    return null;
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("このコメントを削除しますか？")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchComments();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "削除に失敗しました");
      }
    } catch (e) {
      console.error("Error deleting comment:", e);
      alert("削除に失敗しました");
    }
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
      setActiveTab("living-doc");
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

        {/* At a glance */}
        {(() => {
          const current = milestones.find((m) => m.status === "in_progress");
          const totalTasks = milestones.reduce(
            (acc, m) => acc + m.tasks.length,
            0
          );
          const completedTasks = milestones.reduce(
            (acc, m) =>
              acc + m.tasks.filter((t) => t.is_completed).length,
            0
          );
          const total = milestones.length;
          const overallPct =
            total > 0
              ? Math.round(
                  milestones.reduce(
                    (acc, m) =>
                      acc +
                      (m.status === "completed"
                        ? 100
                        : m.completion_percentage),
                    0
                  ) / total
                )
              : 0;
          return (
            <AtAGlanceCard
              currentMilestone={current ?? null}
              completedCount={completedTasks}
              totalCount={totalTasks}
              overallPercentage={overallPct}
            />
          );
        })()}

        <ProjectTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Milestones tab */}
        {activeTab === "milestones" && (
          <div className="flex flex-col gap-4">
            {loadingMilestones ? (
              <SkeletonCard height="h-24" className="mb-4" />
            ) : milestones.length === 0 ? (
              <>
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleGenerateMilestones}
                    disabled={generatingMilestones}
                    className="w-full rounded-xl border-2 border-primary bg-white px-5 py-3.5 font-semibold text-primary transition-transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {generatingMilestones
                      ? "生成中..."
                      : "マイルストーンを生成する"}
                  </button>
                )}
                {!isOwner && (
                  <p className="text-sm text-muted">
                    まだマイルストーンはありません。
                  </p>
                )}
              </>
            ) : (
              <>
                {milestones
                  .filter((m) => m.status !== "completed")
                  .map((m) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      isOwner={isOwner}
                      onStart={handleStartMilestone}
                      onComplete={handleCompleteMilestone}
                      onToggleTask={handleToggleTask}
                    />
                  ))}
                {milestones.some((m) => m.status === "completed") && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setCompletedExpanded(!completedExpanded)}
                      className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-muted"
                    >
                      完了済み ({milestones.filter((m) => m.status === "completed").length})
                      <span>{completedExpanded ? "▲" : "▼"}</span>
                    </button>
                    {completedExpanded &&
                      milestones
                        .filter((m) => m.status === "completed")
                        .map((m) => (
                          <MilestoneCard
                            key={m.id}
                            milestone={m}
                            isOwner={isOwner}
                            onStart={handleStartMilestone}
                            onComplete={handleCompleteMilestone}
                            onToggleTask={handleToggleTask}
                          />
                        ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Living doc tab */}
        {activeTab === "living-doc" && (
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

        {/* Comments tab */}
        {activeTab === "comments" && (
          <div className="flex flex-col gap-4">
            <CommentInput
              onSubmit={(content) => handleSubmitComment(content, null)}
              placeholder="プロジェクトにコメント..."
              disabled={submittingComment}
            />
            {loadingComments ? (
              <SkeletonCard height="h-24" className="mb-4" />
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted">まだコメントはありません。</p>
            ) : (
              <CommentThread
                comments={comments}
                currentUserId={session?.user?.id ?? ""}
                onReply={(parentId, content) => handleSubmitComment(content, parentId)}
                onReactionToggle={handleReactionToggle}
                onDelete={handleDeleteComment}
              />
            )}
          </div>
        )}

        {/* Reflection tab */}
        {activeTab === "reflection" && (
          <div className="flex flex-col gap-4">
            {loadingReflections ? (
              <SkeletonCard height="h-32" className="mb-4" />
            ) : (() => {
              const weekStart = getStartOfWeekISO();
              const thisWeek = reflections.find(
                (r) => r.week_of && r.week_of.slice(0, 10) === weekStart
              );
              if (thisWeek) {
                return (
                  <>
                    <p className="text-sm font-semibold text-success">
                      今週の振り返りは完了しています
                    </p>
                    {thisWeek.ai_insight && (
                      <ReflectionInsight
                        insight={thisWeek.ai_insight}
                        livingDocUpdated={thisWeek.living_doc_updated}
                        newMilestonesGenerated={
                          thisWeek.new_milestones_generated
                        }
                      />
                    )}
                    {reflections.filter((r) => r.id !== thisWeek.id).length >
                      0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold text-muted">
                          過去の振り返り
                        </p>
                        <div className="flex flex-col gap-2">
                          {reflections
                            .filter((r) => r.id !== thisWeek.id)
                            .slice(0, 5)
                            .map((r) => (
                              <div
                                key={r.id}
                                className="rounded-xl border border-border-warm bg-white p-3"
                              >
                                <p className="text-xs text-muted">
                                  週 {r.week_of}
                                </p>
                                {r.ai_insight && (
                                  <p className="mt-1 line-clamp-2 text-sm text-foreground">
                                    {r.ai_insight}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              }
              return (
                <div className="rounded-2xl border border-border-warm bg-white p-4">
                  <WeeklyReflectionForm
                    projectId={projectId}
                    onSubmit={handleSubmitReflection}
                    isSubmitting={submittingReflection}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

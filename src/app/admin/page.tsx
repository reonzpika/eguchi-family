import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import { CreateSharedProjectButton } from "@/components/admin/CreateSharedProjectButton";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch all statistics and check for shared project
  const [membersResult, ideasResult, projectsResult, docsResult, sharedProject] =
    await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("ideas").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase
        .from("living_documents")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id")
        .eq("shared_with_all", true)
        .limit(1)
        .maybeSingle(),
    ]);

  const stats = {
    members: membersResult.count || 0,
    ideas: ideasResult.count || 0,
    projects: projectsResult.count || 0,
    livingDocs: docsResult.count || 0,
  };

  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Title */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-5">
        <h1 className="text-lg font-extrabold text-foreground">
          管理ダッシュボード
        </h1>
        <p className="mt-1 text-xs text-muted">アプリの統計情報</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">👥</div>
          <div className="mt-1 text-xl font-extrabold text-primary">
            {stats.members}人
          </div>
          <div className="text-xs text-muted">メンバー</div>
        </div>
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">💡</div>
          <div className="mt-1 text-xl font-extrabold text-primary">
            {stats.ideas}件
          </div>
          <div className="text-xs text-muted">アイデア</div>
        </div>
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">📁</div>
          <div className="mt-1 text-xl font-extrabold text-[#6B9EF9]">
            {stats.projects}件
          </div>
          <div className="text-xs text-muted">プロジェクト</div>
        </div>
        <div className="rounded-2xl border border-border-warm bg-white p-4 text-center">
          <div className="text-2xl">📄</div>
          <div className="mt-1 text-xl font-extrabold text-success">
            {stats.livingDocs}件
          </div>
          <div className="text-xs text-muted">リビングドキュメント</div>
        </div>
      </div>

      {/* Create shared project */}
      <CreateSharedProjectButton
        hasSharedProject={!!sharedProject.data?.id}
      />

      {/* Navigation links */}
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/hub"
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              🎯 ファミリーハブ・ミッション
            </div>
            <div className="mt-1 text-xs text-muted">
              AIツール向けミッションを追加
            </div>
          </div>
          <span className="text-muted">→</span>
        </Link>

        <Link
          href="/admin/members"
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              👥 メンバー管理
            </div>
            <div className="mt-1 text-xs text-muted">
              家族メンバーのロールを変更
            </div>
          </div>
          <span className="text-muted">→</span>
        </Link>

        <Link
          href="/admin/health"
          className="flex items-center justify-between rounded-2xl border border-border-warm bg-white p-4 text-left transition-transform active:scale-[0.98]"
        >
          <div>
            <div className="text-base font-bold text-foreground">
              🤖 AIヘルスチェック
            </div>
            <div className="mt-1 text-xs text-muted">AIサービスの動作確認</div>
          </div>
          <span className="text-muted">→</span>
        </Link>
      </div>
    </div>
  );
}

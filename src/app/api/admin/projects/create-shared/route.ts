import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";
import { recordActivity } from "@/lib/activity-feed";

const PROJECT_TITLE = "Family Workspace アプリ改善";
const PROJECT_DESCRIPTION = "江口ファミリーのFamily Workspaceアプリを継続的に改善するための共有プロジェクト。全員が編集・参加できます。";

const LIVING_DOC_CONTENT = `## 🎯 ビジョン

Family Workspace（江口ファミリー）アプリを家族全員で継続的に改善し、アイデア発見からプロジェクト実行までを支える温かいツールに育てる。

## 📦 現状

- **完了:** Phase 1–6（認証、アイデア、プロジェクト、ミルストーン、振り返り、アクティビティ、コメント、通知、プッシュ）
- **保留:** Phase 7（プロジェクトチャット、Web検索、リビングドキュメントポップアップ）、@メンション通知

## 📋 バックログ

改善アイデア、バグ、機能リクエストをここに蓄積する。

- （コメントやリビングドキュメントの更新で追加）

## 🗺️ ロードマップ

優先順位をつけて、次に実装する機能を決める。

## 📅 次のステップ

1. コメントで改善点を議論する
2. バックログにアイデアを追加する
3. 優先順位を決める
4. スプリント計画を立てる
5. 実装状況を追跡する
`;

const MILESTONES = [
  {
    title: "コミュニケーション",
    description: "コメントで改善点、バグ、アイデアを議論する",
    tasks: [
      { title: "プロジェクトのコメントタブを確認する", description: "" },
      { title: "改善したい点をコメントで共有する", description: "" },
    ],
  },
  {
    title: "バックログ",
    description: "改善アイデアをリビングドキュメントに蓄積する",
    tasks: [
      { title: "リビングドキュメントのバックログセクションを確認する", description: "" },
      { title: "新しい改善アイデアを追加する", description: "" },
    ],
  },
  {
    title: "優先順位付け",
    description: "次に作る機能を決める",
    tasks: [
      { title: "バックログから候補を選ぶ", description: "" },
      { title: "家族で優先順位を決める", description: "" },
    ],
  },
  {
    title: "スプリント計画",
    description: "短期サイクルで作業を計画する",
    tasks: [
      { title: "1–2週間のスプリント期間を決める", description: "" },
      { title: "スプリントでやりたいことをリストにする", description: "" },
    ],
  },
  {
    title: "実装追跡",
    description: "実装状況を追跡し、完了したら更新する",
    tasks: [
      { title: "タスクを完了したらチェックする", description: "" },
      { title: "マイルストーン完了時に振り返る", description: "" },
    ],
  },
];

/**
 * Admin-only: create the shared "Family Workspace" improvement project.
 * One-off: only one such project should exist.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json(
        { error: "この操作は管理者のみ実行できます。" },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // Check if shared project already exists
    const { data: existing } = await admin
      .from("projects")
      .select("id")
      .eq("shared_with_all", true)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "共有プロジェクトは既に存在します。", projectId: existing[0].id },
        { status: 409 }
      );
    }

    const { data: project, error: projectError } = await admin
      .from("projects")
      .insert({
        user_id: session.user.id,
        title: PROJECT_TITLE,
        description: PROJECT_DESCRIPTION,
        status: "planning",
        visibility: "public",
        shared_with_all: true,
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error("Error creating shared project:", projectError);
      return NextResponse.json(
        { error: "プロジェクトの作成に失敗しました。" },
        { status: 500 }
      );
    }

    const { error: docError } = await admin
      .from("living_documents")
      .insert({
        project_id: project.id,
        content: LIVING_DOC_CONTENT,
        version_number: 1,
        change_summary: "初版作成",
      });

    if (docError) {
      console.error("Error creating living document:", docError);
      return NextResponse.json(
        { error: "リビングドキュメントの作成に失敗しました。" },
        { status: 500 }
      );
    }

    for (let i = 0; i < MILESTONES.length; i++) {
      const m = MILESTONES[i];
      const { data: milestone } = await admin
        .from("milestones")
        .insert({
          project_id: project.id,
          title: m.title,
          description: m.description ?? null,
          sequence_order: i + 1,
          status: "not_started",
        })
        .select("id")
        .single();

      if (milestone && m.tasks?.length) {
        for (let j = 0; j < m.tasks.length; j++) {
          const t = m.tasks[j];
          await admin.from("tasks").insert({
            milestone_id: milestone.id,
            title: t.title || `タスク ${j + 1}`,
            description: t.description ?? null,
            sequence_order: j + 1,
            is_completed: false,
          });
        }
      }
    }

    await recordActivity(session.user.id, {
      activity_type: "project_created",
      title: `${PROJECT_TITLE} を作成しました`,
      project_id: project.id,
      emoji: "📁",
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error("Error in create-shared project:", error);
    return NextResponse.json(
      { error: "プロジェクトの作成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

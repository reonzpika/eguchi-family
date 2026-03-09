-- Seed the shared "Family Workspace アプリ改善" project.
-- Runs only if no shared project exists and at least one user exists.
-- Uses admin user (member_id = 'ryo') as nominal owner, or first user if ryo not found.

DO $$
DECLARE
  v_admin_id TEXT;
  v_project_id UUID;
  v_milestone_id UUID;
  v_milestone RECORD;
  v_task RECORD;
  v_has_shared INTEGER;
  v_user_count INTEGER;
  v_living_doc TEXT := E'## 🎯 ビジョン

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
';
BEGIN
  SELECT COUNT(*) INTO v_has_shared FROM public.projects WHERE shared_with_all = TRUE;
  IF v_has_shared > 0 THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_user_count FROM public.users;
  IF v_user_count = 0 THEN
    RETURN;
  END IF;

  SELECT id::TEXT INTO v_admin_id FROM public.users WHERE member_id = 'ryo' LIMIT 1;
  IF v_admin_id IS NULL THEN
    SELECT id::TEXT INTO v_admin_id FROM public.users LIMIT 1;
  END IF;
  IF v_admin_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.projects (user_id, title, description, status, visibility, shared_with_all)
  VALUES (
    v_admin_id,
    'Family Workspace アプリ改善',
    '江口ファミリーのFamily Workspaceアプリを継続的に改善するための共有プロジェクト。全員が編集・参加できます。',
    'planning',
    'public',
    TRUE
  )
  RETURNING id INTO v_project_id;

  INSERT INTO public.living_documents (project_id, content, version_number, change_summary)
  VALUES (v_project_id, v_living_doc, 1, '初版作成');

  INSERT INTO public.milestones (project_id, title, description, sequence_order, status)
  VALUES
    (v_project_id, 'コミュニケーション', 'コメントで改善点、バグ、アイデアを議論する', 1, 'not_started'),
    (v_project_id, 'バックログ', '改善アイデアをリビングドキュメントに蓄積する', 2, 'not_started'),
    (v_project_id, '優先順位付け', '次に作る機能を決める', 3, 'not_started'),
    (v_project_id, 'スプリント計画', '短期サイクルで作業を計画する', 4, 'not_started'),
    (v_project_id, '実装追跡', '実装状況を追跡し、完了したら更新する', 5, 'not_started');

  FOR v_milestone IN
    SELECT id, sequence_order FROM public.milestones WHERE project_id = v_project_id ORDER BY sequence_order
  LOOP
    IF v_milestone.sequence_order = 1 THEN
      INSERT INTO public.tasks (milestone_id, title, description, sequence_order, is_completed)
      VALUES
        (v_milestone.id, 'プロジェクトのコメントタブを確認する', '', 1, FALSE),
        (v_milestone.id, '改善したい点をコメントで共有する', '', 2, FALSE);
    ELSIF v_milestone.sequence_order = 2 THEN
      INSERT INTO public.tasks (milestone_id, title, description, sequence_order, is_completed)
      VALUES
        (v_milestone.id, 'リビングドキュメントのバックログセクションを確認する', '', 1, FALSE),
        (v_milestone.id, '新しい改善アイデアを追加する', '', 2, FALSE);
    ELSIF v_milestone.sequence_order = 3 THEN
      INSERT INTO public.tasks (milestone_id, title, description, sequence_order, is_completed)
      VALUES
        (v_milestone.id, 'バックログから候補を選ぶ', '', 1, FALSE),
        (v_milestone.id, '家族で優先順位を決める', '', 2, FALSE);
    ELSIF v_milestone.sequence_order = 4 THEN
      INSERT INTO public.tasks (milestone_id, title, description, sequence_order, is_completed)
      VALUES
        (v_milestone.id, '1–2週間のスプリント期間を決める', '', 1, FALSE),
        (v_milestone.id, 'スプリントでやりたいことをリストにする', '', 2, FALSE);
    ELSIF v_milestone.sequence_order = 5 THEN
      INSERT INTO public.tasks (milestone_id, title, description, sequence_order, is_completed)
      VALUES
        (v_milestone.id, 'タスクを完了したらチェックする', '', 1, FALSE),
        (v_milestone.id, 'マイルストーン完了時に振り返る', '', 2, FALSE);
    END IF;
  END LOOP;

  INSERT INTO public.activity_feed (user_id, activity_type, title, emoji, project_id, is_private)
  VALUES (v_admin_id, 'project_created', 'Family Workspace アプリ改善 を作成しました', '📁', v_project_id, FALSE);
END $$;

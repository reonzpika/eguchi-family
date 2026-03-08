import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";
import type { Comment } from "@/types/database";

const MENTION_REGEX = /@(\S+)/g;

function extractMentions(content: string): string[] {
  const matches = content.match(MENTION_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1).trim()).filter(Boolean))];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id") ?? undefined;
    const milestone_id = searchParams.get("milestone_id") ?? undefined;
    const activity_feed_id = searchParams.get("activity_feed_id") ?? undefined;

    if (!project_id && !milestone_id && !activity_feed_id) {
      return NextResponse.json(
        { error: "project_id, milestone_id, or activity_feed_id is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    let query = admin
      .from("comments")
      .select("*")
      .eq("is_deleted", false);

    if (project_id) query = query.eq("project_id", project_id);
    if (milestone_id) query = query.eq("milestone_id", milestone_id);
    if (activity_feed_id) query = query.eq("activity_feed_id", activity_feed_id);

    const { data: commentsRows, error: commentsError } = await query.order(
      "created_at",
      { ascending: true }
    );

    if (commentsError) {
      console.error("Comments fetch error:", commentsError);
      return NextResponse.json(
        { error: "コメントの取得に失敗しました。" },
        { status: 500 }
      );
    }

    const comments = (commentsRows ?? []) as Comment[];
    const userIds = [...new Set(comments.map((c) => c.user_id))];
    const { data: usersData } = await admin
      .from("users")
      .select("id, name")
      .in("id", userIds);

    const userMap = new Map(
      (usersData ?? []).map((u: { id: string; name: string | null }) => [
        u.id,
        { id: u.id, name: u.name ?? "不明" },
      ])
    );

    const commentIds = comments.map((c) => c.id);
    const { data: reactionsRows } = await admin
      .from("reactions")
      .select("comment_id, emoji, user_id")
      .in("comment_id", commentIds);

    const reactionCountsByComment: Record<string, Record<string, number>> = {};
    const userReactionByComment: Record<string, string> = {};
    for (const r of reactionsRows ?? []) {
      const cid = r.comment_id;
      if (!reactionCountsByComment[cid]) reactionCountsByComment[cid] = {};
      reactionCountsByComment[cid][r.emoji] =
        (reactionCountsByComment[cid][r.emoji] ?? 0) + 1;
      if (r.user_id === session.user.id) userReactionByComment[cid] = r.emoji;
    }

    type CommentWithMeta = Comment & {
      user: { id: string; name: string };
      replies: CommentWithMeta[];
      reaction_counts: Record<string, number>;
      user_reaction: string | null;
    };

    const buildTree = (parentId: string | null): CommentWithMeta[] =>
      comments
        .filter((c) => (c.parent_comment_id ?? null) === parentId)
        .map((c) => ({
          ...c,
          user: userMap.get(c.user_id) ?? { id: c.user_id, name: "不明" },
          replies: buildTree(c.id),
          reaction_counts: reactionCountsByComment[c.id] ?? {},
          user_reaction: userReactionByComment[c.id] ?? null,
        }));

    const tree = buildTree(null);

    return NextResponse.json({ comments: tree });
  } catch (err) {
    console.error("Comments GET error:", err);
    return NextResponse.json(
      { error: "コメントの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      content,
      project_id,
      milestone_id,
      activity_feed_id,
      living_doc_section,
      parent_comment_id,
    } = body as {
      content?: string;
      project_id?: string;
      milestone_id?: string;
      activity_feed_id?: string;
      living_doc_section?: string;
      parent_comment_id?: string;
    };

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const hasTarget =
      project_id || milestone_id || activity_feed_id || (living_doc_section && project_id);
    if (!hasTarget) {
      return NextResponse.json(
        { error: "project_id, milestone_id, or activity_feed_id is required" },
        { status: 400 }
      );
    }

    let thread_depth = 0;
    if (parent_comment_id) {
      const admin = createAdminClient();
      const { data: parent } = await admin
        .from("comments")
        .select("thread_depth")
        .eq("id", parent_comment_id)
        .single();
      thread_depth = Math.min(3, (parent?.thread_depth ?? 0) + 1);
    }

    const mentions = extractMentions(content.trim());

    const admin = createAdminClient();
    const { data: comment, error } = await admin
      .from("comments")
      .insert({
        user_id: session.user.id,
        content: content.trim(),
        project_id: project_id ?? null,
        milestone_id: milestone_id ?? null,
        activity_feed_id: activity_feed_id ?? null,
        living_doc_section: living_doc_section ?? null,
        parent_comment_id: parent_comment_id ?? null,
        thread_depth,
        mentions,
      })
      .select()
      .single();

    if (error) {
      console.error("Comment insert error:", error);
      return NextResponse.json(
        { error: "コメントの投稿に失敗しました。" },
        { status: 500 }
      );
    }

    if (project_id) {
      const { data: projectRow } = await admin
        .from("projects")
        .select("user_id, title")
        .eq("id", project_id)
        .single();
      if (projectRow && projectRow.user_id !== session.user.id) {
        const { data: commenter } = await admin
          .from("users")
          .select("name")
          .eq("id", session.user.id)
          .single();
        const commenterName = commenter?.name ?? "誰か";
        await sendNotification({
          user_id: projectRow.user_id,
          type: "comment_on_project",
          title: "プロジェクトにコメントがありました",
          body: `${commenterName} が「${projectRow.title}」にコメントしました。`,
          action_url: `/projects/${project_id}`,
          project_id,
          comment_id: comment.id,
          priority: "medium",
        });
      }
    }

    return NextResponse.json({ comment });
  } catch (err) {
    console.error("Comments POST error:", err);
    return NextResponse.json(
      { error: "コメントの投稿に失敗しました。" },
      { status: 500 }
    );
  }
}

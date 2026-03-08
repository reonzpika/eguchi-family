"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CommentInput } from "@/components/comments/CommentInput";
import { ReactionPicker } from "@/components/comments/ReactionPicker";

export interface CommentWithMeta {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  user: { id: string; name: string };
  replies: CommentWithMeta[];
  reaction_counts: Record<string, number>;
  user_reaction: string | null;
}

interface CommentThreadProps {
  comments: CommentWithMeta[];
  currentUserId: string;
  onReply: (parentId: string | null, content: string) => void;
  onReactionToggle: (commentId: string, emoji: string) => void;
  onDelete?: (commentId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onReactionToggle,
  onDelete,
  depth = 0,
}: {
  comment: CommentWithMeta;
  currentUserId: string;
  onReply: (parentId: string | null, content: string) => void;
  onReactionToggle: (commentId: string, emoji: string) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const marginLeft = depth > 0 ? "ml-4 border-l-2 border-border-warm pl-3" : "";

  return (
    <div className={`py-2 ${marginLeft}`}>
      <div className="flex gap-2">
        <Avatar name={comment.user.name} size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-semibold text-foreground">{comment.user.name}</span>
            <span className="ml-2 text-xs text-muted">{formatDate(comment.created_at)}</span>
            {comment.is_edited ? (
              <span className="ml-1 text-xs text-muted">（編集済み）</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-sm text-foreground">{comment.content || "（削除されたコメント）"}</p>
          <ReactionPicker
            commentId={comment.id}
            userReaction={comment.user_reaction}
            reactionCounts={comment.reaction_counts}
            onToggle={(emoji) => onReactionToggle(comment.id, emoji)}
          />
          {depth < 2 ? (
            <button
              type="button"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="mt-1 text-xs text-muted underline hover:text-primary"
            >
              {showReplyInput ? "キャンセル" : "返信"}
            </button>
          ) : null}
          {comment.user_id === currentUserId && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="ml-2 text-xs text-muted underline hover:text-red-600"
            >
              削除
            </button>
          ) : null}
          {showReplyInput ? (
            <div className="mt-2">
              <CommentInput
                placeholder="返信を入力..."
                onSubmit={(content) => {
                  onReply(comment.id, content);
                  setShowReplyInput(false);
                }}
              />
            </div>
          ) : null}
          {comment.replies.length > 0 ? (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onReactionToggle={onReactionToggle}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  comments,
  currentUserId,
  onReply,
  onReactionToggle,
  onDelete,
}: CommentThreadProps) {
  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onReactionToggle={onReactionToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { MilestoneWithTasks, Task } from "@/types/database";

interface MilestoneCardProps {
  milestone: MilestoneWithTasks;
  isOwner: boolean;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
  /** When set, "開始する" shows a confirmation before switching (pause other milestone). */
  otherInProgressMilestoneTitle?: string | null;
}

function TaskCheckbox({
  task,
  disabled,
  onToggle,
}: {
  task: Task;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="flex min-h-[48px] w-full items-center gap-3 rounded-xl border border-border-warm bg-white px-4 py-3 text-left transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
          task.is_completed
            ? "border-success bg-success text-white"
            : "border-muted bg-white"
        }`}
      >
        {task.is_completed ? "✓" : ""}
      </span>
      <span
        className={`text-sm text-foreground ${
          task.is_completed ? "line-through text-muted" : ""
        }`}
      >
        {task.title}
      </span>
    </button>
  );
}

export function MilestoneCard({
  milestone,
  isOwner,
  onStart,
  onComplete,
  onToggleTask,
  otherInProgressMilestoneTitle,
}: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(milestone.status === "in_progress");

  const handleStartClick = () => {
    if (otherInProgressMilestoneTitle?.trim()) {
      const ok = window.confirm(
        `「${otherInProgressMilestoneTitle}」を一時停止して、このマイルストーンに取り組みますか？`
      );
      if (ok) onStart(milestone.id);
    } else {
      onStart(milestone.id);
    }
  };
  const isNotStarted = milestone.status === "not_started";
  const isInProgress = milestone.status === "in_progress";
  const isCompleted = milestone.status === "completed";
  const allTasksDone =
    milestone.tasks.length > 0 &&
    milestone.tasks.every((t) => t.is_completed);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`rounded-2xl border border-border-warm bg-white overflow-hidden transition-opacity ${
        isNotStarted ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full min-h-[48px] items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-xs font-bold text-white">
              ✓
            </span>
          )}
          <span
            className={`text-sm font-semibold ${
              isCompleted ? "text-success" : "text-foreground"
            }`}
          >
            {milestone.sequence_order}. {milestone.title}
          </span>
        </div>
        <span className="text-muted text-sm">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border-warm px-4 pb-4 pt-2">
          {milestone.description && (
            <p className="mb-3 text-xs text-muted">{milestone.description}</p>
          )}

          {isInProgress && (
            <>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border-warm">
                <div
                  className="h-full rounded-full bg-secondary transition-[width] duration-300"
                  style={{
                    width: `${milestone.completion_percentage}%`,
                  }}
                />
              </div>
              <div className="mb-4 flex flex-col gap-2">
                {milestone.tasks.map((task) => (
                  <TaskCheckbox
                    key={task.id}
                    task={task}
                    disabled={!isOwner}
                    onToggle={() =>
                      onToggleTask(task.id, !task.is_completed)
                    }
                  />
                ))}
              </div>
              {isOwner && allTasksDone && (
                <button
                  type="button"
                  onClick={() => onComplete(milestone.id)}
                  className="w-full rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
                >
                  完了する
                </button>
              )}
            </>
          )}

          {isNotStarted && isOwner && (
            <button
              type="button"
              onClick={handleStartClick}
              className="w-full rounded-xl border-2 border-primary bg-white px-4 py-3 text-sm font-semibold text-primary transition-transform active:scale-[0.98]"
            >
              開始する
            </button>
          )}

          {isCompleted && milestone.completed_at && (
            <p className="text-xs text-muted">
              完了日: {formatDate(milestone.completed_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

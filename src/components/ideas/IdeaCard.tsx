"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export interface Idea {
  id: string;
  title: string;
  polished_content: string | null;
  updated_at: string;
  status?: "exploring" | "validated" | "promoted";
}

interface IdeaCardProps {
  idea: Idea;
  /** If provided, the card is a link to this href (recommended for idea detail). */
  href?: string;
  /** Used when href is not provided (e.g. custom actions). */
  onClick?: () => void;
  /** When provided with href, shows a 3-dot menu with these actions. */
  onRename?: (idea: Idea) => void;
  onMoveToProject?: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
}

function truncate(text: string | null, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const cardContentBase = "text-left";
const cardPadding = "p-4";

export function IdeaCard({
  idea,
  href,
  onClick,
  onRename,
  onMoveToProject,
  onDelete,
}: IdeaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasMenu =
    href && (onRename != null || onMoveToProject != null || onDelete != null);

  useLayoutEffect(() => {
    if (!menuOpen || !triggerRef.current || !menuRef.current) {
      setMenuPosition(null);
      return;
    }
    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const padding = 16;
    const viewportW = typeof window !== "undefined" ? window.innerWidth : 390;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 600;
    let left = trigger.right - menu.width;
    if (left < padding) left = padding;
    if (left + menu.width > viewportW - padding) left = viewportW - menu.width - padding;
    let top = trigger.bottom + 4;
    if (top + menu.height > viewportH - padding) top = trigger.top - menu.height - 4;
    if (top < padding) top = padding;
    setMenuPosition({ top, left });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        cardRef.current?.contains(target) === false &&
        menuRef.current?.contains(target) === false
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const content = (
    <>
      <div className="mb-2 flex items-start gap-2 font-bold text-on-surface">
        <span className="material-symbols-outlined shrink-0 text-primary text-xl">lightbulb</span>
        <span>{idea.title}</span>
      </div>
      <p className="mb-2 text-xs leading-relaxed text-on-surface-variant">
        {truncate(idea.polished_content, 60)}
      </p>
      <div className="text-xs text-on-surface-variant">保存日: {formatDate(idea.updated_at)}</div>
    </>
  );

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      className="min-w-[180px] rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-1 shadow-lg"
      style={{
        position: "fixed",
        zIndex: 50,
        top: menuPosition?.top ?? -9999,
        left: menuPosition?.left ?? -9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {onRename && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setMenuOpen(false);
            onRename(idea);
          }}
          className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-on-surface hover:bg-surface-container-low"
        >
          タイトルを変更
        </button>
      )}
      {onMoveToProject && (
        <Link
          href={`/ideas/${idea.id}/validate`}
          role="menuitem"
          onClick={() => {
            setMenuOpen(false);
            onMoveToProject(idea);
          }}
          className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-on-surface hover:bg-surface-container-low"
        >
          プロジェクトに昇格
        </Link>
      )}
      {onDelete && (
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setMenuOpen(false);
            onDelete(idea);
          }}
          className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-error hover:bg-surface-container-low"
        >
          削除
        </button>
      )}
    </div>
  );

  if (hasMenu) {
    return (
      <>
        <div
          ref={cardRef}
          className="editorial-shadow relative flex w-full items-start gap-1 rounded-2xl bg-surface-container-lowest transition-transform active:scale-[0.98]"
        >
          <Link
            data-testid="idea-card-link"
            href={href!}
            className={`min-w-0 flex-1 ${cardPadding} ${cardContentBase}`}
          >
            {content}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="メニューを開く"
            className="flex h-10 w-10 min-h-[44px] shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
        {menuOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-40"
              aria-hidden
              onClick={(e) => {
                if (e.target === e.currentTarget) setMenuOpen(false);
              }}
            >
              {menuContent}
            </div>,
            document.body
          )}
      </>
    );
  }

  const cardClassName = `editorial-shadow w-full rounded-2xl bg-surface-container-lowest ${cardPadding} ${cardContentBase} transition-transform active:scale-[0.98]`;

  if (href) {
    return (
      <Link data-testid="idea-card-link" href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cardClassName}
    >
      {content}
    </button>
  );
}

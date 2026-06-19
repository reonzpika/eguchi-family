"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * First-run nudge shown at the top of the playground until the member has done
 * (or skipped) the "Claudeを用意しよう" setup. Per device, via localStorage.
 */
export function FirstRunBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(localStorage.getItem("claude_setup_done") !== "1");
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/setup"
      className="mb-5 flex items-center gap-3 rounded-2xl bg-primary-container p-4 shadow-sm transition-transform active:scale-[0.98]"
    >
      <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
        rocket_launch
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-on-primary-container">はじめてだね！まず、Claudeを用意しよう</span>
        <span className="block text-xs text-on-primary-container/80">5分で準備できるよ</span>
      </span>
      <span className="material-symbols-outlined text-on-primary-container">arrow_forward</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

/** Sticky top bar: Engawa tokens, AIMasterclass wordmark, avatar and notifications (Stitch mocks). */
export function StitchAppBar() {
  const { data: session } = useSession();

  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.name ?? "家族";

  return (
    <header className="sticky top-0 z-50 bg-[#f9f9f9]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container transition-opacity hover:opacity-90 active:scale-[0.98]"
            aria-label="設定へ"
          >
            <Avatar name={firstName} size={40} />
          </Link>
          <Link
            href="/"
            className="truncate font-headline text-lg font-bold tracking-tight text-primary sm:text-xl"
          >
            AIMasterclass
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationBell />
          <Link
            href="/settings"
            className="rounded-full p-2 text-on-surface transition-opacity hover:bg-surface-container-low hover:opacity-90 active:scale-[0.98]"
            aria-label="設定"
          >
            <span className="material-symbols-outlined text-2xl text-primary">settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

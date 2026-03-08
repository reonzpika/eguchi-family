"use client";

import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const { data: session } = useSession();

  if (!session?.user?.name) return null;

  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
    <header className="fixed left-1/2 top-0 z-50 flex w-full max-w-[390px] -translate-x-1/2 items-center justify-between border-b border-border-warm bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="text-sm font-extrabold text-foreground">
        🌸 Family Workspace
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <span className="text-sm font-semibold text-foreground">
          {firstName}
        </span>
        <Avatar name={firstName} size={32} />
      </div>
    </header>
  );
}

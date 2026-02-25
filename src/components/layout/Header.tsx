"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar } from "@/components/ui/Avatar";

export function Header() {
  const { user } = useUser();

  if (!user) return null;

  const firstName = user.firstName || user.fullName?.split(" ")[0] || "User";

  return (
    <header className="fixed left-1/2 top-0 z-50 flex w-full max-w-[390px] -translate-x-1/2 items-center justify-between border-b border-border-warm bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="text-sm font-extrabold text-foreground">
        🌸 江口ファミリーハブ
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {firstName}
        </span>
        <Avatar name={firstName} size={32} />
      </div>
    </header>
  );
}

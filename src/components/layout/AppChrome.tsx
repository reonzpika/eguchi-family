"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Hides Header and BottomNav on individual idea or project pages so the
 * page can use its own full-screen chrome (e.g. sticky idea header).
 */
function shouldHideChrome(pathname: string): boolean {
  if (!pathname) return false;
  const isIdeaDetail =
    pathname !== "/ideas" && pathname.startsWith("/ideas/");
  const isProjectDetail =
    pathname !== "/projects" && pathname.startsWith("/projects/");
  return isIdeaDetail || isProjectDetail;
}

export function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hide = shouldHideChrome(pathname ?? "");

  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-bg-warm">
      {!hide && <Header />}
      <main className={hide ? "h-dvh overflow-hidden" : "pb-20 pt-14"}>
        {children}
      </main>
      {!hide && <BottomNav />}
    </div>
  );
}

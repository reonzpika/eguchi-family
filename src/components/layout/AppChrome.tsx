"use client";

import { usePathname } from "next/navigation";
import { StitchAppBar } from "@/components/layout/StitchAppBar";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Hides Stitch app bar and bottom nav on detail pages that use their own full-screen chrome.
 */
function shouldHideChrome(pathname: string): boolean {
  if (!pathname) return false;
  const isIdeaDetail =
    pathname !== "/ideas" && pathname.startsWith("/ideas/");
  const isProjectDetail =
    pathname !== "/projects" && pathname.startsWith("/projects/");
  const isToolSubPage = /^\/tools\/(?!new$)[^/]+/.test(pathname);
  const isDiscussionThread =
    /^\/discussions\/[^/]+/.test(pathname) && pathname !== "/discussions";
  const isHubDetail = isToolSubPage || isDiscussionThread;
  return isIdeaDetail || isProjectDetail || isHubDetail;
}

export function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const hide = shouldHideChrome(pathname);
  // The town-map home fills the viewport exactly and must not scroll.
  const isHome = pathname === "/";

  const containerClassName = isHome
    ? "mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden bg-background"
    : "mx-auto min-h-screen w-full max-w-7xl bg-background";

  const mainClassName = hide
    ? "h-dvh overflow-hidden"
    : isHome
    ? "min-h-0 flex-1 overflow-hidden"
    : "min-h-dvh pb-28";

  return (
    <div className={containerClassName}>
      {!hide && <StitchAppBar />}
      <main className={mainClassName}>{children}</main>
      {!hide && <BottomNav />}
    </div>
  );
}

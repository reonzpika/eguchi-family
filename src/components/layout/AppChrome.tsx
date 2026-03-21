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

  const mainClassName = hide
    ? "h-dvh overflow-hidden"
    : "min-h-dvh pb-28";

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-background">
      {!hide && <StitchAppBar />}
      <main className={mainClassName}>{children}</main>
      {!hide && <BottomNav />}
    </div>
  );
}

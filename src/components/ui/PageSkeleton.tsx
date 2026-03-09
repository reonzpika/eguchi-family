"use client";

import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface PageSkeletonProps {
  /** Page-specific skeleton layout. Default: title + 2 filter rows + 3 cards */
  variant?: "default" | "list" | "detail" | "minimal";
  className?: string;
}

/**
 * Reusable page loading skeleton for consistent UX across data-fetching pages.
 * Prevents flash of empty state before data loads.
 */
export function PageSkeleton({ variant = "default", className = "" }: PageSkeletonProps) {
  if (variant === "minimal") {
    return (
      <div className={`flex min-h-[200px] flex-col items-center justify-center gap-3 py-12 ${className}`}>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard height="h-24" />
          <SkeletonCard height="h-24" />
        </div>
        <SkeletonCard height="h-24" />
        <SkeletonCard height="h-24" />
        <SkeletonCard height="h-24" />
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={`flex flex-col gap-4 px-5 py-6 ${className}`}>
        <SkeletonCard height="h-6" className="w-16" />
        <SkeletonCard height="h-8" className="w-48" />
        <SkeletonCard height="h-12" className="w-full" />
        <SkeletonCard height="h-40" />
        <SkeletonCard height="h-24" />
      </div>
    );
  }

  return (
    <div className={`flex min-h-[calc(100vh-140px)] flex-col gap-4 px-5 py-6 ${className}`}>
      <SkeletonCard height="h-8" className="w-32" />
      <div className="flex gap-2">
        <SkeletonCard height="h-10" className="w-20" />
        <SkeletonCard height="h-10" className="w-20" />
      </div>
      <div className="flex gap-2">
        <SkeletonCard height="h-10" className="w-16" />
        <SkeletonCard height="h-10" className="w-16" />
        <SkeletonCard height="h-10" className="w-16" />
      </div>
      <SkeletonCard height="h-40" />
      <SkeletonCard height="h-40" />
      <SkeletonCard height="h-40" />
    </div>
  );
}

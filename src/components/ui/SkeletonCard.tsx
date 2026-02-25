"use client";

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export function SkeletonCard({ height = "h-32", className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-warm bg-white p-4 animate-pulse ${height} ${className}`}
    >
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

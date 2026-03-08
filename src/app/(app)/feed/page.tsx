"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-warm">
      <p className="text-muted">リダイレクト中...</p>
    </div>
  );
}

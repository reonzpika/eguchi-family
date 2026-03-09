"use client";

import Link from "next/link";
import { PwaInstallCard } from "@/components/settings/PwaInstallCard";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/menu" className="text-sm text-primary">
          ← メニュー
        </Link>
        <h1 className="text-xl font-bold text-foreground">設定</h1>
        <span className="w-12" />
      </div>

      <div className="flex flex-col gap-4">
        <PwaInstallCard />
        <PushPermissionPrompt variant="settings" />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { NotificationList } from "@/components/notifications/NotificationList";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/menu" className="text-sm text-primary">
          ← メニュー
        </Link>
        <h1 className="text-xl font-bold text-foreground">通知</h1>
        <span className="w-12" />
      </div>
      <div className="mb-4">
        <PushPermissionPrompt />
      </div>
      <NotificationList />
    </div>
  );
}

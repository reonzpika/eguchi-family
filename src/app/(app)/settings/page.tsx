"use client";

import Link from "next/link";
import { DiscoverySection } from "@/components/discovery/DiscoverySection";
import { PwaInstallCard } from "@/components/settings/PwaInstallCard";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 pb-28 pt-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 font-headline text-3xl font-bold tracking-tight text-on-surface">
          設定
        </h1>

        <Link
          href="/menu"
          className="mb-6 flex items-center justify-between rounded-2xl bg-surface-container-lowest p-4 editorial-shadow transition-transform active:scale-[0.98]"
        >
          <div>
            <p className="font-headline font-bold text-on-surface">その他のメニュー</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              タイムライン、通知、ショーケースなど
            </p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </Link>

        <div className="flex flex-col gap-4">
          <DiscoverySection embedded />
          <PwaInstallCard />
          <PushPermissionPrompt variant="settings" />
        </div>
      </div>
    </div>
  );
}

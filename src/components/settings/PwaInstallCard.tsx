"use client";

import { useState, useEffect } from "react";

/** Non-standard; not in DOM lib. Chrome/Edge on Android. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) return true;
  return false;
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [mounted]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch {
      // User dismissed or error
    } finally {
      setInstalling(false);
    }
  };

  if (!mounted) return null;

  const installed = isStandalone();
  const hasPrompt = !!deferredPrompt;

  return (
    <div className="rounded-2xl border border-border-warm bg-white p-4">
      <p className="text-sm font-semibold text-foreground">📱 ホーム画面に追加</p>
      <p className="mt-1 text-xs text-muted">
        いつでもすぐにアクセスできます。アプリのように使えます。
      </p>
      {installed ? (
        <p className="mt-3 text-xs text-muted">インストール済み</p>
      ) : hasPrompt ? (
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className="mt-3 min-h-[44px] w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {installing ? "インストール中…" : "インストール"}
        </button>
      ) : (
        <p className="mt-3 text-xs text-muted">共有ボタン → ホーム画面に追加</p>
      )}
    </div>
  );
}

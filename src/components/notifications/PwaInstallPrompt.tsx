"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "show_pwa_install_prompt";
const STORAGE_KEY = "pwa_install_prompt_shown";
const DELAY_MS = 5000;

/** Non-standard; not in DOM lib. Chrome/Edge on Android. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) return true;
  return false;
}

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, dismiss]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldShow =
      sessionStorage.getItem(SESSION_KEY) === "1" &&
      localStorage.getItem(STORAGE_KEY) !== "1" &&
      isMobile() &&
      !isStandalone();

    if (!shouldShow) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.setItem(STORAGE_KEY, "1");
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

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
      dismiss();
    }
  };

  if (!visible) return null;

  const hasPrompt = !!deferredPrompt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div className="w-full max-w-[350px] rounded-2xl border border-border-warm bg-white p-4 shadow-lg">
        <p id="pwa-install-title" className="mb-2 text-center text-sm font-semibold text-foreground">
          ホーム画面に追加
        </p>
        <p className="mb-4 text-center text-xs text-muted">
          いつでもすぐにアクセスできます。アプリのように使えます。
        </p>

        {hasPrompt ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="min-h-[44px] w-full rounded-xl bg-primary py-3 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {installing ? "インストール中…" : "インストール"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl border border-border-warm bg-white py-3 font-semibold text-foreground transition-transform active:scale-[0.98]"
            >
              あとで
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-center text-xs text-muted">
              共有ボタン → ホーム画面に追加
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-[44px] w-full rounded-xl bg-primary py-3 font-semibold text-white transition-transform active:scale-[0.98]"
            >
              閉じる
            </button>
          </>
        )}
      </div>
    </div>
  );
}

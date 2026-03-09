"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null;

interface PushPermissionPromptProps {
  /** When "settings", always shows the card (including when granted). */
  variant?: "default" | "settings";
}

export function PushPermissionPrompt({ variant = "default" }: PushPermissionPromptProps) {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [deniedBannerDismissed, setDeniedBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  const handleAllow = async () => {
    if (status !== "default") return;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setStatus("denied");
        setLoading(false);
        return;
      }
      if (permission !== "granted") {
        setLoading(false);
        return;
      }
      if (VAPID_PUBLIC_KEY) {
        try {
          await navigator.serviceWorker.register("/sw.js");
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY,
          });
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
            },
          };
          const res = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription }),
          });
          if (res.ok) setStatus("granted");
        } catch (e) {
          console.error("Push subscribe error:", e);
        }
      }
      setStatus("granted");
    } catch (e) {
      console.error("Push permission error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "granted" && variant === "default") return null;
  if (status === "unsupported" && variant === "default") return null;

  if (status === "granted" && variant === "settings") {
    return (
      <div className="mb-4 rounded-2xl border border-border-warm bg-white p-4">
        <p className="text-sm font-semibold text-foreground">🔔 通知の設定</p>
        <p className="mt-1 text-xs text-muted">
          金曜の振り返りリマインダーや、家族のマイルストーン達成をお知らせします。
        </p>
        <p className="mt-3 text-xs font-medium text-primary">通知は有効です</p>
      </div>
    );
  }

  if (status === "unsupported" && variant === "settings") {
    return (
      <div className="mb-4 rounded-2xl border border-border-warm bg-white p-4">
        <p className="text-sm font-semibold text-foreground">🔔 通知の設定</p>
        <p className="mt-1 text-xs text-muted">通知はこのブラウザではサポートされていません。</p>
      </div>
    );
  }

  if (status === "denied" && !deniedBannerDismissed) {
    return (
      <div
        className={`mb-4 flex touch-manipulation items-center justify-between gap-2 border border-border-warm bg-white p-3 ${variant === "settings" ? "rounded-2xl p-4" : "rounded-xl"}`}
      >
        <p className="text-xs text-muted">
          設定で通知を有効にすると、振り返りリマインダーなどを受け取れます。
        </p>
        <button
          type="button"
          onClick={() => setDeniedBannerDismissed(true)}
          className="relative z-10 min-h-[44px] shrink-0 touch-manipulation cursor-pointer px-2 text-xs font-semibold text-muted"
          aria-label="閉じる"
        >
          閉じる
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 mb-4 border border-border-warm bg-white p-4 ${variant === "settings" ? "rounded-2xl" : "rounded-xl"}`}
    >
      <p className="text-sm font-semibold text-foreground">
        {variant === "settings" ? "🔔 通知の設定" : "🔔 通知を受け取る"}
      </p>
      <p className="mt-1 text-xs text-muted">
        金曜の振り返りリマインダーや、家族のマイルストーン達成をお知らせします。
      </p>
      <div className="mt-3 flex touch-manipulation">
        <button
          type="button"
          onClick={handleAllow}
          disabled={loading || status === "denied"}
          className="relative z-10 min-h-[44px] min-w-[100px] touch-manipulation cursor-pointer select-none rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "登録中..." : "許可する"}
        </button>
      </div>
    </div>
  );
}

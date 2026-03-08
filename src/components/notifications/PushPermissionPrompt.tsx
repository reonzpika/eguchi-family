"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null;
const STORAGE_KEY = "eguchi_push_prompt_seen";

export function PushPermissionPrompt() {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deniedBannerDismissed, setDeniedBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") setDismissed(true);
    } catch {
      // ignore
    }
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  const handleAllow = async () => {
    if (!VAPID_PUBLIC_KEY || status !== "default") return;
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
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (status === "granted" || status === "unsupported") return null;

  if (status === "denied" && !deniedBannerDismissed) {
    return (
      <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-border-warm bg-white p-3">
        <p className="text-xs text-muted">
          設定で通知を有効にすると、振り返りリマインダーなどを受け取れます。
        </p>
        <button
          type="button"
          onClick={() => setDeniedBannerDismissed(true)}
          className="shrink-0 text-xs font-semibold text-muted"
          aria-label="閉じる"
        >
          閉じる
        </button>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="relative z-10 mb-4 rounded-xl border border-border-warm bg-white p-4">
      <p className="text-sm font-semibold text-foreground">🔔 通知を受け取る</p>
      <p className="mt-1 text-xs text-muted">
        金曜の振り返りリマインダーや、家族のマイルストーン達成をお知らせします。
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAllow();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={loading || status === "denied"}
          className="min-h-[44px] min-w-[100px] touch-manipulation cursor-pointer select-none rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "登録中..." : "許可する"}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDismiss();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="min-h-[44px] min-w-[80px] touch-manipulation cursor-pointer select-none rounded-xl border border-border-warm px-4 py-2 text-sm font-semibold text-muted"
        >
          後で
        </button>
      </div>
    </div>
  );
}

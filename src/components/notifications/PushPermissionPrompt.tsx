"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : null;

export function PushPermissionPrompt() {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
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

  if (status === "granted" || status === "unsupported" || dismissed) return null;

  return (
    <div className="rounded-xl border border-border-warm bg-white p-4">
      <p className="text-sm font-semibold text-foreground">プッシュ通知</p>
      <p className="mt-1 text-xs text-muted">
        金曜の振り返りリマインダーなどをお知らせします。
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleAllow}
          disabled={loading || status === "denied"}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "登録中..." : "許可する"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-xl border border-border-warm px-4 py-2 text-sm font-semibold text-muted"
        >
          後で
        </button>
      </div>
    </div>
  );
}

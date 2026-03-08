import webpush from "web-push";

let vapidConfigured = false;

function getVapidKeys(): { publicKey: string; privateKey: string } | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey };
}

export function isPushConfigured(): boolean {
  return getVapidKeys() !== null;
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  const keys = getVapidKeys();
  if (!keys) {
    console.warn("VAPID keys not set; skipping push");
    return false;
  }
  if (!vapidConfigured) {
    webpush.setVapidDetails(
      "mailto:support@example.com",
      keys.publicKey,
      keys.privateKey
    );
    vapidConfigured = true;
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/",
      }),
      { TTL: 86400 }
    );
    return true;
  } catch (err) {
    console.error("web-push send error:", err);
    return false;
  }
}

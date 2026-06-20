"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PicoBubble } from "@/components/journey/Pico";

type Conv = { id: string; title: string | null; updated_at: string };

/** The ピコ tab landing: a list of the member's chats + a new-chat action. */
export function PicoChatList() {
  const router = useRouter();
  const [convos, setConvos] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workshop/conversations");
        if (res.ok) {
          const d = await res.json();
          setConvos(d.conversations ?? []);
        }
      } catch {
        /* show empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function newChat() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workshop/conversations", { method: "POST" });
      const d = await res.json();
      if (res.ok && d.conversation?.id) {
        router.push(`/pico?c=${d.conversation.id}`);
        return;
      }
    } catch {
      /* fall through */
    }
    setCreating(false);
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line="やあ！ぼくピコ。いつでも話そう 😊" size={52} />

        <button
          type="button"
          onClick={newChat}
          disabled={creating}
          className="mb-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-on-primary transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <span className="material-symbols-outlined">add</span>
          {creating ? "つくっています..." : "新しいチャット"}
        </button>

        {loading ? (
          <p className="text-center text-sm text-on-surface-variant">読み込み中...</p>
        ) : convos.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant">まだチャットはありません。上のボタンではじめよう！</p>
        ) : (
          <div className="space-y-2">
            {convos.map((c) => (
              <Link
                key={c.id}
                href={`/pico?c=${c.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border-warm bg-white p-4 transition-transform active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
                <span className="flex-1 truncate text-sm font-semibold text-on-surface">
                  {c.title || "新しいチャット"}
                </span>
                <span className="material-symbols-outlined text-base text-on-surface-variant">chevron_right</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { HELP } from "@/lib/workshop/learn";
import { PicoBubble } from "@/components/journey/Pico";

/** 助けて・使い方: the browsable library of all help (the rewritten cards). */
export default function LearnPage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <Link href="/pico" className="mb-4 inline-flex items-center gap-1 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          ピコ
        </Link>
        <PicoBubble line="使い方は、いつでもここで見られるよ！こまったら見にきてね。" size={52} />

        <div className="space-y-3">
          {HELP.map((h) => (
            <div key={h.key} className="rounded-2xl border border-border-warm bg-white p-4">
              <p className="mb-1 text-sm font-bold text-on-surface">💡 {h.title}</p>
              <p className="text-sm leading-relaxed text-on-surface-variant">{h.body}</p>
              {h.article && (
                <a
                  href={h.article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
                >
                  もっと詳しく：{h.article.label}
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

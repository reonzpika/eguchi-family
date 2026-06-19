import Link from "next/link";
import { PicoBubble } from "@/components/journey/Pico";
import { FirstRunBanner } from "@/components/workshop/FirstRunBanner";

/**
 * アイデアさがし: the free explore + find space. Make something fun (the magic
 * hook), or find an idea (the idea-finder recipe). When ready, cross the gate.
 */
export default function ExplorePage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line="何か作ってみよう！ それか、一緒にアイデアを見つけよう！" size={52} />

        <FirstRunBanner />

        <div className="space-y-3">
          <Link
            href="/explore/make"
            className="block rounded-2xl border border-border-warm bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.98]"
          >
            <div className="mb-1 text-lg font-bold text-on-surface">🎮 作ってみる</div>
            <div className="text-sm text-on-surface-variant">すぐ作れる、楽しいもの。AIの魔法を体験しよう。</div>
          </Link>

          <Link
            href="/explore/find"
            className="block rounded-2xl border border-border-warm bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform active:scale-[0.98]"
          >
            <div className="mb-1 text-lg font-bold text-on-surface">💡 アイデアを見つける</div>
            <div className="text-sm text-on-surface-variant">Claudeと一緒に、やってみたいことを探そう。</div>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl bg-surface-container-low p-5 text-center">
          <p className="mb-3 text-sm text-on-surface-variant">やってみたいアイデアが見つかった？</p>
          <Link
            href="/pico?mode=gate"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary px-6 py-3 text-base font-bold text-on-secondary transition-transform active:scale-[0.98]"
          >
            アイデアできた！ →
          </Link>
        </div>
      </div>
    </div>
  );
}

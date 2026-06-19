import Link from "next/link";
import { PromptBuilder } from "@/components/journey/PromptBuilder";
import { PicoBubble } from "@/components/journey/Pico";
import { HelpCard } from "@/components/workshop/HelpCard";

/** 作ってみる: the magic hook. Reuses the existing preset-led prompt builder. */
export default function MakePage() {
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <Link href="/explore" className="mb-4 inline-flex items-center gap-1 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          アイデアさがし
        </Link>
        <PicoBubble line="いきなりだけど、すごいものを作るよ！何を作る？" size={52} />
        <HelpCard trigger="prompt" />
        <PromptBuilder mode="magic" />
      </div>
    </div>
  );
}

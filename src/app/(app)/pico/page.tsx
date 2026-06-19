import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStage } from "@/lib/workshop/recipes";
import { WorkshopChat } from "@/components/workshop/WorkshopChat";
import { PicoBubble } from "@/components/journey/Pico";

/**
 * ピコ tab: the engine room. Runs the readiness gate (?mode=gate) and the per-stage
 * loop (?business=&stage=), and otherwise shows a simple ピコ landing + help.
 */
export default async function PicoPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; business?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  // Gate
  if (params.mode === "gate") {
    return (
      <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
        <div className="mx-auto max-w-2xl px-5 pt-6">
          <Link href="/explore" className="mb-4 inline-flex items-center gap-1 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            アイデアさがし
          </Link>
          <WorkshopChat mode="gate" />
        </div>
      </div>
    );
  }

  // Stage
  if (params.business && params.stage && userId) {
    const stage = getStage(params.stage);
    let idea = "";
    let ok = false;
    if (stage) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("businesses")
        .select("id, user_id, idea")
        .eq("id", params.business)
        .single();
      if (data && data.user_id === userId) {
        idea = data.idea as string;
        ok = true;
      }
    }
    if (stage && ok) {
      return (
        <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
          <div className="mx-auto max-w-2xl px-5 pt-6">
            <Link href="/business" className="mb-4 inline-flex items-center gap-1 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              わたしのビジネス
            </Link>
            <h1 className="mb-4 font-headline text-xl font-bold text-on-surface">
              {stage.emoji} {stage.label}
            </h1>
            <WorkshopChat
              mode="stage"
              businessId={params.business}
              idea={idea}
              stage={{ key: stage.key, label: stage.label, emoji: stage.emoji, goal: stage.goal, recipe: stage.recipe }}
            />
          </div>
        </div>
      );
    }
  }

  // Free landing
  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line="やあ！ぼくピコ。なんでもきいてね 😊" size={52} />
        <div className="space-y-3">
          <Link href="/explore" className="block rounded-2xl border border-border-warm bg-white p-4 text-sm font-semibold text-on-surface transition-transform active:scale-[0.98]">
            💡 アイデアをさがす
          </Link>
          <Link href="/business" className="block rounded-2xl border border-border-warm bg-white p-4 text-sm font-semibold text-on-surface transition-transform active:scale-[0.98]">
            🗺️ わたしのビジネスを見る
          </Link>
          <Link href="/learning" className="block rounded-2xl border border-border-warm bg-white p-4 text-sm font-semibold text-on-surface transition-transform active:scale-[0.98]">
            📖 助けて・使い方
          </Link>
        </div>
      </div>
    </div>
  );
}

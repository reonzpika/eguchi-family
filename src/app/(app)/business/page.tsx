import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { STAGES } from "@/lib/workshop/recipes";
import { PicoBubble } from "@/components/journey/Pico";

/**
 * わたしのビジネス, the cockpit. MVP renders the member's latest business directly
 * (the portfolio list wrapper is deferred). Empty state nudges to アイデアさがし.
 */
export default async function BusinessPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const name = session?.user?.name ?? "";

  type Biz = { id: string; idea: string; current_stage: string; status: string };
  type Sum = { stage: string; summary: string; created_at: string };

  let business: Biz | null = null;
  let summaries: Sum[] = [];

  if (userId) {
    const admin = createAdminClient();
    const { data: bizs } = await admin
      .from("businesses")
      .select("id, idea, current_stage, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    business = (bizs?.[0] as Biz) ?? null;
    if (business) {
      const { data: sums } = await admin
        .from("stage_summaries")
        .select("stage, summary, created_at")
        .eq("business_id", business.id)
        .eq("verdict", "ready")
        .order("created_at", { ascending: true });
      summaries = (sums as Sum[]) ?? [];
    }
  }

  // Empty state
  if (!business) {
    return (
      <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
        <div className="mx-auto max-w-2xl px-5 pt-6">
          <PicoBubble line="まだビジネスはありません。まず、アイデアを見つけよう！" size={52} />
          <Link
            href="/explore"
            className="mb-8 block rounded-3xl bg-primary-container p-6 text-center shadow-sm transition-transform active:scale-[0.98]"
          >
            <span className="font-headline text-xl font-extrabold text-on-primary-container">
              アイデアさがしへ →
            </span>
          </Link>
          <p className="mb-3 text-xs font-bold text-on-surface-variant">このあとの道</p>
          <div className="space-y-2 opacity-60">
            {STAGES.map((s) => (
              <div key={s.key} className="flex items-center gap-3 rounded-xl border border-dashed border-surface-variant bg-surface-container-low p-3">
                <span className="grayscale">{s.emoji}</span>
                <span className="text-sm font-bold text-on-surface-variant">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === business!.current_stage);
  const launched = business.status === "launched";
  const summaryByStage = new Map(summaries.map((s) => [s.stage, s.summary]));

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line={launched ? `${name ? name + "さん、" : ""}ローンチおめでとう！🎉` : "今日も一歩ずつ。いいかんじだよ！"} size={52} />

        {/* idea */}
        <div className="mb-6 rounded-2xl bg-surface-container-low p-5">
          <p className="mb-1 text-xs font-bold text-on-surface-variant">あなたのアイデア</p>
          <p className="text-sm font-semibold text-on-surface">{business.idea}</p>
        </div>

        {/* stage map */}
        <p className="mb-3 text-xs font-bold text-on-surface-variant">すすみ具合</p>
        <ol className="mb-6 space-y-2">
          {STAGES.map((s, i) => {
            const isDone = launched || i < currentIndex;
            const isCurrent = !launched && i === currentIndex;
            return (
              <li
                key={s.key}
                className={`flex items-center gap-3 rounded-xl p-3.5 ${
                  isCurrent ? "border border-primary/40 bg-primary-container/40" : "bg-surface-container-low"
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isDone ? "text-primary" : "text-on-surface-variant"}`} style={isDone ? { fontVariationSettings: '"FILL" 1' } : undefined}>
                  {isDone ? "check_circle" : isCurrent ? "play_circle" : "radio_button_unchecked"}
                </span>
                <span className="text-lg">{s.emoji}</span>
                <span className={`flex-1 text-sm font-bold ${isDone ? "text-on-surface-variant" : "text-on-surface"}`}>{s.label}</span>
                {isCurrent && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">いま</span>}
              </li>
            );
          })}
        </ol>

        {!launched && (
          <Link
            href={`/pico?business=${business.id}&stage=${business.current_stage}`}
            className="mb-8 block rounded-2xl bg-primary p-4 text-center text-base font-bold text-on-primary shadow-sm transition-transform active:scale-[0.98]"
          >
            いまのステージへ →
          </Link>
        )}

        {/* これまで */}
        {summaries.length > 0 && (
          <>
            <p className="mb-3 text-xs font-bold text-on-surface-variant">これまで</p>
            <div className="mb-6 space-y-2">
              {STAGES.filter((s) => summaryByStage.has(s.key)).map((s) => (
                <div key={s.key} className="rounded-xl border border-surface-variant bg-surface-container-lowest p-3">
                  <p className="mb-1 text-xs font-bold text-primary">{s.emoji} {s.label}</p>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-on-surface-variant">{summaryByStage.get(s.key)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* どうぐ */}
        <p className="mb-3 text-xs font-bold text-on-surface-variant">どうぐ</p>
        <div className="space-y-2">
          {STAGES.slice(0, launched ? STAGES.length : currentIndex + 1).map((s) => (
            <Link
              key={s.key}
              href={`/pico?business=${business!.id}&stage=${s.key}`}
              className="flex items-center gap-3 rounded-xl border border-surface-variant bg-white p-3 transition-transform active:scale-[0.98]"
            >
              <span>{s.emoji}</span>
              <span className="flex-1 text-sm font-semibold text-on-surface">{s.label}のレシピ</span>
              <span className="material-symbols-outlined text-base text-on-surface-variant">chevron_right</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

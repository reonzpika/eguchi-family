"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PwaInstallPrompt } from "@/components/notifications/PwaInstallPrompt";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import type { FamilyToolMissionRow, FamilyToolRow } from "@/types/hub";

interface FeaturedPayload {
  tool: { id: string; name: string };
  mission: FamilyToolMissionRow;
}

interface ActivityRow {
  id: string;
  title: string;
  created_at: string;
  activity_type: string;
  user: { id: string; name: string };
}

function formatRelativeJa(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString("ja-JP");
}

export default function HubHomePage() {
  const [published, setPublished] = useState<FamilyToolRow[]>([]);
  const [featured, setFeatured] = useState<FeaturedPayload | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [toolsRes, featRes, actRes] = await Promise.all([
          fetch("/api/hub/tools"),
          fetch("/api/hub/featured"),
          fetch("/api/activity-feed?limit=3"),
        ]);
        if (!toolsRes.ok || !featRes.ok || !actRes.ok) return;
        const toolsData = await toolsRes.json();
        const featData = await featRes.json();
        const actData = await actRes.json();
        if (cancelled) return;
        setPublished(toolsData.published ?? []);
        setFeatured(featData.featured ?? null);
        setActivities((actData.activities ?? []) as ActivityRow[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-6 pt-4">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-[max(884px,100dvh)] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-6 pt-6 sm:px-8">
        {/* Hero / weekly mission */}
        {featured && (
          <section className="relative">
            <div className="relative overflow-hidden rounded-xl bg-tertiary-container p-8 shadow-[0px_12px_32px_rgba(47,51,52,0.06)] md:p-12">
              <div className="relative z-10 max-w-lg">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/40 px-3 py-1">
                  <span
                    className="material-symbols-outlined text-sm text-tertiary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    stars
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-tertiary-container">
                    Weekly Mission
                  </span>
                </div>
                <h2 className="mb-4 font-headline text-3xl font-extrabold leading-tight text-on-tertiary-container md:text-4xl">
                  今週のミッション:
                  <br />
                  {featured.mission.title}
                </h2>
                <p className="mb-8 font-medium text-on-tertiary-container/80">
                  {featured.tool.name}
                  で、家族のための一歩を踏み出してみませんか？
                </p>
                <Link
                  href={`/tools/${featured.tool.id}/missions/${featured.mission.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-[0.95]"
                >
                  挑戦する!
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-tertiary opacity-10 blur-3xl" />
              <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block">
                <span className="material-symbols-outlined text-[12rem] text-on-tertiary-container opacity-10">
                  restaurant_menu
                </span>
              </div>
            </div>
          </section>
        )}

        {/* All missions CTA */}
        <section>
          <Link
            href="/missions"
            className="group flex cursor-pointer flex-col items-center justify-between gap-6 rounded-xl bg-primary-container p-6 transition-colors hover:bg-primary-container/90 md:flex-row"
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-3xl text-primary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  task_alt
                </span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-on-primary-container">
                  すべてのミッションを見る
                </h3>
                <p className="text-sm text-on-primary-container/70">
                  スキルアップのための挑戦リストへ
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-3xl text-on-primary-container transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </section>

        {/* New tools carousel */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-headline text-2xl font-bold text-on-surface">
              <span className="h-8 w-2 rounded-full bg-primary" />
              新着ツール
            </h3>
            <Link href="/tools" className="text-sm font-bold text-primary hover:underline">
              すべて見る
            </Link>
          </div>
          <div className="scrollbar-hide -mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4">
            {published.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                まだ公開ツールがありません。「ツール」から追加してみましょう。
              </p>
            ) : (
              published.map((t, i) => {
                const prof = t.profile_json as { summary?: string };
                const border =
                  i % 3 === 0
                    ? "border-b-4 border-primary-container"
                    : i % 3 === 1
                      ? "border-b-4 border-secondary-container"
                      : "border-b-4 border-tertiary-container";
                const accent =
                  i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-secondary" : "text-tertiary";
                return (
                  <Link
                    key={t.id}
                    href={`/tools/${t.id}`}
                    className={`group min-w-[280px] cursor-pointer snap-start rounded-lg bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md ${border}`}
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
                        i % 3 === 0
                          ? "bg-primary/10"
                          : i % 3 === 1
                            ? "bg-secondary/10"
                            : "bg-tertiary/10"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${accent}`}>
                        {i % 3 === 0 ? "edit_note" : i % 3 === 1 ? "search_spark" : "psychology_alt"}
                      </span>
                    </div>
                    <h4 className="mb-1 text-xl font-bold">{t.name}</h4>
                    <p className="mb-4 line-clamp-2 text-sm text-on-surface-variant">
                      {prof.summary || "詳細を見る"}
                    </p>
                    <div className={`flex items-center gap-1 text-xs font-bold ${accent}`}>
                      使ってみる
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Bento: tips + activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <h3 className="flex items-center gap-2 font-headline text-2xl font-bold text-on-surface">
              <span className="h-8 w-2 rounded-full bg-secondary" />
              AIと仲良くなるコツ
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  icon: "chat_bubble",
                  color: "text-primary",
                  title: "具体的に伝えてみよう",
                  body: "「いつ」「誰が」などを加えると、AIはもっと賢くなります。",
                },
                {
                  icon: "handshake",
                  color: "text-secondary",
                  title: "まずは「こんにちは」から",
                  body: "挨拶から始めると、自然な会話のキャッチボールが楽しめます。",
                },
                {
                  icon: "lightbulb",
                  color: "text-tertiary",
                  title: "役割をお願いする",
                  body: "「プロのシェフになって」と頼むと、回答の質が上がります。",
                },
                {
                  icon: "refresh",
                  color: "text-error",
                  title: "何度でも聞き直してOK",
                  body: "分からないことは、別の言い方で聞き直してみましょう。",
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="flex cursor-pointer items-start gap-4 rounded-lg bg-surface-container-low p-5 transition-colors hover:bg-surface-container"
                >
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <span className={`material-symbols-outlined ${tip.color}`}>{tip.icon}</span>
                  </div>
                  <div>
                    <p className="mb-1 font-bold text-on-surface">{tip.title}</p>
                    <p className="text-xs leading-relaxed text-on-surface-variant">{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="flex items-center gap-2 font-headline text-2xl font-bold text-on-surface">
              <span className="h-8 w-2 rounded-full bg-tertiary" />
              最近の活動
            </h3>
            <div className="space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              {activities.length === 0 ? (
                <p className="text-sm text-on-surface-variant">まだ活動がありません。</p>
              ) : (
                activities.map((a, idx) => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 pb-4 ${
                      idx < activities.length - 1 ? "border-b border-surface-variant" : ""
                    }`}
                  >
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        idx % 3 === 0
                          ? "bg-primary-dim"
                          : idx % 3 === 1
                            ? "bg-secondary"
                            : "bg-tertiary"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-on-surface">{a.title}</p>
                      <p className="text-[10px] uppercase text-on-surface-variant">
                        {formatRelativeJa(a.created_at)} · {a.user.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Link
                href="/feed"
                className="block w-full py-2 text-center text-sm font-bold text-on-surface-variant transition-colors hover:text-primary"
              >
                履歴をすべて表示
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* FAB (home only; quick add tool) */}
      <Link
        href="/tools/new"
        className="fixed bottom-24 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0px_12px_32px_rgba(36,110,0,0.3)] transition-transform active:scale-90"
        aria-label="ツールを追加"
      >
        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
      </Link>

      <PwaInstallPrompt />
    </div>
  );
}

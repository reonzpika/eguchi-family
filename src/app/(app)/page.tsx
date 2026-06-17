import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getDiscoveryProfileForUser } from "@/lib/discovery-profile";
import { LAYERS, LESSONS, lessonsByLayer } from "@/lib/curriculum/lessons";

/**
 * The learning journey home: a guided path, the whole map visible, gentle progress.
 * Server component: reads session, the member's goal (discovery answer 0),
 * and their completed lessons, then renders the map with the next step highlighted.
 */
export default async function JourneyHomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const name = session?.user?.name ?? "";

  let topic: string | null = null;
  const doneIds = new Set<string>();

  if (userId) {
    const profile = await getDiscoveryProfileForUser(userId);
    const raw = profile?.answers?.["0"];
    topic = typeof raw === "string" && raw.trim() ? raw.trim() : null;

    const admin = createAdminClient();
    const { data } = await admin
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId);
    for (const row of data ?? []) doneIds.add(row.lesson_id as string);
  }

  const activeLessons = LESSONS.filter((l) => !l.locked);
  const doneCount = activeLessons.filter((l) => doneIds.has(l.id)).length;
  const nextLesson = activeLessons.find((l) => !doneIds.has(l.id)) ?? null;
  const pct = activeLessons.length
    ? Math.round((doneCount / activeLessons.length) * 100)
    : 0;

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        {/* Header: who + goal + gentle progress */}
        <header className="mb-8">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-primary">
            <span>🌸</span>
            <span>{name ? `${name}さんのAIの旅` : "AIの旅"}</span>
          </div>
          {topic && (
            <p className="mb-4 text-sm text-on-surface-variant">
              テーマ：{topic}
            </p>
          )}
          <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-xs font-bold text-on-surface-variant">
                すすみ具合
              </span>
              <span className="text-sm font-bold text-primary">
                {doneCount} / {activeLessons.length}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-variant">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </header>

        {/* Next step, highlighted */}
        {nextLesson ? (
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="mb-10 block rounded-2xl bg-primary-container p-6 shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                play_circle
              </span>
              次の一歩
            </div>
            <h2 className="font-headline text-xl font-extrabold text-on-primary-container">
              {nextLesson.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-on-primary-container/80">
              {nextLesson.concept}
            </p>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary">
              はじめる
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </div>
          </Link>
        ) : (
          <div className="mb-10 rounded-2xl bg-tertiary-container p-6 text-center">
            <p className="font-headline text-lg font-bold text-on-tertiary-container">
              すべて完了しました 🎉
            </p>
            <p className="mt-1 text-sm text-on-tertiary-container/80">
              よくがんばりました。気になるレッスンはいつでも見返せます。
            </p>
          </div>
        )}

        {/* The whole map: layers as chapters, lessons within */}
        <div className="space-y-8">
          {LAYERS.map((layer) => {
            const lessons = lessonsByLayer(layer.id);
            if (lessons.length === 0) return null;
            return (
              <section key={layer.id}>
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-lg">{layer.emoji}</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    {layer.title}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {layer.subtitle}
                    {layer.note ? ` ${layer.note}` : ""}
                  </span>
                </div>
                <ul className="space-y-2">
                  {lessons.map((lesson) => {
                    const isDone = doneIds.has(lesson.id);
                    const isNext = nextLesson?.id === lesson.id;
                    const locked = lesson.locked;
                    const inner = (
                      <div
                        className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                          locked
                            ? "border-surface-variant bg-surface-container-low opacity-60"
                            : isNext
                              ? "border-primary bg-primary-container/40"
                              : isDone
                                ? "border-surface-variant bg-surface-container-lowest"
                                : "border-surface-variant bg-surface-container-lowest hover:bg-surface-container-low"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-xl ${
                            locked
                              ? "text-on-surface-variant"
                              : isDone
                                ? "text-primary"
                                : "text-on-surface-variant"
                          }`}
                          style={isDone ? { fontVariationSettings: '"FILL" 1' } : undefined}
                          aria-hidden
                        >
                          {locked ? "lock" : isDone ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-bold ${
                              isDone ? "text-on-surface-variant" : "text-on-surface"
                            }`}
                          >
                            {lesson.title}
                            {lesson.advanced && !locked && (
                              <span className="ml-2 rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                                上級
                              </span>
                            )}
                          </p>
                        </div>
                        {isNext && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
                            次
                          </span>
                        )}
                      </div>
                    );
                    return (
                      <li key={lesson.id}>
                        {locked ? (
                          <div title="準備中">{inner}</div>
                        ) : (
                          <Link href={`/lesson/${lesson.id}`} className="block">
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

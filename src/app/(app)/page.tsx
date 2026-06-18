import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { CHAPTERS, ACTIVE_LESSONS, lessonsByChapter } from "@/lib/curriculum/lessons";
import { PicoBubble } from "@/components/journey/Pico";

/**
 * The journey home: chapter-focused. ピコ greets, the next step is highlighted,
 * the current chapter shows its lessons, done chapters collapse, future
 * chapters are teased.
 */
export default async function JourneyHome() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const name = session?.user?.name ?? "";

  const doneIds = new Set<string>();
  if (userId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId);
    for (const r of data ?? []) doneIds.add(r.lesson_id as string);
  }

  const doneCount = ACTIVE_LESSONS.filter((l) => doneIds.has(l.id)).length;
  const pct = ACTIVE_LESSONS.length ? Math.round((doneCount / ACTIVE_LESSONS.length) * 100) : 0;
  const nextLesson = ACTIVE_LESSONS.find((l) => !doneIds.has(l.id)) ?? null;
  const currentChapterId = nextLesson?.chapterId ?? CHAPTERS[CHAPTERS.length - 1].id;
  const currentIndex = CHAPTERS.findIndex((c) => c.id === currentChapterId);

  const picoLine = nextLesson
    ? doneCount === 0
      ? "いっしょにAIの冒険に出かけよう！まずは最初の一歩から。"
      : `おかえり${name ? "、" + name + "さん" : ""}！つづきをやろう。どこまで行けるかな？`
    : "ぜんぶクリア！すごいよ、ほんとにすごい！";

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <PicoBubble line={picoLine} size={52} />

        {/* progress */}
        <div className="mb-8 rounded-2xl bg-surface-container-low p-5">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-sm font-bold text-on-surface">
              {name ? `${name}さんのAIの旅` : "AIの旅"}
            </span>
            <span className="text-sm font-bold text-primary">
              {doneCount} / {ACTIVE_LESSONS.length}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-variant">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* next step */}
        {nextLesson && (
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="mb-9 block rounded-3xl bg-primary-container p-6 shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                play_circle
              </span>
              次の一歩
            </div>
            <h2 className="font-headline text-xl font-extrabold text-on-primary-container">
              {nextLesson.title}
            </h2>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary">
              はじめる
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </div>
          </Link>
        )}

        {/* chapters */}
        <div className="space-y-4">
          {CHAPTERS.map((chapter, i) => {
            const lessons = lessonsByChapter(chapter.id);
            const isCurrent = i === currentIndex;
            const isDone = i < currentIndex;
            const isFuture = i > currentIndex;

            if (isDone) {
              return (
                <div
                  key={chapter.id}
                  className="flex items-center gap-3 rounded-2xl border border-surface-variant bg-surface-container-lowest p-4"
                >
                  <span className="text-xl">{chapter.emoji}</span>
                  <span className="flex-1 font-bold text-on-surface-variant">{chapter.title}</span>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    check_circle
                  </span>
                </div>
              );
            }

            if (isFuture) {
              return (
                <div
                  key={chapter.id}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-container-low p-4 opacity-70"
                >
                  <span className="text-xl grayscale">{chapter.emoji}</span>
                  <span className="flex-1 font-bold text-on-surface-variant">{chapter.title}</span>
                  <span className="text-xs text-on-surface-variant">もうすぐ</span>
                </div>
              );
            }

            // current chapter, expanded
            return (
              <section key={chapter.id} className="rounded-3xl border border-primary/30 bg-surface-container-lowest p-4">
                <div className="mb-3 flex items-baseline gap-2 px-1">
                  <span className="text-lg">{chapter.emoji}</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">{chapter.title}</h3>
                  <span className="text-xs text-on-surface-variant">{chapter.subtitle}</span>
                </div>
                <ul className="space-y-2">
                  {lessons.map((lesson) => {
                    const done = doneIds.has(lesson.id);
                    const isNext = nextLesson?.id === lesson.id;
                    const locked = lesson.kind === "locked";
                    const inner = (
                      <div
                        className={`flex items-center gap-3 rounded-xl p-3.5 transition-colors ${
                          locked
                            ? "bg-surface-container-low opacity-60"
                            : isNext
                              ? "bg-primary-container/50"
                              : "bg-surface-container-low hover:bg-surface-container"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-xl ${done ? "text-primary" : "text-on-surface-variant"}`}
                          style={done ? { fontVariationSettings: '"FILL" 1' } : undefined}
                        >
                          {locked ? "lock" : done ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span className={`flex-1 truncate text-sm font-bold ${done ? "text-on-surface-variant" : "text-on-surface"}`}>
                          {lesson.title}
                          {lesson.advanced && !locked && (
                            <span className="ml-2 rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                              上級
                            </span>
                          )}
                        </span>
                        {isNext && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">次</span>
                        )}
                      </div>
                    );
                    return (
                      <li key={lesson.id}>
                        {locked ? <div>{inner}</div> : <Link href={`/lesson/${lesson.id}`} className="block">{inner}</Link>}
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

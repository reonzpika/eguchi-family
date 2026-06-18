import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getDiscoveryProfileForUser } from "@/lib/discovery-profile";
import { getLesson, CHAPTERS, fillTopic } from "@/lib/curriculum/lessons";
import { LessonActions } from "@/components/journey/LessonActions";
import { PromptBuilder } from "@/components/journey/PromptBuilder";
import { PicoBubble } from "@/components/journey/Pico";

const CLAUDE_URL = "https://claude.ai/";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLesson(id);

  if (!lesson || lesson.kind === "locked") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center text-on-surface-variant">
        <p className="mb-4">このレッスンはまだ準備中です。</p>
        <Link href="/" className="font-bold text-primary">← 旅にもどる</Link>
      </div>
    );
  }

  const chapter = CHAPTERS.find((c) => c.id === lesson.chapterId);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  let topic: string | null = null;
  let alreadyDone = false;
  let existingReflection = "";

  if (userId) {
    const profile = await getDiscoveryProfileForUser(userId);
    const raw = profile?.answers?.["0"];
    topic = typeof raw === "string" && raw.trim() ? raw.trim() : null;

    const admin = createAdminClient();
    const { data } = await admin
      .from("lesson_progress")
      .select("status, reflection")
      .eq("user_id", userId)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    if (data) {
      alreadyDone = data.status === "done";
      existingReflection = (data.reflection as string) ?? "";
    }
  }

  const task = fillTopic(lesson.task, topic);
  const isBuilder = lesson.kind === "magic" || lesson.kind === "companion";

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-on-surface">
      <div className="mx-auto max-w-2xl px-5 pt-6">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          旅にもどる
        </Link>

        {lesson.pico && <PicoBubble line={lesson.pico} />}

        {chapter && (
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary">
            <span>{chapter.emoji}</span>
            <span>{chapter.title}</span>
          </div>
        )}
        <h1 className="mb-6 font-headline text-2xl font-extrabold text-on-surface">
          {lesson.title}
        </h1>

        {/* 学ぶ */}
        <section className="mb-7">
          <h2 className="mb-2 flex items-center gap-1.5 font-headline text-base font-bold text-on-surface">
            <span className="material-symbols-outlined text-lg text-tertiary">menu_book</span>
            学ぶ
          </h2>
          <div className="space-y-3 rounded-2xl bg-surface-container-low p-5">
            {lesson.learn.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-on-surface">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* やってみよう */}
        <section className="mb-7">
          <h2 className="mb-2 flex items-center gap-1.5 font-headline text-base font-bold text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">bolt</span>
            やってみよう
          </h2>
          <p className="mb-4 rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 text-sm leading-relaxed text-on-surface">
            {task}
          </p>

          {/* help article, at the point of use */}
          {lesson.article && (
            <a
              href={lesson.article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center justify-between rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-lg text-secondary">help</span>
                やり方：{lesson.article.label}
              </span>
              <span className="material-symbols-outlined text-base text-on-surface-variant">open_in_new</span>
            </a>
          )}

          {isBuilder ? (
            <PromptBuilder mode={lesson.kind === "magic" ? "magic" : "companion"} />
          ) : (
            <a
              href={CLAUDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-base font-bold text-on-secondary shadow-sm transition-transform active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Claudeを開く
            </a>
          )}
        </section>

        {/* できた */}
        <LessonActions
          lessonId={lesson.id}
          alreadyDone={alreadyDone}
          existingReflection={existingReflection}
          doneLabel={lesson.done}
        />
      </div>
    </div>
  );
}

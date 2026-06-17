import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getDiscoveryProfileForUser } from "@/lib/discovery-profile";
import { LESSONS, LAYERS, fillTopic } from "@/lib/curriculum/lessons";
import { LessonActions } from "@/components/journey/LessonActions";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = LESSONS.find((l) => l.id === id);

  if (!lesson || lesson.locked) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center text-on-surface-variant">
        <p className="mb-4">このレッスンはまだ準備中です。</p>
        <Link href="/" className="font-bold text-primary">
          ← 旅にもどる
        </Link>
      </div>
    );
  }

  const layer = LAYERS.find((l) => l.id === lesson.layerId);
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

        {layer && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
            <span>{layer.emoji}</span>
            <span>{layer.title}</span>
          </div>
        )}
        <h1 className="mb-6 font-headline text-2xl font-extrabold text-on-surface">
          {lesson.title}
        </h1>

        {/* Summary: lead + highlights */}
        <section className="mb-6 rounded-2xl bg-surface-container-low p-5">
          <p className="mb-3 text-sm font-bold leading-relaxed text-on-surface">
            {lesson.concept}
          </p>
          <ul className="space-y-2">
            {lesson.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-on-surface">
                <span className="mt-px shrink-0 font-bold text-primary">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Do it in Claude */}
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 font-headline text-base font-bold text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">bolt</span>
            やってみよう
          </h2>
          <p className="mb-4 rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 text-sm leading-relaxed text-on-surface">
            {task}
          </p>

          <LessonActions
            lessonId={lesson.id}
            copyPrompt={lesson.copyPrompt}
            alreadyDone={alreadyDone}
            existingReflection={existingReflection}
            doneLabel={lesson.done}
          />
        </section>

        {/* Learn more */}
        {lesson.article && (
          <a
            href={lesson.article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-surface-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="material-symbols-outlined text-lg text-secondary">menu_book</span>
              もっと知る：{lesson.article.label}
            </span>
            <span className="material-symbols-outlined text-base text-on-surface-variant">
              open_in_new
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

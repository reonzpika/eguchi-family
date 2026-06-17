import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { ACTIVE_LESSON_COUNT } from "@/lib/curriculum/lessons";

/**
 * Coaching view (admin only; gated by middleware).
 * Shows each member's journey progress so Ryo can send a quick warm nudge.
 */
export default async function CoachingProgressPage() {
  const admin = createAdminClient();
  const [{ data: users }, { data: progress }] = await Promise.all([
    admin.from("users").select("id, name, member_id"),
    admin.from("lesson_progress").select("user_id, lesson_id, completed_at"),
  ]);

  const rows = (users ?? []).map((u) => {
    const mine = (progress ?? []).filter((p) => p.user_id === u.id);
    const last = mine
      .map((p) => p.completed_at as string)
      .sort()
      .at(-1);
    return {
      name: (u.name as string) ?? (u.member_id as string),
      done: mine.length,
      last: last ? new Date(last).toLocaleDateString("ja-JP") : "—",
    };
  });
  rows.sort((a, b) => b.done - a.done);

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        admin
      </Link>
      <h1 className="mb-1 font-headline text-xl font-bold text-on-surface">
        みんなの進み具合
      </h1>
      <p className="mb-6 text-xs text-on-surface-variant">
        止まっている人にひとこと声をかける用。全{ACTIVE_LESSON_COUNT}レッスン。
      </p>

      <div className="overflow-hidden rounded-2xl border border-surface-variant">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="p-3 text-left font-bold">メンバー</th>
              <th className="p-3 text-right font-bold">完了</th>
              <th className="p-3 text-right font-bold">最終</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-surface-variant">
                <td className="p-3 font-bold text-on-surface">{r.name}</td>
                <td className="p-3 text-right text-on-surface">
                  {r.done} / {ACTIVE_LESSON_COUNT}
                </td>
                <td className="p-3 text-right text-on-surface-variant">{r.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

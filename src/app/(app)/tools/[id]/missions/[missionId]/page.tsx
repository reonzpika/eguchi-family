"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FamilyToolMissionRow } from "@/types/hub";

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params.missionId as string;
  const router = useRouter();
  const [mission, setMission] = useState<FamilyToolMissionRow | null>(null);
  const [toolName, setToolName] = useState("");
  const [toolId, setToolId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!missionId) return;
    (async () => {
      const res = await fetch(`/api/hub/missions/${missionId}`);
      if (!res.ok) {
        setMission(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMission(data.mission);
      setToolName(data.tool?.name ?? "");
      setToolId(data.tool?.id ?? "");
      setLoading(false);
    })();
  }, [missionId]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-on-surface-variant">読み込み中…</p>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="px-6 pt-8">
        <p>見つかりません</p>
        <button type="button" onClick={() => router.back()} className="mt-4 text-primary">
          戻る
        </button>
      </div>
    );
  }

  const steps = Array.isArray(mission.steps) ? (mission.steps as string[]) : [];
  const prompts = Array.isArray(mission.prompt_blocks)
    ? (mission.prompt_blocks as { label: string; text: string }[])
    : [];
  const done = Array.isArray(mission.done_criteria) ? (mission.done_criteria as string[]) : [];

  return (
    <div className="min-h-dvh bg-background pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center text-on-surface-variant"
          aria-label="戻る"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-on-surface-variant">{toolName}</p>
          <h1 className="truncate font-headline text-lg font-bold text-on-surface">
            {mission.title}
          </h1>
        </div>
      </header>

      <main className="space-y-8 px-6 pt-6">
        <p className="text-sm text-on-surface-variant">
          目安: 約{mission.estimated_minutes ?? 10}分
        </p>

        {steps.length > 0 && (
          <section>
            <h2 className="mb-3 font-headline font-bold text-primary">手順</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-on-surface">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>
        )}

        {prompts.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-headline font-bold text-primary">プロンプト</h2>
            {prompts.map((p, i) => (
              <div key={i} className="rounded-xl bg-surface-container-low p-4">
                <p className="mb-2 text-xs font-bold text-on-surface-variant">{p.label}</p>
                <pre className="whitespace-pre-wrap break-words text-sm text-on-surface">{p.text}</pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(p.text)}
                  className="mt-2 text-xs font-semibold text-primary"
                >
                  コピー
                </button>
              </div>
            ))}
          </section>
        )}

        {done.length > 0 && (
          <section className="rounded-xl border border-primary/30 bg-primary-container/20 p-4">
            <h2 className="mb-2 font-headline font-bold text-on-primary-container">
              完成のサイン
            </h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-on-primary-container">
              {done.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        )}

        {toolId && (
          <Link
            href={`/tools/${toolId}/threads`}
            className="block rounded-xl bg-secondary-container/40 py-3 text-center font-semibold text-on-secondary-container"
          >
            このツールについて相談する
          </Link>
        )}
      </main>
    </div>
  );
}

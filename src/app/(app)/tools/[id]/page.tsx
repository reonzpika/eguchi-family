"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { FamilyToolMissionRow, FamilyToolRow, HubToolProfile } from "@/types/hub";

export default function ToolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [tool, setTool] = useState<FamilyToolRow | null>(null);
  const [missions, setMissions] = useState<FamilyToolMissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/hub/tools/${id}`);
      if (!res.ok) {
        setTool(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTool(data.tool);
      setMissions(data.missions ?? []);
      setLoading(false);
    })();
  }, [id]);

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/hub/tools/${id}/publish`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTool(data.tool);
        const r2 = await fetch(`/api/hub/tools/${id}`);
        if (r2.ok) {
          const d2 = await r2.json();
          setMissions(d2.missions ?? []);
        }
      }
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6">
        <p className="text-on-surface-variant">読み込み中…</p>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="px-6 pt-8">
        <p className="text-on-surface-variant">ツールが見つかりません</p>
        <button type="button" onClick={() => router.push("/tools")} className="mt-4 text-primary">
          一覧へ
        </button>
      </div>
    );
  }

  const profile = tool.profile_json as HubToolProfile;
  const isOwner = session?.user?.id === tool.user_id;
  const isDraft = tool.status === "draft";

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
        <h1 className="font-headline flex-1 text-lg font-bold text-primary">ツール詳細</h1>
        {tool.website_url && (
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-secondary"
          >
            公式
          </a>
        )}
      </header>

      <main className="space-y-8 px-6 pt-6">
        <section className="rounded-xl bg-surface-container-lowest p-6 editorial-shadow">
          <h2 className="font-headline text-2xl font-bold text-on-surface">{tool.name}</h2>
          {isDraft && isOwner && (
            <div className="mt-4 rounded-lg border border-tertiary-container bg-tertiary-container/30 p-4">
              <p className="mb-3 text-sm text-on-tertiary-container">下書きです。家族に公開しますか？</p>
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? "公開中…" : "公開する"}
              </Button>
            </div>
          )}
          <p className="mt-4 text-sm leading-relaxed text-on-surface">{profile.summary}</p>
        </section>

        {(profile.good_for?.length ?? 0) > 0 && (
          <section>
            <h3 className="mb-2 font-headline text-sm font-bold text-primary">向いていること</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-on-surface">
              {profile.good_for?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </section>
        )}

        {(profile.bad_for?.length ?? 0) > 0 && (
          <section>
            <h3 className="mb-2 font-headline text-sm font-bold text-on-surface-variant">
              向いていないこと
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-on-surface-variant">
              {profile.bad_for?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </section>
        )}

        {(profile.cautions?.length ?? 0) > 0 && (
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
            <h3 className="mb-2 font-headline text-sm font-bold text-error">注意</h3>
            <ul className="space-y-1 text-sm text-on-surface">
              {profile.cautions?.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </section>
        )}

        {profile.extra_sections?.map((s, i) => (
          <section key={i} className="rounded-xl bg-surface-container-low p-4">
            <h3 className="mb-2 font-headline font-bold text-on-surface">{s.title}</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">{s.body}</p>
          </section>
        ))}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-on-surface">ミッション</h3>
            <Link href={`/tools/${id}/threads`} className="text-sm font-semibold text-primary">
              質問・雑談
            </Link>
          </div>
          {missions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">ミッションは準備中です。</p>
          ) : (
            <ul className="space-y-2">
              {missions.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/tools/${id}/missions/${m.id}`}
                    className="block rounded-xl bg-tertiary-container/40 p-4 font-semibold text-on-tertiary-container transition-opacity hover:opacity-90"
                  >
                    {m.title}
                    <span className="ml-2 text-xs font-normal opacity-80">
                      約{m.estimated_minutes ?? "?"}分
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isOwner && isDraft && (
          <button
            type="button"
            onClick={async () => {
              await fetch(`/api/hub/tools/${id}/enrich`, { method: "POST", body: "{}" });
              const res = await fetch(`/api/hub/tools/${id}`);
              if (res.ok) {
                const data = await res.json();
                setTool(data.tool);
              }
            }}
            className="w-full rounded-xl border border-dashed border-primary py-3 text-sm font-semibold text-primary"
          >
            AIで下書きを再生成
          </button>
        )}
      </main>
    </div>
  );
}

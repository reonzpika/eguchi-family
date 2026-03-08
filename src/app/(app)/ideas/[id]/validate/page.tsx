"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Idea {
  id: string;
  title: string;
  user_id: string;
}

const proseClass =
  "text-sm leading-relaxed [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_li]:mb-0.5";

type PageProps = { params: Promise<{ id: string }> };

export default function ValidatePage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ideaId = resolvedParams.id;
  const { data: session } = useSession();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationContent, setValidationContent] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIdea() {
      if (!ideaId || !session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            router.push("/ideas");
            return;
          }
          throw new Error("Failed to fetch idea");
        }

        const data = (await res.json()) as Idea;
        setIdea(data);
      } catch {
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [ideaId, session?.user?.id, router]);

  useEffect(() => {
    if (!idea || !session?.user?.id) return;

    let cancelled = false;
    setValidationLoading(true);
    setError(null);

    fetch(`/api/ideas/${ideaId}/validate`, { method: "POST" })
      .then((res) => {
        if (cancelled) return res;
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error ?? "Failed")));
        return res.json();
      })
      .then((data: { content: string }) => {
        if (!cancelled) setValidationContent(data.content);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "エラーが発生しました。");
      })
      .finally(() => {
        if (!cancelled) setValidationLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ideaId, idea, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-sm text-primary"
        >
          ← 戻る
        </button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          プロジェクトに昇格する前に
        </h1>
        <p className="mb-6 text-sm text-muted">
          「{idea.title}」の現実チェックです
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {validationLoading && (
          <div className="mb-6 rounded-2xl border border-border-warm bg-bg-warm p-6 text-center text-sm text-muted">
            AIがチェックしています...
          </div>
        )}

        {!validationLoading && validationContent && (
          <div className={`mb-6 rounded-2xl border border-border-warm bg-white p-4 ${proseClass}`}>
            <ReactMarkdown>{validationContent}</ReactMarkdown>
          </div>
        )}

        {!validationLoading && (validationContent || error) && (
          <div className="flex flex-col gap-3">
            <Link
              href={`/ideas/${ideaId}/upgrade`}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.98]"
            >
              🚀 プロジェクトを作成する
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="min-h-[48px] w-full rounded-xl border-2 border-border-warm bg-white py-3.5 font-semibold text-foreground"
            >
              ← 戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

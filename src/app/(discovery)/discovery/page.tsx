"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AssessmentQuestion, type AssessmentQuestionConfig } from "@/components/discovery/AssessmentQuestion";
import { SuperpowerCard } from "@/components/discovery/SuperpowerCard";

const DISCOVERY_QUESTIONS: AssessmentQuestionConfig[] = [
  {
    emoji: "💪",
    question: "人からよく頼まれる、得意なことはありますか？",
    type: "text",
    placeholder: "例: 料理、整理整頓、教えること…",
  },
  {
    emoji: "🌟",
    question: "自由時間に何をしていますか？",
    type: "multiselect",
    options: [
      "創作活動",
      "新しいことを学ぶ",
      "人を助ける",
      "ものづくり",
      "整理・計画",
      "社交",
      "その他",
    ],
  },
  {
    emoji: "⏰",
    question: "週にどれくらい副業に使えそうですか？",
    type: "buttons",
    options: ["2〜5時間", "5〜10時間", "10時間以上", "まだわからない"],
  },
  {
    emoji: "💭",
    question: "日常で「これが不便だな」と感じることは？",
    type: "text",
    placeholder: "例: 高い有機野菜、地元の職人を見つけにくい…",
  },
  {
    emoji: "📚",
    question: "新しいことはどうやって学ぶのが好きですか？",
    type: "multiselect",
    options: ["動画", "記事を読む", "手を動かす", "人と話す"],
  },
  {
    emoji: "🎯",
    question: "このプロジェクトがうまくいったら、あなたにとって成功とは？",
    type: "multiselect",
    options: [
      "家族の収入",
      "創作の場",
      "誰かを助ける",
      "スキル習得",
      "残るものを作る",
      "自分のペースで",
    ],
  },
  {
    emoji: "😊",
    question: "ビジネスを始める自信は 1〜5 でどれくらいですか？",
    type: "scale",
    scaleEmojis: ["😰 1", "😟 2", "😐 3", "🙂 4", "😊 5"],
  },
];

const PLACEHOLDER_SUPERPOWER = {
  title: "システム思考家",
  description:
    "混沌を整理し、わかりやすくする力があります。計画や仕組みづくりを活かしたビジネスが向いています。",
};

const COOKIE_NAME = "discovery_completed";
const COOKIE_MAX_AGE_DAYS = 365;

function setDiscoveryCompletedCookie() {
  const value = "1";
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
}

export default function DiscoveryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[] | number>>({});

  // Returning users (already have ideas) skip discovery
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    fetch("/api/discovery/status")
      .then((res) => (res.ok ? res.json() : { completed: false }))
      .then((data) => {
        if (cancelled) return;
        if (data.completed) {
          setDiscoveryCompletedCookie();
          router.replace("/");
          router.refresh();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, router]);

  const totalSteps = DISCOVERY_QUESTIONS.length;
  const isCompletionStep = step >= totalSteps;
  const currentQuestion = DISCOVERY_QUESTIONS[step];
  const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

  const handleAnswer = useCallback(
    (answer: string | string[] | number) => {
      setAnswers((prev) => ({ ...prev, [step]: answer }));
      if (step < totalSteps - 1) {
        setStep((s) => s + 1);
      } else {
        setStep(totalSteps);
      }
    },
    [step, totalSteps]
  );

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleCompletionCta = useCallback(async () => {
    setCompleteError(null);
    setCompleting(true);
    try {
      const res = await fetch("/api/discovery/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCompleteError(data.error ?? "プロフィールの保存に失敗しました");
        setCompleting(false);
        return;
      }
      setDiscoveryCompletedCookie();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("show_pwa_install_prompt", "1");
      }
      router.push("/");
      router.refresh();
    } catch {
      setCompleteError("接続エラー。もう一度お試しください。");
      setCompleting(false);
    }
  }, [router, answers]);

  const firstName = session?.user?.name?.split(" ")[0] || "あなた";

  if (isCompletionStep) {
    return (
      <div className="flex min-h-screen flex-col px-5 py-8">
        <div className="mb-6 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-2 text-xl font-bold text-foreground">
            あなたのプロフィールができました！
          </h1>
          <p className="text-sm text-muted">Family Workspace</p>
        </div>

        <div className="mb-6 rounded-2xl border border-border-warm bg-white p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {firstName}さん、こんなことがわかりました。強みを活かして、無理のないペースで始めましょう。
          </p>
        </div>

        <SuperpowerCard
          title={PLACEHOLDER_SUPERPOWER.title}
          description={PLACEHOLDER_SUPERPOWER.description}
        />

        {completeError && (
          <p className="mt-4 text-center text-sm text-red-600" role="alert">
            {completeError}
          </p>
        )}
        <button
          type="button"
          onClick={handleCompletionCta}
          disabled={completing}
          className="mt-8 min-h-[48px] w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
        >
          {completing ? "保存中…" : "ホームへ →"}
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <AssessmentQuestion
      key={step}
      question={currentQuestion}
      onAnswer={handleAnswer}
      progress={progress}
      currentStep={step + 1}
      totalSteps={totalSteps}
    />
  );
}

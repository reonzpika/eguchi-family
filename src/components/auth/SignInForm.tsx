"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FAMILY_MEMBERS } from "@/lib/family-members";

type Step = "pick" | "set-password" | "enter-password";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [step, setStep] = useState<Step>("pick");
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedMember = FAMILY_MEMBERS.find((m) => m.member_id === memberId);

  async function handlePickMember(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!memberId) {
      setError("誰かを選んでください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/status?member_id=${encodeURIComponent(memberId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      setStep(data.hasPassword ? "enter-password" : "set-password");
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "パスワードの設定に失敗しました");
        return;
      }
      const result = await signIn("credentials", {
        member_id: memberId,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("ログインに失敗しました");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnterPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        member_id: memberId,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("パスワードが正しくありません");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function backToPick() {
    setStep("pick");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {step === "pick" && (
        <form onSubmit={handlePickMember} className="space-y-4">
          <label className="block text-left text-sm font-semibold text-foreground">
            誰ですか？
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground"
            required
          >
            <option value="">選んでください</option>
            {FAMILY_MEMBERS.map((m) => (
              <option key={m.member_id} value={m.member_id}>
                {m.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? "確認中..." : "次へ"}
          </button>
        </form>
      )}

      {step === "set-password" && selectedMember && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <p className="text-sm text-muted">
            {selectedMember.name} のパスワードを設定します（6文字以上）
          </p>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground"
            minLength={6}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground"
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={backToPick}
              className="rounded-xl border border-border-warm bg-white px-4 py-3 text-sm font-semibold text-muted"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "設定中..." : "パスワードを設定してログイン"}
            </button>
          </div>
        </form>
      )}

      {step === "enter-password" && selectedMember && (
        <form onSubmit={handleEnterPassword} className="space-y-4">
          <p className="text-sm text-muted">
            {selectedMember.name} のパスワードを入力してください
          </p>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-foreground"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={backToPick}
              className="rounded-xl border border-border-warm bg-white px-4 py-3 text-sm font-semibold text-muted"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

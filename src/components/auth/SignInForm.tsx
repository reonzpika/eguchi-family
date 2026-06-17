"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FAMILY_MEMBERS } from "@/lib/family-members";

/** Family app: no password. Pick your name and you are in. */
export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!memberId) {
      setError("誰かを選んでください");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        member_id: memberId,
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

  return (
    <div className="w-full max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-left text-sm font-semibold text-foreground">
          誰ですか？
        </label>
        <select
          data-testid="sign-in-member-select"
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
          {loading ? "入っています..." : "はじめる"}
        </button>
      </form>
    </div>
  );
}

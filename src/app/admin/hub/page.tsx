"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/family-members";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FamilyToolRow } from "@/types/hub";

export default function AdminHubMissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<FamilyToolRow[]>([]);
  const [toolId, setToolId] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("10");
  const [steps, setSteps] = useState("");
  const [prompts, setPrompts] = useState("");
  const [done, setDone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.member_id) {
      if (!isAdmin(session.user.member_id)) {
        router.replace("/");
        return;
      }
      (async () => {
        const res = await fetch("/api/hub/tools");
        if (res.ok) {
          const data = await res.json();
          setTools(data.published ?? []);
        }
      })();
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="p-6 text-muted">…</div>;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-6 font-headline text-xl font-bold text-foreground">ミッション作成</h1>
      <p className="mb-4 text-sm text-muted">
        公開済みツールにミッションを追加します。各項目は改行区切りで手順・チェックリストを入力できます。
      </p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          if (!toolId || !title.trim()) {
            setMsg("ツールとタイトルを入力してください");
            return;
          }
          const stepLines = steps
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          const doneLines = done
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          const promptBlocks = prompts
            .split("\n\n")
            .map((chunk, i) => ({
              label: `プロンプト${i + 1}`,
              text: chunk.trim(),
            }))
            .filter((p) => p.text);

          const res = await fetch(`/api/hub/tools/${toolId}/missions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              estimated_minutes: parseInt(minutes, 10) || 10,
              steps: stepLines,
              prompt_blocks: promptBlocks,
              done_criteria: doneLines,
              published: true,
            }),
          });
          if (res.ok) {
            setMsg("保存しました");
            setTitle("");
            setSteps("");
            setPrompts("");
            setDone("");
          } else {
            setMsg("失敗しました");
          }
        }}
      >
        <div>
          <label className="mb-1 block text-sm font-semibold">ツール</label>
          <select
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-base"
            required
          >
            <option value="">選択…</option>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">タイトル</label>
          <Input value={title} onChange={setTitle} placeholder="ミッション名" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">目安（分）</label>
          <Input value={minutes} onChange={setMinutes} placeholder="10" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">手順（1行1ステップ）</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            プロンプト（空行で区切って複数）
          </label>
          <textarea
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">完成のサイン（1行1つ）</label>
          <textarea
            value={done}
            onChange={(e) => setDone(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-sm"
          />
        </div>
        {msg && <p className="text-sm text-primary">{msg}</p>}
        <Button type="submit">保存</Button>
      </form>
    </div>
  );
}

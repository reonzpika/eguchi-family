"use client";

import { useState } from "react";
import { ChatMarkdown } from "@/components/ui/ChatMarkdown";

/** A code/prompt block with a one-tap copy button. */
function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* manual select fallback */
    }
  }
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-primary/30 bg-white/70">
      <div className="flex items-center justify-between border-b border-primary/20 px-3 py-1.5">
        <span className="text-[10px] font-bold text-primary">プロンプト</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-on-primary transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">{copied ? "check" : "content_copy"}</span>
          {copied ? "コピーした！" : "コピー"}
        </button>
      </div>
      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words p-3 font-sans text-xs leading-relaxed text-on-surface">
        {code}
      </pre>
    </div>
  );
}

type Seg = { type: "text" | "code"; content: string };

/** Split on ``` fences (tolerant of an unclosed block while streaming). */
function parseSegments(text: string): Seg[] {
  const segs: Seg[] = [];
  let inCode = false;
  let buf: string[] = [];
  const flush = () => {
    const content = buf.join("\n");
    if (content.trim()) segs.push({ type: inCode ? "code" : "text", content });
    buf = [];
  };
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      flush();
      inCode = !inCode;
      continue;
    }
    buf.push(line);
  }
  flush();
  return segs;
}

export function AssistantMessage({ text }: { text: string }) {
  const segs = parseSegments(text);
  if (segs.length === 0) return null;
  return (
    <>
      {segs.map((s, i) =>
        s.type === "code" ? <CopyableCode key={i} code={s.content} /> : <ChatMarkdown key={i}>{s.content}</ChatMarkdown>
      )}
    </>
  );
}

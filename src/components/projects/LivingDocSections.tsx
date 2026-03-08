"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Section {
  title: string;
  body: string;
}

function parseSections(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[1].trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) sections.push(current);

  if (sections.length === 0) {
    return [{ title: "", body: content }];
  }
  return sections;
}

export function LivingDocSections({ content }: { content: string }) {
  const sections = parseSections(content);
  const [open, setOpen] = useState<Set<number>>(() => new Set(sections.map((_, i) => i)));

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {sections.map((sec, i) => (
        <section key={i} className="border-b border-border-warm last:border-b-0">
          {sec.title ? (
            <>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full min-h-[44px] items-center justify-between py-2 text-left"
                aria-expanded={open.has(i)}
              >
                <span className="text-sm font-bold text-foreground">{sec.title}</span>
                <span className="text-muted">{open.has(i) ? "▲" : "▼"}</span>
              </button>
              {open.has(i) && (
                <div className="markdown-content pb-3 text-sm text-foreground [&_p]:mb-2 [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_strong]:font-semibold">
                  <ReactMarkdown>{sec.body.trim()}</ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <div className="markdown-content py-2 text-sm text-foreground [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_p]:mb-3 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_strong]:font-semibold">
              <ReactMarkdown>{sec.body}</ReactMarkdown>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

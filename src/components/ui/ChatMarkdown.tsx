"use client";

import ReactMarkdown from "react-markdown";

/**
 * Renders markdown for chat message bubbles so that **bold**, lists, and
 * line breaks display correctly instead of showing raw asterisks.
 * Use inside chat bubbles (agent or user); text colour inherits from parent.
 */
const proseClass =
  "text-sm leading-relaxed whitespace-pre-wrap [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-0.5 [&_a]:underline [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs";

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className={proseClass}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}

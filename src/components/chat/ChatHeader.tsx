"use client";

interface ChatHeaderProps {
  onBack: () => void;
  title: string;
  backDisabled?: boolean;
  children?: React.ReactNode;
  "data-testid"?: string;
}

/**
 * Fixed chat header (50–60px). Back left, title centre, actions right.
 * No hide-on-scroll; always visible.
 */
export function ChatHeader({
  onBack,
  title,
  backDisabled = false,
  children,
  "data-testid": dataTestId,
}: ChatHeaderProps) {
  return (
    <header
      className="shrink-0 border-b border-border-warm bg-white px-4 py-3"
      data-testid={dataTestId}
    >
      <div className="flex h-11 min-h-[44px] items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-warm bg-white text-base transition-transform active:scale-[0.97] disabled:opacity-50"
          aria-label="戻る"
        >
          ←
        </button>
        <h2 className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground">
          {title}
        </h2>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {children}
        </div>
      </div>
    </header>
  );
}

"use client";

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  const base =
    "rounded-2xl border border-border-warm bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]";
  const interactive = onClick
    ? "cursor-pointer transition-transform active:scale-[0.98]"
    : "";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${interactive} ${className}`}
      >
        {children}
      </button>
    );
  }

  return <div className={`${base} ${className}`}>{children}</div>;
}

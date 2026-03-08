"use client";

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  disabled = false,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`min-h-[48px] w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none disabled:opacity-50 ${className}`}
    />
  );
}

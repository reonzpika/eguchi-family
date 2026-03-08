"use client";

interface InputProps {
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = "",
  id,
  "aria-label": ariaLabel,
}: InputProps) {
  const borderClass = error
    ? "border-red-500 focus:border-red-500"
    : "border-border-warm focus:border-primary";

  return (
    <div className={className}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted focus:outline-none ${borderClass}`}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

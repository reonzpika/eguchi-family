"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "min-h-[48px] rounded-xl px-6 py-3.5 text-base font-semibold transition-transform active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-primary text-on-primary",
    secondary: "border-2 border-primary bg-white text-primary",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

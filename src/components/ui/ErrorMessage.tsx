"use client";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message = "読み込みに失敗しました。ページを更新してみてください。",
  onRetry,
  className = "",
}: ErrorMessageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 border-primary bg-primary-light p-5 text-center ${className}`}
    >
      <div className="mb-3 text-2xl">⚠️</div>
      <p className="mb-4 text-sm font-semibold text-foreground">{message}</p>
      <button
        onClick={handleRetry}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
      >
        もう一度試す
      </button>
    </div>
  );
}

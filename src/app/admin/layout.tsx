import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-bg-warm">
      <header className="fixed left-1/2 top-0 z-50 flex w-full max-w-[390px] -translate-x-1/2 items-center justify-between border-b border-border-warm bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="text-sm font-extrabold text-foreground">
          🔧 管理パネル — Ryo only
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          アプリに戻る →
        </Link>
      </header>
      <main className="pb-6 pt-14">{children}</main>
    </div>
  );
}

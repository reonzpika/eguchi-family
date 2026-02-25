import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-bg-warm">
      <Header />
      <main className="pb-20 pt-14">{children}</main>
      <BottomNav />
    </div>
  );
}

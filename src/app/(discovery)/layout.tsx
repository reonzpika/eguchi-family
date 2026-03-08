/**
 * Minimal layout for discovery flow: no Header, no BottomNav.
 * User cannot leave until discovery is completed.
 */
export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[390px] bg-bg-warm">
      {children}
    </div>
  );
}

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="phone-shell mx-auto min-h-svh w-full max-w-[480px] overflow-hidden">
      {children}
    </main>
  );
}

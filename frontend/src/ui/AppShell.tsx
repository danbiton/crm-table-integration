// src/ui/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="h-14 border-b flex items-center px-6">
        <span className="font-semibold">CRM</span>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}

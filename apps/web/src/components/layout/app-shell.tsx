import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              PAN India Real Estate
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Asking Price Projection Engine
            </div>
          </div>

          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 md:block">
            V1 foundation in progress
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">{children}</main>
    </div>
  );
}
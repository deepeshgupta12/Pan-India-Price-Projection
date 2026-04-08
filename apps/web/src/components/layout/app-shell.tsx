import { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* ── Top navigation bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Wordmark + product name */}
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2 12 L5 7 L8 9 L11 4 L14 6"
                />
              </svg>
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                PAN India · Real Estate
              </div>
              <div className="text-sm font-semibold tracking-tight text-slate-950">
                Asking Price Projection Engine
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
              Step 11 complete
            </div>
            <div className="flex h-2 w-2 rounded-full bg-emerald-400" title="System online" />
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="text-xs text-slate-400">
              PAN India Real Estate · Asking Price Projection Engine · V1
            </div>
            <div className="text-xs text-slate-400">
              Fair price · 1Y / 3Y / 5Y projections · Sensitivity · Save &amp; compare
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { ReactNode } from "react";
import { Activity, Moon, Sun } from "lucide-react";

interface PageShellProps {
  title: string;
  subtitle: string;
  theme: "light" | "dark";
  toggleTheme: () => void;
  rightContent: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  theme,
  toggleTheme,
  rightContent,
  children,
}: PageShellProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#060b14] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.94),rgba(248,250,252,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_24%),linear-gradient(to_bottom,rgba(2,6,23,0.96),rgba(6,11,20,0.98))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.15),transparent)] blur-3xl dark:bg-[linear-gradient(to_bottom,rgba(99,102,241,0.2),transparent)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30">
          <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-200/70 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <img src="/favicon.svg" className="h-7 w-7" alt="Resume Analyzer" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-600 dark:text-indigo-400">
                    {subtitle}
                  </p>
                  <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                    {title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Live API connected</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={toggleTheme}
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  {rightContent}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 sm:py-10">{children}</main>

        <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Resume Analyzer. Built for fast, accurate resume review.
        </footer>
      </div>
    </div>
  );
}

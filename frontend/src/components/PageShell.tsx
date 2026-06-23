import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

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
    <div className="relative min-h-screen flex flex-col justify-between w-full text-primary-theme transition-colors duration-200 bg-grid bg-body-theme">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-main-theme bg-body-theme/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="font-mono text-sm font-bold tracking-tight text-accent-theme bg-panel-theme border border-main-theme px-2.5 py-1 rounded-none">
              [RM]
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-primary-theme">
                {title}
              </span>
              <span className="hidden text-xs text-muted-theme sm:block font-mono">{subtitle}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-none text-secondary-theme transition hover:bg-panel-theme hover:text-primary-theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {rightContent}
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14 flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-main-theme">
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-6">
          <p className="text-[13px] text-muted-theme text-center">
            © {new Date().getFullYear()} Resumark. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

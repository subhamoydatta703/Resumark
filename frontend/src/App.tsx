import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { useEffect, useState, type ReactNode } from "react";
import { Sparkles, Brain, Cpu, FileText, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { UploadPage } from "./pages/UploadPage";
import { registerGetToken } from "./services/api";
import { PageShell } from "./components/PageShell";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );

  // Sync theme to <html> element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <SignedIn>
        <AuthenticatedApp theme={theme} toggleTheme={toggleTheme} />
      </SignedIn>
      <SignedOut>
        <UnauthenticatedApp theme={theme} toggleTheme={toggleTheme} />
      </SignedOut>
    </>
  );
}

interface AuthenticatedAppProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function AuthenticatedApp({ theme, toggleTheme }: AuthenticatedAppProps) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerGetToken(getToken);
  }, [getToken]);

  return <UploadPage theme={theme} toggleTheme={toggleTheme} />;
}

interface UnauthenticatedAppProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function UnauthenticatedApp({ theme, toggleTheme }: UnauthenticatedAppProps) {
  return (
    <PageShell
      title="Resume Analyzer"
      subtitle="AI resume review"
      theme={theme}
      toggleTheme={toggleTheme}
      rightContent={
        <SignInButton mode="modal">
          <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:-translate-y-0.5 hover:bg-indigo-500">
            Sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </SignInButton>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
        <section className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Smart resume evaluation
            </div>

            <div className="space-y-4">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                Analyze resumes with a cleaner, faster, AI-first workflow.
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                Upload a PDF and get a structured review of skills, experience, ATS fit, and presentation quality in a layout that feels polished on every screen size.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SignInButton mode="modal">
                <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                  Get started
                </button>
              </SignInButton>
              <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition-colors dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                Secure auth and live analysis
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard title="AI scoring" value="ATS + quality" icon={<Brain className="h-5 w-5" />} />
                <StatCard title="Fast parsing" value="PDF upload" icon={<Cpu className="h-5 w-5" />} />
                <StatCard title="Structured output" value="Roles, skills" icon={<FileText className="h-5 w-5" />} />
                <StatCard title="Cleaner review" value="Actionable next steps" icon={<ShieldCheck className="h-5 w-5" />} />
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">What you get</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-4 w-4 text-emerald-400" />
                  Clean analysis cards with readable hierarchy
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-4 w-4 text-emerald-400" />
                  Responsive layouts that adapt to mobile and desktop
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-4 w-4 text-emerald-400" />
                  Clear status feedback during upload and processing
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Cpu className="h-5 w-5" />}
            title="AI evaluation"
            description="Evaluates experience, technical stack match, and professional highlights with a more readable result layout."
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Structure extraction"
            description="Surfaces contact details, external profiles, education, and formatting patterns without overwhelming the page."
          />
          <FeatureCard
            icon={<Brain className="h-5 w-5" />}
            title="ATS scoring"
            description="Highlights presentation issues and improvement opportunities with clear sections and consistent spacing."
          />
        </section>
      </div>
    </PageShell>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-white/10 dark:bg-white/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-indigo-200 dark:border-white/10 dark:bg-slate-950/55 dark:hover:border-indigo-500/20">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}

export default App;

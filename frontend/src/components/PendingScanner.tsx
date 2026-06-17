import React, { useEffect, useState } from "react";
import { Loader2, Check, Radar, Sparkles } from "lucide-react";

interface PendingScannerProps {
  resumeId: string;
  fileName: string | null;
}

const STEPS = [
  "Parsing document layout",
  "Extracting resume sections",
  "Indexing skills and competencies",
  "Running scoring models",
];

export const PendingScanner: React.FC<PendingScannerProps> = ({
  resumeId,
  fileName,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl animate-scale-up transition-colors dark:border-white/10 dark:bg-slate-950/60 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/10 dark:bg-indigo-400/10" />
            <div className="absolute inset-3 rounded-full bg-indigo-500/15 blur-sm dark:bg-indigo-400/10" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-slate-950 dark:text-indigo-300">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Radar className="h-3.5 w-3.5" />
              Processing
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Analyzing resume
            </h2>
            <p className="mx-auto max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
              We&apos;re parsing <span className="font-semibold text-slate-950 dark:text-white">{fileName || "your document"}</span> and building the report.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Analysis progress
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Resume ID <span className="font-mono font-semibold text-slate-950 dark:text-white">{resumeId.slice(0, 8)}</span>
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>

          <div className="mt-4 space-y-3">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              return (
                <div
                  key={step}
                  className={`flex items-start gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50/70 text-slate-950 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-white"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50/70 text-slate-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-slate-200"
                        : "border-transparent bg-white/70 text-slate-500 dark:bg-slate-950/30 dark:text-slate-400"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                      isCompleted
                        ? "border-emerald-200 bg-white text-emerald-600 dark:border-emerald-500/20 dark:bg-slate-950 dark:text-emerald-300"
                        : isActive
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{step}</p>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {isActive ? "Running now" : isCompleted ? "Completed" : "Queued"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

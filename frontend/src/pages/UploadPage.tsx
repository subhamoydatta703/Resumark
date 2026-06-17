import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { ResumeUploader } from "../components/ResumeUploader";
import { PendingScanner } from "../components/PendingScanner";
import { AnalysisDashboard } from "../components/AnalysisDashboard";
import { uploadResume, analyzeResume, getResumeDetails } from "../services/api";
import type { UploadState } from "../types";
import { PageShell } from "../components/PageShell";

interface UploadPageProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ theme, toggleTheme }) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    resumeId: null,
    error: null,
    fileName: null,
    fileSize: null,
    analysisResult: null,
  });

  const pollingTimerRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  const handleUpload = async (file: File) => {
    setUploadState({
      status: "uploading",
      progress: 0,
      resumeId: null,
      error: null,
      fileName: file.name,
      fileSize: file.size,
      analysisResult: null,
    });

    try {
      const response = await uploadResume(file, (progress) => {
        setUploadState((prev) => ({ ...prev, progress }));
      });

      const resumeId = response.resumeId;

      setUploadState((prev) => ({
        ...prev,
        status: "pending",
        resumeId,
        error: null,
      }));

      // Start live analysis synchronously
      startPolling(resumeId);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage =
        getErrorMessage(err) ||
        "An unexpected error occurred during upload. Please verify that your backend server is active.";
      
      setUploadState((prev) => ({
        ...prev,
        status: "failed",
        error: errorMessage,
      }));
    }
  };

  const startPolling = async (resumeId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max

    // 1. Initial check to see if the resume has already been analyzed.
    try {
      const initialCheck = await getResumeDetails(resumeId);
      if (initialCheck.status === "COMPLETED" && initialCheck.analysisResult) {
        setUploadState((prev) => ({
          ...prev,
          status: "completed",
          analysisResult: initialCheck.analysisResult || null,
          error: null,
        }));
        return;
      }
    } catch (err) {
      console.warn("Initial check failed or still pending, triggering analysis...", err);
    }

    try {
      const response = await analyzeResume(resumeId);

      if (response.status === "COMPLETED" && response.analysisResult) {
        setUploadState((prev) => ({
          ...prev,
          status: "completed",
          analysisResult: response.analysisResult || null,
          error: null,
        }));
        return;
      }
    } catch (err: unknown) {
      console.error("POST analysis failed, checking for updates...", err);
      // If POST fails (e.g., timeout/network issue), the server might still process the analysis.
      // We fall back to polling the GET endpoint below.
    }

    const pollInterval = window.setInterval(async () => {
      attempts++;
      try {
        const check = await getResumeDetails(resumeId);
        if (check.status === "COMPLETED" && check.analysisResult) {
          window.clearInterval(pollInterval);
          setUploadState((prev) => ({
            ...prev,
            status: "completed",
            analysisResult: check.analysisResult || null,
            error: null,
          }));
        } else if (check.status === "FAILED") {
          window.clearInterval(pollInterval);
          setUploadState((prev) => ({
            ...prev,
            status: "failed",
            error: "Resume analysis failed on the server.",
          }));
        } else if (attempts >= maxAttempts) {
          window.clearInterval(pollInterval);
          setUploadState((prev) => ({
            ...prev,
            status: "failed",
            error: "Analysis timed out. Please try again.",
          }));
        }
      } catch (pollErr: unknown) {
        console.error("Error during polling:", pollErr);
        if (attempts >= maxAttempts) {
          window.clearInterval(pollInterval);
          setUploadState((prev) => ({
            ...prev,
            status: "failed",
            error: getErrorMessage(pollErr) || "Failed to retrieve analysis status.",
          }));
        }
      }
    }, 2000);

    pollingTimerRef.current = pollInterval;
  };

  const handleReset = () => {
    setUploadState({
      status: "idle",
      progress: 0,
      resumeId: null,
      error: null,
      fileName: null,
      fileSize: null,
      analysisResult: null,
    });
  };


  const isWorking = uploadState.status === "idle" || uploadState.status === "uploading";
  const statusLabel =
    uploadState.status === "idle"
      ? "Ready to review"
      : uploadState.status === "uploading"
        ? "Uploading resume"
        : uploadState.status === "pending"
          ? "Processing analysis"
          : uploadState.status === "completed"
            ? "Analysis complete"
            : "Action needed";

  return (
    <PageShell
      title="Resume Analyzer"
      subtitle="Secure review workspace"
      theme={theme}
      toggleTheme={toggleTheme}
      rightContent={<UserButton />}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-400">
              {statusLabel}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Upload a resume and let the analysis flow in a clean, structured view.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              The interface is optimized for quick scanning on desktop and comfortable use on mobile, with clear progress states for upload, processing, and results.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Format" value="PDF only" />
            <InfoTile label="Output" value="ATS + skills" />
            <InfoTile label="Status" value={statusLabel} />
            <InfoTile label="Mode" value="Responsive UI" />
          </div>
        </section>

        {isWorking ? (
          <ResumeUploader uploadState={uploadState} onUpload={handleUpload} onCancel={handleReset} />
        ) : uploadState.status === "pending" ? (
          <div className="flex justify-center">
            <PendingScanner resumeId={uploadState.resumeId || ""} fileName={uploadState.fileName} />
          </div>
        ) : uploadState.status === "completed" && uploadState.analysisResult ? (
          <AnalysisDashboard analysisResult={uploadState.analysisResult} onReset={handleReset} fileName={uploadState.fileName} />
        ) : (
          <div className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-rose-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-rose-500/20 dark:bg-slate-950/60 sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Analysis failed</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {uploadState.error || "An error occurred while analyzing the resume."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
};

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || null;
}

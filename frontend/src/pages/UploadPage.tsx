import React, { useState } from "react";
import { Sparkles, CheckCircle2, RefreshCw, Database, Terminal, Settings } from "lucide-react";
import { ResumeUploader } from "../components/ResumeUploader";
import { uploadResume, uploadResumeMock } from "../services/api";
import type { UploadState } from "../types";

export const UploadPage: React.FC = () => {
  const [useMock, setUseMock] = useState<boolean>(true);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    resumeId: null,
    error: null,
    fileName: null,
    fileSize: null,
  });

  const handleUpload = async (file: File) => {
    setUploadState({
      status: "uploading",
      progress: 0,
      resumeId: null,
      error: null,
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      let response;
      if (useMock) {
        response = await uploadResumeMock(file, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }));
        });
      } else {
        response = await uploadResume(file, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }));
        });
      }

      console.log("Upload response payload:", response);

      setUploadState((prev) => ({
        ...prev,
        status: "success",
        resumeId:
          response.resumeId ||
          response.fileData?.resume?.id ||
          (response as any).fileData?.id ||
          (response as any).id ||
          "N/A",
        error: null,
      }));
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during upload. Please verify that your backend server is active.";
      
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
    }
  };

  const handleReset = () => {
    setUploadState({
      status: "idle",
      progress: 0,
      resumeId: null,
      error: null,
      fileName: null,
      fileSize: null,
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 overflow-hidden font-sans">
      {/* Background visual graphics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      
      {/* Top utility bar */}
      <header className="w-full max-w-6xl flex items-center justify-between py-4 z-10 border-b border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/15">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            ResumeAI
          </span>
        </div>
        
        {/* Mock/Live status controller */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Settings className="w-3.5 h-3.5" />
            <span>Connection Mode:</span>
          </div>
          <button
            type="button"
            onClick={() => setUseMock(!useMock)}
            className={`flex items-center gap-1.5 font-semibold transition-all px-2.5 py-1 rounded-lg ${
              useMock
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {useMock ? (
              <>
                <Terminal className="w-3 h-3" />
                Mock API
              </>
            ) : (
              <>
                <Database className="w-3 h-3" />
                Live API (Port 5000)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main content container */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-12 z-10">
        
        {uploadState.status !== "success" ? (
          <>
            {/* Hero Section */}
            <div className="text-center max-w-2xl mb-10 space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-violet-400">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Advanced Parser Models
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                AI Resume <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Analyzer</span>
              </h1>
              <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                Upload your curriculum vitae in PDF format. Our parser extracts structures, classifies skills, and matches metrics to evaluate your career potential.
              </p>
            </div>

            {/* Resume Uploader component */}
            <ResumeUploader
              uploadState={uploadState}
              onUpload={handleUpload}
              onCancel={handleReset}
            />
          </>
        ) : (
          /* Success Screen */
          <div className="w-full max-w-lg border border-slate-800 bg-slate-900/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md border-t-slate-700/30 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Analysis Started!</h2>
              <p className="text-sm text-slate-400">
                Your resume <span className="text-slate-200 font-semibold">{uploadState.fileName}</span> was uploaded and parsing has initiated successfully.
              </p>
            </div>

            {/* Resume ID card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>METRIC</span>
                <span>VALUE</span>
              </div>
              <hr className="border-slate-800" />
              <div className="flex justify-between">
                <span className="text-slate-400">Resume ID:</span>
                <span className="text-violet-400 font-bold">{uploadState.resumeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">ANALYSIS_PENDING</span>
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 px-5 rounded-2xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 group transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
              Analyze Another Resume
            </button>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 border-t border-slate-900 text-xs text-slate-500 z-10">
        &copy; {new Date().getFullYear()} ResumeAI. Designed for rapid recruitment optimization.
      </footer>
    </div>
  );
};

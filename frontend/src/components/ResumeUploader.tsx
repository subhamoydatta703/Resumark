import React, { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { FileText, AlertCircle, X, FileUp } from "lucide-react";
import type { UploadState } from "../types";

interface ResumeUploaderProps {
  uploadState: UploadState;
  onUpload: (file: File) => void;
  onCancel: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  uploadState,
  onUpload,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting utility for file size
  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Input click handler
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file only.");
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onCancel();
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const isUploading = uploadState.status === "uploading";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Error state alert */}
      {(error || uploadState.error) && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-rose-950 dark:text-rose-100">Validation error</p>
            <p className="leading-6 opacity-90">{error || uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Main Drag Box / Selection Display */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleButtonClick();
            }
          }}
          className={`group relative overflow-hidden rounded-[1.75rem] border-2 border-dashed p-6 text-center shadow-[0_14px_50px_rgba(15,23,42,0.08)] transition-all duration-300 sm:p-10
            ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10"
                : "border-slate-200 bg-white/90 hover:border-indigo-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/25 dark:hover:bg-white/[0.07]"
            }
          `}
        >
          <div className="absolute inset-x-6 top-6 hidden h-px bg-gradient-to-r from-transparent via-indigo-200/70 to-transparent dark:via-indigo-500/20 sm:block" />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition-transform group-hover:scale-105 group-hover:border-indigo-200 group-hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:group-hover:border-indigo-500/20 dark:group-hover:text-indigo-300">
            <FileUp className="h-6 w-6" />
          </div>

          <div className="relative z-10 mt-5 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 transition-colors dark:text-white">
              Select or drop your resume
            </h3>
            <p className="mx-auto max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Upload a PDF resume and we&apos;ll parse it into a cleaner, structured analysis view.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
          >
            Browse Files
          </button>
        </div>
      ) : (
        /* File Card when file selected */
        <div className="space-y-6 rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl animate-scale-up transition-colors dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-colors dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate pr-2 text-sm font-semibold text-slate-950 dark:text-white" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-700 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Upload progress bar */}
          {isUploading && (
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Uploading...</span>
                <span>{uploadState.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isUploading && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Upload & Analyze
              </button>
            </div>
          )}

          {isUploading && (
            <button
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            >
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
              Processing...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

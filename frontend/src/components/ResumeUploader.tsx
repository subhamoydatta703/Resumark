import React, { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { FileText, X, Upload, AlertCircle } from "lucide-react";
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
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
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

  const isUploading = uploadState.status === "uploading";

  return (
    <div className="animate-fade-up w-full max-w-xl">

      {/* Error banner */}
      {(error || uploadState.error) && (
        <div className="mb-3 flex items-start gap-2.5 rounded border border-accent-theme/20 bg-accent-theme/5 p-3.5 text-[13px] text-accent-theme font-mono">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error || uploadState.error}</span>
        </div>
      )}

      {!selectedFile ? (
        /* ── Drop zone ──────────────────────────── */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={[
            "cursor-pointer rounded border-2 border-dashed p-10 text-center transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-theme sm:p-14",
            isDragActive
              ? "border-accent-theme bg-panel-theme"
              : "border-main-theme bg-card-theme hover:border-accent-theme/60",
          ].join(" ")}
        >
          <div className={[
            "mx-auto flex h-14 w-14 items-center justify-center rounded border transition-colors",
            isDragActive
              ? "border-accent-theme bg-accent-theme/5 text-accent-theme"
              : "border-main-theme bg-panel-theme text-muted-theme",
          ].join(" ")}>
            <Upload className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[15px] font-medium text-primary-theme">
            {isDragActive ? "Drop the PDF here" : "Drop your resume PDF here"}
          </p>
          <p className="mt-1 text-[13px] text-muted-theme">
            or click to browse — PDF only, max 5 MB
          </p>

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
              fileInputRef.current?.click();
            }}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded border border-main-theme bg-card-theme px-4 text-[13px] font-medium text-secondary-theme transition hover:bg-panel-theme"
          >
            <FileText className="h-3.5 w-3.5 text-accent-theme" />
            Browse files
          </button>
        </div>
      ) : (
        /* ── File ready card ────────────────────── */
        <div className="animate-scale-in surface rounded p-5 sm:p-6">
          {/* File row */}
          <div className="flex items-center gap-3 rounded border border-main-theme bg-panel-theme/40 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-accent-theme/20 bg-accent-theme/5 text-accent-theme">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate pr-1 text-[14px] font-medium text-primary-theme font-mono" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-theme font-mono">{formatBytes(selectedFile.size)}</p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-theme transition hover:bg-panel-theme hover:text-primary-theme"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[12px] text-muted-theme">
                <span className="font-mono">Uploading…</span>
                <span className="font-mono">{uploadState.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-panel-theme">
                <div
                  className="h-full bg-accent-theme transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2.5">
            {!isUploading ? (
              <>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded border border-main-theme bg-panel-theme text-[14px] font-medium text-secondary-theme transition hover:bg-body-theme"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onUpload(selectedFile)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded bg-stone-900 dark:bg-stone-100 text-[14px] font-medium text-stone-100 dark:text-stone-900 transition hover:opacity-90 active:scale-95"
                >
                  <Upload className="h-4 w-4" />
                  Analyze
                </button>
              </>
            ) : (
              <button
                disabled
                className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded border border-main-theme bg-panel-theme text-[14px] text-muted-theme font-mono"
              >
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                Processing…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

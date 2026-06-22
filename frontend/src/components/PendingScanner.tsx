import React, { useEffect, useState, useRef } from "react";

interface PendingScannerProps {
  resumeId: string;
  fileName: string | null;
}

interface LogLine {
  text: string;
  type: "info" | "success" | "accent";
}

const TERMINAL_LOGS: LogLine[] = [
  { text: "sys://init - initializing isolated audit engine", type: "info" },
  { text: "[INFO] opening secure document environment", type: "info" },
  { text: "[INFO] checking raw layout nodes and section coordinates", type: "info" },
  { text: "[SUCCESS] document hierarchy identified successfully", type: "success" },
  { text: "[INFO] auditing fonts, spacing, margins, and column layouts", type: "info" },
  { text: "[INFO] executing keyword density scanner against alignment indexes", type: "info" },
  { text: "[INFO] resolving career track categorizations", type: "info" },
  { text: "[SUCCESS] generating structured scoring matrices", type: "success" },
  { text: "[INFO] compiling final compliance ledger report", type: "accent" },
];

export const PendingScanner: React.FC<PendingScannerProps> = ({ resumeId, fileName }) => {
  const [displayedLogs, setDisplayedLogs] = useState<LogLine[]>([]);
  const [dots, setDots] = useState("");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    // Add logs one by one with deliberate timing
    const nextLog = () => {
      if (index < TERMINAL_LOGS.length) {
        setDisplayedLogs((prev) => [...prev, TERMINAL_LOGS[index]]);
        index++;
        const nextDelay = 800 + Math.random() * 800; // organic delay feel
        setTimeout(nextLog, nextDelay);
      }
    };
    nextLog();
  }, []);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedLogs, dots]);

  return (
    <div className="animate-scale-in w-full max-w-xl rounded border border-main-theme bg-stone-950 p-4 sm:p-5 text-stone-200 font-mono shadow-xl">
      
      {/* Window bar */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-800" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-800" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-800" />
          <span className="ml-2 text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
            AUDIT_CONSOLE
          </span>
        </div>
        <span className="text-[10px] text-stone-500 select-none">
          PID: {resumeId.slice(0, 7).toUpperCase()}
        </span>
      </div>

      {/* Terminal Log Console */}
      <div className="mt-4 h-64 overflow-y-auto px-1 space-y-2 text-[12px] scrollbar-thin select-text">
        {displayedLogs.map((log, idx) => {
          let color = "text-stone-400";
          if (log.type === "success") color = "text-emerald-400";
          if (log.type === "accent") color = "text-accent-theme";

          return (
            <div key={idx} className={`leading-relaxed ${color} break-all`}>
              {log.text}
            </div>
          );
        })}

        {/* Current loading prompt */}
        {displayedLogs.length < TERMINAL_LOGS.length ? (
          <div className="text-stone-200 flex items-center gap-1">
            <span>running audit calculations{dots}</span>
            <span className="inline-block w-1.5 h-3.5 bg-stone-200 animate-pulse" />
          </div>
        ) : (
          <div className="text-accent-theme flex items-center gap-1">
            <span>finalizing ledger rendering...</span>
            <span className="inline-block w-1.5 h-3.5 bg-accent-theme animate-pulse" />
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>

      {/* File status bottom bar */}
      {fileName && (
        <div className="mt-4 border-t border-stone-850 pt-3 flex items-center justify-between text-[10px] text-stone-500">
          <span className="truncate max-w-[280px]">FILE: {fileName}</span>
          <span>STATUS: SECURE_SCAN</span>
        </div>
      )}
    </div>
  );
};

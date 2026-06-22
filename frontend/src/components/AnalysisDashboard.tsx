import React, { useState, type ReactNode } from "react";
import {
  User, Mail, Phone, MapPin, Link,
  RefreshCw,
} from "lucide-react";
import type { AnalysisResult } from "../types";

interface Props {
  analysisResult: AnalysisResult;
  onReset: () => void;
  fileName: string | null;
}

const getRatingLabel = (score: number): string => {
  if (score >= 90) return "OPTIMAL";
  if (score >= 75) return "STRONG";
  if (score >= 50) return "AVERAGE";
  return "WEAK";
};

export const AnalysisDashboard: React.FC<Props> = ({ analysisResult, onReset, fileName }) => {
  const [tab, setTab] = useState<"overview" | "skills" | "experience" | "insights">("overview");

  const {
    overallScore = 0,
    atsCompatibility = 0,
    formattingScore = 0,
    summary = "",
    skills = [],
    experience = [],
    education = [],
    strengths = [],
    improvements = [],
    suggestedRoles = [],
  } = analysisResult || {};

  const info     = analysisResult?.candidateInfo;
  const name     = info?.name     || "Candidate";
  const email    = info?.email    || "—";
  const phone    = info?.phone    || "—";
  const location = info?.location || "—";
  const linkedin = info?.linkedin || "";
  const linkedinHref = linkedin ? (linkedin.startsWith("http") ? linkedin : `https://${linkedin}`) : "";

  return (
    <div className="animate-scale-in w-full space-y-6">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-main-theme pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-theme font-mono">
            Document Audit Complete
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-theme">{name}</h1>
          <p className="mt-0.5 text-[13px] text-muted-theme font-mono">
            Source: {fileName || "Uploaded Resume"}
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-main-theme bg-card-theme px-4 text-[13px] font-medium text-secondary-theme transition hover:bg-panel-theme active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5 text-accent-theme" />
          New analysis
        </button>
      </div>

      {/* ── Main ledger grid ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        
        {/* Left Column: Score Instrument Panel & Tab Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Score Instrument Panel (Monospace, no circular gauges) */}
          <div className="surface rounded p-5 sm:p-6 font-mono border-main-theme">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-main-theme pb-4 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-muted-theme font-bold">SYSTEM_AUDIT_INDEX</span>
                <div className="text-3xl font-extrabold text-accent-theme tracking-tight mt-0.5">
                  SCORE: {overallScore.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-muted-theme font-bold">RATING_LEVEL</span>
                <div className="text-base font-bold text-primary-theme mt-0.5">
                  {getRatingLabel(overallScore)}
                </div>
              </div>
            </div>
            
            {/* Grid of sub-scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-main-theme bg-panel-theme/40 p-3 rounded-sm">
                <span className="text-muted-theme uppercase tracking-wider block text-[9px] font-bold">ATS_COMPATIBILITY</span>
                <span className="text-sm font-bold text-primary-theme block mt-1">{atsCompatibility}%</span>
              </div>
              <div className="border border-main-theme bg-panel-theme/40 p-3 rounded-sm">
                <span className="text-muted-theme uppercase tracking-wider block text-[9px] font-bold">FORMATTING_SCORE</span>
                <span className="text-sm font-bold text-primary-theme block mt-1">{formattingScore}%</span>
              </div>
            </div>
          </div>

          {/* Action Lists (Tabs & Panels) */}
          <div className="surface rounded overflow-hidden border-main-theme">
            
            {/* Tab selection bar */}
            <div className="flex border-b border-main-theme bg-panel-theme/20 overflow-x-auto scrollbar-thin">
              {(["overview", "skills", "experience", "insights"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "h-11 px-5 text-[12px] font-mono uppercase tracking-wider transition-colors shrink-0",
                    tab === t
                      ? "border-b border-accent-theme text-accent-theme font-bold bg-card-theme"
                      : "text-muted-theme hover:text-primary-theme",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="p-5 sm:p-6">

              {tab === "overview" && (
                <div className="animate-scale-in space-y-6">
                  {/* Summary */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme font-mono block mb-2">
                      Executive Summary
                    </span>
                    <p className="text-[14px] leading-relaxed text-secondary-theme">
                      {summary || "No summary was extracted."}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-main-theme/50">
                    {/* Suggested roles */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme font-mono block mb-3">
                        Suggested Career Paths
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedRoles.length > 0 ? (
                          suggestedRoles.map((r) => (
                            <span
                              key={r}
                              className="rounded-sm border border-main-theme bg-panel-theme px-2.5 py-1 text-[11px] font-mono text-secondary-theme"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <p className="text-[13px] text-muted-theme font-mono">None identified</p>
                        )}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme font-mono block mb-3">
                        Education History
                      </span>
                      <div className="space-y-3 font-mono">
                        {education.length > 0 ? (
                          education.map((edu, i) => (
                            <div key={i} className="text-[12px]">
                              <p className="font-semibold text-primary-theme">{edu.degree}</p>
                              <p className="text-muted-theme mt-0.5">{edu.school} · {edu.year}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[13px] text-muted-theme font-mono">None extracted</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "skills" && (
                <div className="animate-scale-in space-y-6">
                  {skills.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {skills.map((cat) => (
                        <div key={cat.category} className="border border-main-theme/55 rounded p-4 bg-panel-theme/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-theme font-mono block mb-3">
                            {cat.category || "Skills Category"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.items?.map((s: string) => (
                              <span
                                key={s}
                                className="rounded-sm border border-main-theme bg-card-theme px-2 py-0.5 text-[11px] font-mono text-secondary-theme"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-muted-theme font-mono">No skills identified.</p>
                  )}
                </div>
              )}

              {tab === "experience" && (
                <div className="animate-scale-in space-y-5">
                  {experience.length > 0 ? (
                    experience.map((exp, i) => (
                      <div key={i} className="border border-main-theme/50 rounded-sm p-4 bg-panel-theme/20">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between font-mono">
                          <h3 className="text-[14px] font-bold text-primary-theme">{exp.role || "Role"}</h3>
                          <span className="text-[11px] text-muted-theme">{exp.duration}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-secondary-theme font-mono">
                          {exp.company}
                        </p>
                        <ul className="mt-3.5 space-y-2">
                          {(Array.isArray(exp.description) ? exp.description : [exp.description]).map((d: string, di: number) => (
                            <li key={di} className="flex items-start gap-2 text-[13px] leading-relaxed text-secondary-theme">
                              <span className="mt-2 h-1 w-1 shrink-0 bg-accent-theme" />
                              <span className="flex-1">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="text-[13px] text-muted-theme font-mono">No experience details parsed.</p>
                  )}
                </div>
              )}

              {tab === "insights" && (
                <div className="animate-scale-in grid gap-6 sm:grid-cols-2">
                  <InsightPanel
                    title="Audit Strengths"
                    items={strengths}
                    tone="green"
                  />
                  <InsightPanel
                    title="Required Actions"
                    items={improvements}
                    tone="amber"
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Contact Information Sidebar */}
        <div className="surface rounded p-5 sm:p-6 border-main-theme w-full lg:sticky lg:top-20">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-theme font-mono block mb-3.5">
            Parsed Contact Meta
          </span>
          <div className="space-y-1 divide-y divide-main-theme/50">
            <ContactRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={name} />
            <ContactRow
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email"
              value={email}
              href={email !== "—" ? `mailto:${email}` : undefined}
            />
            <ContactRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={phone} />
            <ContactRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={location} />
            {linkedin && (
              <ContactRow
                icon={<Link className="h-3.5 w-3.5" />}
                label="LinkedIn"
                value="Profile link"
                href={linkedinHref}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─── Contact row ────────────────────────── */
function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 min-w-0">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-accent-theme">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] text-muted-theme font-mono uppercase tracking-wider block">{label}</span>
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="text-[13px] font-mono font-medium text-accent-theme hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-[13px] font-mono font-medium text-primary-theme truncate block">{value}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Insight panel ──────────────────────── */
function InsightPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber";
}) {
  const styles =
    tone === "green"
      ? {
          border: "border-main-theme bg-panel-theme/10",
          titleColor: "text-primary-theme border-b border-main-theme pb-2 mb-3",
          bullet: "bg-stone-600",
        }
      : {
          border: "border-accent-theme/20 bg-accent-theme/5",
          titleColor: "text-accent-theme border-b border-accent-theme/10 pb-2 mb-3",
          bullet: "bg-accent-theme",
        };

  return (
    <div className={`rounded border p-4 sm:p-5 ${styles.border}`}>
      <div className={`text-[11px] font-bold uppercase tracking-wider font-mono ${styles.titleColor}`}>
        {title}
      </div>
      <ul className="space-y-3">
        {items.length > 0 ? (
          items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-secondary-theme">
              <span className={`mt-2 h-1 w-1 shrink-0 ${styles.bullet}`} />
              <span className="flex-1">{item}</span>
            </li>
          ))
        ) : (
          <p className="text-[13px] text-muted-theme font-mono">None identified</p>
        )}
      </ul>
    </div>
  );
}

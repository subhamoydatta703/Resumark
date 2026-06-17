import React, { useState, type ReactNode } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "../types";

interface AnalysisDashboardProps {
  analysisResult: AnalysisResult;
  onReset: () => void;
  fileName: string | null;
}

const ScoreCard: React.FC<{ score: number; label: string; tone: "indigo" | "sky" | "emerald" }> = ({
  score,
  label,
  tone,
}) => {
  const toneMap = {
    indigo: "from-indigo-600 to-violet-500",
    sky: "from-sky-600 to-cyan-400",
    emerald: "from-emerald-600 to-teal-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{score}</span>
        <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">/ 100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${toneMap[tone]}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysisResult,
  onReset,
  fileName,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "experience" | "insights">("overview");

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

  const candidateInfo = analysisResult?.candidateInfo;
  const name = candidateInfo?.name || "Candidate Profile";
  const email = candidateInfo?.email || "Not Found";
  const phone = candidateInfo?.phone || "Not Found";
  const location = candidateInfo?.location || "Not Found";
  const linkedin = candidateInfo?.linkedin || "";
  const linkedinUrl = linkedin
    ? linkedin.startsWith("http")
      ? linkedin
      : `https://${linkedin}`
    : "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-scale-up">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Analysis result
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {name}
              </h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Parsed from <span className="font-semibold text-slate-950 dark:text-white">{fileName || "Resume"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            New analysis
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <ScoreCard score={overallScore} label="Overall score" tone="indigo" />
            <ScoreCard score={atsCompatibility} label="ATS score" tone="sky" />
            <ScoreCard score={formattingScore} label="Formatting score" tone="emerald" />
          </div>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
              Candidate details
            </h3>

            <div className="mt-5 space-y-4">
              <DetailRow icon={<User className="h-4 w-4" />} label="Name" value={name} />
              <DetailRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={email}
                link={email !== "Not Found" ? `mailto:${email}` : undefined}
              />
              <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={phone} />
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Location" value={location} />
              {linkedin && (
                <DetailRow
                  icon={<Link className="h-4 w-4" />}
                  label="LinkedIn"
                  value={linkedin}
                  link={linkedinUrl}
                />
              )}
            </div>
          </section>
        </aside>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-slate-200/80 px-4 pt-4 dark:border-white/10 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                Overview
              </TabButton>
              <TabButton active={activeTab === "skills"} onClick={() => setActiveTab("skills")}>
                Skills
              </TabButton>
              <TabButton active={activeTab === "experience"} onClick={() => setActiveTab("experience")}>
                Experience
              </TabButton>
              <TabButton active={activeTab === "insights"} onClick={() => setActiveTab("insights")}>
                AI insights
              </TabButton>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {activeTab === "overview" && (
              <div className="space-y-6 animate-scale-up">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Summary</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {summary || "No summary details were parsed."}
                  </p>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Suggested roles
                    </h4>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestedRoles.length > 0 ? (
                        suggestedRoles.map((role) => (
                          <span
                            key={role}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">None suggested</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Education
                    </h4>
                    <div className="mt-4 space-y-4">
                      {education.length > 0 ? (
                        education.map((edu, idx) => (
                          <div key={idx} className="space-y-1">
                            <p className="font-semibold text-slate-950 dark:text-white">
                              {edu.degree || "Degree Studies"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {edu.school || "University"} - {edu.year || "N/A"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">None extracted</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6 animate-scale-up">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Extracted skills</h3>
                </div>

                <div className="space-y-5">
                  {skills.length > 0 ? (
                    skills.map((skillCat) => (
                      <section key={skillCat.category || "General"} className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          {skillCat.category || "Skills"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(skillCat.items) && skillCat.items.length > 0 ? (
                            skillCat.items.map((skill: string) => (
                              <span
                                key={skill}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">None parsed</p>
                          )}
                        </div>
                      </section>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No skills mapped.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6 animate-scale-up">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Experience</h3>
                </div>

                <div className="space-y-6 border-l border-dashed border-slate-200 pl-5 dark:border-white/10 sm:pl-6">
                  {experience.length > 0 ? (
                    experience.map((exp, idx) => (
                      <article key={idx} className="relative">
                        <span className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border border-indigo-300 bg-white dark:border-indigo-400 dark:bg-slate-950" />
                        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <h4 className="text-base font-semibold text-slate-950 dark:text-white">
                              {exp.role || "Role"}
                            </h4>
                            <span className="inline-flex self-start rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                              {exp.duration || "N/A"}
                            </span>
                          </div>

                          <p className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Briefcase className="h-4 w-4" />
                            {exp.company || "Company"}
                          </p>

                          <ul className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {Array.isArray(exp.description) ? (
                              exp.description.map((desc: string, dIdx: number) => (
                                <li key={dIdx} className="flex items-start gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-500" />
                                  <span>{desc}</span>
                                </li>
                              ))
                            ) : (
                              <li className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-500" />
                                <span>{exp.description || ""}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No experience parsed.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-6 animate-scale-up">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">AI feedback</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InsightCard
                    title="Strengths"
                    tone="emerald"
                    icon={<CheckCircle className="h-4 w-4" />}
                    items={strengths}
                  />
                  <InsightCard
                    title="Improvements"
                    tone="amber"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    items={improvements}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
          : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function DetailRow({
  icon,
  label,
  value,
  link,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {link ? (
          <a
            href={link}
            target={link.startsWith("http") ? "_blank" : undefined}
            rel={link.startsWith("http") ? "noreferrer" : undefined}
            className="mt-1 block break-words text-sm font-medium text-slate-950 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
          >
            {value}
          </a>
        ) : (
          <p className="mt-1 break-words text-sm font-medium text-slate-950 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  tone,
  icon,
  items,
}: {
  title: string;
  tone: "emerald" | "amber";
  icon: ReactNode;
  items: string[];
}) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10"
      : "border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10";
  const textTone = tone === "emerald" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300";

  return (
    <section className={`rounded-2xl border p-5 ${toneClasses}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${textTone}`}>
        {icon}
        {title}
      </div>
      <ul className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">None listed</p>
        )}
      </ul>
    </section>
  );
}

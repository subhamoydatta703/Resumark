import React, { useState } from "react";
import { 
  User, Mail, Phone, MapPin, Link, Briefcase, GraduationCap, 
  TrendingUp, CheckCircle, AlertTriangle, Lightbulb, RefreshCw 
} from "lucide-react";
import type { AnalysisResult } from "../types";

interface AnalysisDashboardProps {
  analysisResult: AnalysisResult;
  onReset: () => void;
  fileName: string | null;
}

const RadialScore: React.FC<{ score: number; label: string; color: string; glow: string }> = ({ 
  score, 
  label, 
  color, 
  glow 
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-lg">
      <div className="relative w-24 h-24">
        {/* Track circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-950"
            strokeWidth="7"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="transition-all duration-1000 ease-out"
            stroke={color}
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-white tracking-tight">{score}</span>
        </div>
      </div>
      <span className="mt-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">{label}</span>
    </div>
  );
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysisResult,
  onReset,
  fileName,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "experience" | "insights">("overview");

  // Temporary logging to inspect incoming analysisResult
  console.log("AnalysisDashboard mounting. Raw analysisResult:", analysisResult);

  const {
    overallScore = 0,
    atsCompatibility = 0,
    formattingScore = 0,
    candidateInfo = {} as any,
    summary = "",
    skills = [],
    experience = [],
    education = [],
    strengths = [],
    improvements = [],
    suggestedRoles = [],
  } = analysisResult || {};

  const name = candidateInfo?.name || "Candidate Profile";
  const email = candidateInfo?.email || "Not Found";
  const phone = candidateInfo?.phone || "Not Found";
  const location = candidateInfo?.location || "Not Found";
  const linkedin = candidateInfo?.linkedin || "";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-scale-up">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
        <div>
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Analysis Finished</span>
          <h2 className="text-3xl font-extrabold text-white mt-1 leading-tight">{name}</h2>
          <p className="text-sm text-slate-400 mt-1">Parsed from: <span className="text-slate-200 font-semibold">{fileName || "Resume"}</span></p>
        </div>
        <button
          onClick={onReset}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Analyze New
        </button>
      </div>

      {/* Grid Layout: Profile Sidebar & Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Brief Summary & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Radial Scores */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            <RadialScore score={overallScore} label="Overall Score" color="#8b5cf6" glow="rgba(139,92,246,0.3)" />
            <RadialScore score={atsCompatibility} label="ATS Score" color="#06b6d4" glow="rgba(6,182,212,0.3)" />
            <RadialScore score={formattingScore} label="Formatting" color="#10b981" glow="rgba(16,185,129,0.3)" />
          </div>

          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Candidate Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <User className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="truncate">{name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                {email && email !== "Not Found" ? (
                  <a href={`mailto:${email}`} className="truncate hover:text-violet-400 transition-colors">
                    {email}
                  </a>
                ) : (
                  <span className="text-slate-500">Not Found</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                <span>{location}</span>
              </div>
              {linkedin && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Link className="w-4 h-4 text-violet-400 shrink-0" />
                  <a href={`https://${linkedin}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-violet-400 transition-colors">
                    {linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content Areas */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/20 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                activeTab === "overview"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                activeTab === "skills"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Skills Matrix
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                activeTab === "experience"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                activeTab === "insights"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Insights
            </button>
          </div>

          {/* Tab content panels */}
          <div className="flex-1 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md min-h-[400px]">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-scale-up">
                <div>
                  <h3 className="text-lg font-bold text-white">Professional Summary</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-900/60">
                    {summary || "No summary details were parsed."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                      Suggested Roles
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {suggestedRoles.length > 0 ? (
                        suggestedRoles.map((role) => (
                          <span key={role} className="text-xs font-medium px-2.5 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None suggested</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-2xl">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      Education Highlight
                    </h4>
                    <div className="mt-3 space-y-3">
                      {education.length > 0 ? (
                        education.map((edu, idx) => (
                          <div key={idx} className="text-xs text-slate-300">
                            <p className="font-semibold text-white">{edu.degree || "Degree Studies"}</p>
                            <p className="text-slate-400">{edu.school || "University"} • {edu.year || "N/A"}</p>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None extracted</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-lg font-bold text-white">Extracted Skills Matrix</h3>
                <div className="space-y-4">
                  {skills.length > 0 ? (
                    skills.map((skillCat) => (
                      <div key={skillCat.category || "General"} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{skillCat.category || "Skills"}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(skillCat.items) && skillCat.items.length > 0 ? (
                            skillCat.items.map((skill: string) => (
                              <span 
                                key={skill} 
                                className="text-xs font-semibold px-3 py-1.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-colors hover:text-white"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None parsed</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No skills mapped.</p>
                  )}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <div className="space-y-6 animate-scale-up">
                <h3 className="text-lg font-bold text-white">Work History</h3>
                
                <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-8">
                  {experience.length > 0 ? (
                    experience.map((exp, idx) => (
                      <div key={idx} className="relative group">
                        {/* Timeline dot */}
                        <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 group-hover:bg-violet-500 border border-slate-900 transition-colors duration-300"></div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-white">{exp.role || "Role"}</h4>
                            <span className="text-xs text-slate-500 font-medium md:bg-slate-950/60 md:px-2 md:py-0.5 rounded-md md:border md:border-slate-900">{exp.duration || "N/A"}</span>
                          </div>
                          <p className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {exp.company || "Company"}
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 mt-2 pl-1.5">
                            {Array.isArray(exp.description) ? (
                              exp.description.map((desc: string, dIdx: number) => (
                                <li key={dIdx} className="leading-relaxed pl-1 marker:text-slate-600">
                                  <span className="relative -left-1.5">{desc}</span>
                                </li>
                              ))
                            ) : (
                              <li className="leading-relaxed pl-1 marker:text-slate-600">
                                <span className="relative -left-1.5">{exp.description || ""}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No work history provided.</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === "insights" && (
              <div className="space-y-6 animate-scale-up">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    AI Resume Optimization
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Automatic feedback and analysis of your professional documentation</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths */}
                  <div className="space-y-3 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {strengths.length > 0 ? (
                        strengths.map((str, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0"></span>
                            <span>{str}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">None listed</p>
                      )}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-3 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {improvements.length > 0 ? (
                        improvements.map((imp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0"></span>
                            <span>{imp}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">None listed</p>
                      )}
                    </ul>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

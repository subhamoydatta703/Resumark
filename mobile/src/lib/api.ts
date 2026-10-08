export interface CandidateInfo { name?: string; email?: string; phone?: string; location?: string; linkedin?: string; }
export interface SkillCategory { category: string; items: string[]; }
export interface WorkExperience { role?: string; company?: string; duration?: string; description?: string[]; }
export interface EducationInfo { degree?: string; school?: string; year?: string; }
export interface AnalysisResult {
  overallScore: number; atsCompatibility: number; formattingScore: number; candidateInfo: CandidateInfo;
  summary: string; skills: SkillCategory[]; experience: WorkExperience[]; education: EducationInfo[]; strengths: string[]; improvements: string[]; suggestedRoles: string[];
}
export type ResumeStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export interface ResumeDetails { id: string; status: ResumeStatus; analysisResult?: AnalysisResult; }
export type GetToken = () => Promise<string | null>;

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
if (!apiUrl) throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to mobile/.env.');

async function request(path: string, getToken: GetToken, init: RequestInit = {}) {
  const token = await getToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
  const text = await response.text();
  let payload: unknown = null;
  if (text) { try { payload = JSON.parse(text); } catch { payload = text; } }
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload ? String(payload.message) : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return payload;
}

function normalizeAnalysis(value: unknown): AnalysisResult {
  const parsed = typeof value === 'string' ? JSON.parse(value) as unknown : value;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Analysis result is invalid.');
  const source = parsed as Partial<AnalysisResult> & { atsScore?: number; skills?: unknown };
  return {
    overallScore: source.overallScore ?? 0, atsCompatibility: source.atsCompatibility ?? source.atsScore ?? 0,
    formattingScore: source.formattingScore ?? 0, candidateInfo: source.candidateInfo ?? {}, summary: source.summary ?? '',
    skills: normalizeSkills(source.skills), experience: normalizeExperience((source as { experience?: unknown }).experience), education: normalizeEducation((source as { education?: unknown }).education), strengths: Array.isArray(source.strengths) ? source.strengths.filter((item): item is string => typeof item === 'string') : [],
    improvements: Array.isArray(source.improvements) ? source.improvements : [], suggestedRoles: Array.isArray(source.suggestedRoles) ? source.suggestedRoles : [],
  };
}

function normalizeExperience(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => { if (typeof item !== 'object' || item === null) return []; const row = item as { role?: unknown; company?: unknown; duration?: unknown; description?: unknown }; return [{ role: typeof row.role === 'string' ? row.role : undefined, company: typeof row.company === 'string' ? row.company : undefined, duration: typeof row.duration === 'string' ? row.duration : undefined, description: Array.isArray(row.description) ? row.description.filter((line): line is string => typeof line === 'string') : typeof row.description === 'string' ? [row.description] : [] }]; });
}
function normalizeEducation(value: unknown): EducationInfo[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => { if (typeof item !== 'object' || item === null) return []; const row = item as { degree?: unknown; school?: unknown; year?: unknown }; return [{ degree: typeof row.degree === 'string' ? row.degree : undefined, school: typeof row.school === 'string' ? row.school : undefined, year: typeof row.year === 'string' ? row.year : undefined }]; });
}

function normalizeSkills(value: unknown): SkillCategory[] {
  if (!Array.isArray(value)) return [];
  if (value.every((item) => typeof item === 'string')) {
    return value.length ? [{ category: 'Key skills', items: value }] : [];
  }
  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];
    const group = item as { category?: unknown; items?: unknown };
    if (typeof group.category !== 'string' || !Array.isArray(group.items)) return [];
    return [{ category: group.category, items: group.items.filter((skill): skill is string => typeof skill === 'string') }];
  });
}

export async function uploadResume(file: { uri: string; name: string; mimeType: string }, getToken: GetToken) {
  const token = await getToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');

  const response = await FileSystem.uploadAsync(`${apiUrl}/api/resume/upload`, file.uri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'resume',
    mimeType: file.mimeType,
    headers: { Authorization: `Bearer ${token}` },
  });
  let payload: {
    message?: string;
    fileData?: { id?: string; status?: ResumeStatus; resume?: { id?: string; status?: ResumeStatus } };
  } = {};
  if (response.body) {
    try { payload = JSON.parse(response.body) as typeof payload; } catch { /* The status check below supplies a useful error. */ }
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error(payload.message ?? `Upload failed with status ${response.status}.`);
  }
  const resumeId = payload.fileData?.resume?.id ?? payload.fileData?.id;
  if (!resumeId) throw new Error('The upload response did not include a resume ID.');
  return { resumeId, status: payload.fileData?.resume?.status ?? payload.fileData?.status ?? 'PENDING' };
}

export async function startAnalysis(resumeId: string, getToken: GetToken) {
  await request(`/api/analyze/${resumeId}`, getToken, { method: 'POST' });
}

export async function getResumeDetails(resumeId: string, getToken: GetToken): Promise<ResumeDetails> {
  const payload = await request(`/api/analyze/${resumeId}`, getToken) as { resumeRes?: { status?: ResumeStatus; analysisResult?: unknown } };
  const resume = payload.resumeRes;
  const status = resume?.status ?? 'PENDING';
  return { id: resumeId, status, analysisResult: status === 'COMPLETED' && resume?.analysisResult ? normalizeAnalysis(resume.analysisResult) : undefined };
}
import * as FileSystem from 'expo-file-system/legacy';

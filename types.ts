
export enum AppStep {
  API_KEY = 'API_KEY',
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  VERIFICATION = 'VERIFICATION',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
}

export interface ResumeData {
  fullName: string;
  contact: string;
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
  }[];
  coverLetter?: string;
}

export interface GapAnalysisResult {
  currentScore: number;
  missingKeywords: {
    term: string;
    importance: 'Critical' | 'Important' | 'Nice-to-have';
    reason: string;
  }[];
  critique: string;
}

export interface OptimizationRequest {
  currentResume: string;
  resumeFile?: {
    data: string;
    mimeType: string;
  } | null;
  jobDescription: string;
  mode: 'concise' | 'detailed';
}

export type ResumeTheme = 'classic' | 'modern' | 'minimal';

export interface GenerationRequest extends OptimizationRequest {
  confirmedSkills: string[];
  additionalContext?: string;
  enableHumanize?: boolean;
  includeCoverLetter?: boolean;
  theme?: ResumeTheme;
}

export interface AnalysisResult extends GapAnalysisResult {
  optimizedResume: ResumeData;
  scoreBreakdown: {
    keywords: number;
    impact: number;
    formatting: number;
    relevance: number;
  };
  theme?: ResumeTheme;
}

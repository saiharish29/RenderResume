import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GapAnalysisResult, OptimizationRequest, GenerationRequest, ResumeData } from "../types";

// ─── Centralized Config ─────────────────────────────────────────────────────
const DEFAULT_MODEL = "gemini-2.5-flash";

let _runtimeApiKey = '';

export const configureApiKey = (key: string) => {
  _runtimeApiKey = key.trim();
};

const getConfig = () => {
  if (!_runtimeApiKey) {
    throw new Error("No API key configured. Please enter your Gemini API key.");
  }
  return { apiKey: _runtimeApiKey, model: DEFAULT_MODEL };
};

// ─── Schemas ────────────────────────────────────────────────────────────────

const gapAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    currentScore: { type: Type.INTEGER, description: "Current estimated ATS match score (0-100)" },
    missingKeywords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          importance: { type: Type.STRING, enum: ["Critical", "Important", "Nice-to-have"] },
          reason: { type: Type.STRING, description: "Why this keyword matters for this JD" },
        },
        required: ["term", "importance", "reason"],
      },
    },
    critique: { type: Type.STRING, description: "Brief analysis of the gap between resume and JD" },
  },
  required: ["currentScore", "missingKeywords", "critique"],
};

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    optimizedResume: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        contact: { type: Type.STRING },
        summary: { type: Type.STRING },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["category", "items"],
          },
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              location: { type: Type.STRING },
              date: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["company", "role", "bullets", "date"],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              school: { type: Type.STRING },
              year: { type: Type.STRING },
            },
            required: ["degree", "school"],
          },
        },
        certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["name", "description"],
          },
        },
        coverLetter: { type: Type.STRING, description: "A tailored cover letter if requested, otherwise empty string." }
      },
      required: ["fullName", "summary", "skills", "experience", "education"],
    },
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        keywords: { type: Type.INTEGER },
        impact: { type: Type.INTEGER },
        formatting: { type: Type.INTEGER },
        relevance: { type: Type.INTEGER },
      },
      required: ["keywords", "impact", "formatting", "relevance"]
    }
  },
  required: ["optimizedResume", "scoreBreakdown"],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const getBaseParts = (request: OptimizationRequest) => {
  const parts: any[] = [];
  parts.push({ text: `JOB DESCRIPTION:\n${request.jobDescription}` });
  if (request.resumeFile && request.resumeFile.mimeType === 'application/pdf') {
    parts.push({
      inlineData: {
        mimeType: request.resumeFile.mimeType,
        data: request.resumeFile.data
      }
    });
    parts.push({ text: "Resume is attached above as a PDF file." });
  } else {
    parts.push({ text: `RESUME CONTENT:\n${request.currentResume}` });
  }
  return parts;
};

const cleanAndParseJSON = (text: string | undefined) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) { /* continue */ }

  let cleaned = text.replace(/```json\n?|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) { /* continue */ }

  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    const jsonCandidate = text.substring(firstOpen, lastClose + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (e) {
      console.error("JSON Parse Failed on substring extraction:", jsonCandidate.substring(0, 100) + "...");
    }
  }

  console.error("Final JSON Parse Failure. Raw text length:", text.length);
  return null;
};

const retryOperation = async <T>(operation: () => Promise<T>, retries = 2): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (e) {
      console.warn(`Attempt ${i + 1} failed:`, e);
      if (i === retries - 1) throw e;
    }
  }
  throw new Error("All retries failed");
};

const sanitizeResumeData = (data: any): ResumeData => {
  return {
    fullName: data?.fullName || "Candidate Name",
    contact: data?.contact || "",
    summary: data?.summary || "",
    skills: Array.isArray(data?.skills) ? data.skills.map((s: any) => ({
      category: s?.category || "General",
      items: Array.isArray(s?.items) ? s.items : (typeof s?.items === 'string' ? [s.items] : [])
    })) : [],
    experience: Array.isArray(data?.experience) ? data.experience.map((e: any) => ({
      company: e?.company || "Company",
      role: e?.role || "Role",
      location: e?.location || "",
      date: e?.date || "",
      bullets: Array.isArray(e?.bullets) ? e.bullets : (typeof e?.bullets === 'string' ? [e.bullets] : [])
    })) : [],
    education: Array.isArray(data?.education) ? data.education : [],
    certifications: Array.isArray(data?.certifications) ? data.certifications : [],
    projects: Array.isArray(data?.projects) ? data.projects : [],
    coverLetter: data?.coverLetter || ""
  };
};

// ─── STEP 1: Analyze Gaps ───────────────────────────────────────────────────

export const analyzeResumeGap = async (request: OptimizationRequest): Promise<GapAnalysisResult> => {
  const { apiKey, model } = getConfig();

  const systemInstruction = `
    You are an expert Resume Auditor.
    Compare the candidate's resume against the Job Description.
    Do NOT rewrite the resume yet.
    
    1. Identify Critical and Important keywords/skills from the JD that are missing or weak in the resume.
    2. Estimate a current ATS Match Score (0-100).
    3. Provide a brief critique.

    OUTPUT FORMAT: Return ONLY valid JSON matching the schema. No markdown, no conversation.
  `;

  const parts = getBaseParts(request);

  return retryOperation(async () => {
    const ai = new GoogleGenAI({ apiKey });
    console.log(`[ATS] Gap analysis using model: ${model}`);
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: gapAnalysisSchema as any,
        temperature: 0.1,
      },
    });

    console.log("Gap Analysis raw response:", response.text?.substring(0, 200));
    const parsed = cleanAndParseJSON(response.text);
    if (!parsed || !parsed.missingKeywords) throw new Error("Invalid Gap Analysis JSON");
    return parsed as GapAnalysisResult;
  });
};

// ─── STEP 2: Generate Final Resume ──────────────────────────────────────────

export const generateFinalResume = async (request: GenerationRequest, initialGapResult: GapAnalysisResult): Promise<AnalysisResult> => {
  const { apiKey, model } = getConfig();

  const humanizeInstruction = request.enableHumanize ? `
    HUMANIZATION PROTOCOL (Anti-AI Detection):
    - Write in a highly natural, human tone.
    - Vary sentence structure and length significantly (mix short punchy sentences with complex ones).
    - Avoid predictable patterns, repetitive openers, or overused "AI-sounding" buzzwords (like "Spearheaded", "Orchestrated", "Leveraged") if simpler words work better.
    - Focus on specific, concrete details and unique metrics rather than generic fluff.
    - Mimic the nuance of a professional human writer who is slightly informal but polished.
  ` : "";

  const lengthInstruction = request.mode === 'concise'
    ? `LENGTH RULE: EXTREMELY STRICT ONE-PAGE LIMIT.
       - The output MUST fit on a single A4 page.
       - Summary: MAX 50 words (2 sentences).
       - Experience: Include ONLY the 3 most recent and relevant roles. Omit anything older than 10 years.
       - Bullets: STRICTLY MAX 3 bullets per role. Each bullet must be concise (max 20 words).
       - Skills: Group into tight categories.
       - Education: One line per degree.
       - Projects: Include ONLY if absolutely necessary to match JD, otherwise omit.`
    : `LENGTH RULE: DETAILED (2-3 Pages). Elaborate on projects and experiences. Provide rich context for every bullet point. You can include more bullets per role.`;

  const coverLetterInstruction = request.includeCoverLetter
    ? `ALSO GENERATE A COVER LETTER. It should be professional, enthusiastic, and link the candidate's top achievements directly to the company's needs found in the JD.`
    : `DO NOT generate a cover letter. Leave that field empty.`;

  const systemInstruction = `
    You are a professional Resume Writer. 
    Rewrite the user's resume to strictly match the provided JD.
    
    CRITICAL RULES:
    1. Use the User's original experience as the base.
    2. Incorporate the "Confirmed Skills" provided by the user naturally into the Summary, Skills, or Experience sections.
    3. DO NOT hallucinate. Only add skills the user has confirmed.
    4. Use Action Verbs and Metrics.
    5. Output structure must be single-column text friendly.
    6. ALWAYS return valid JSON matching the schema.
    
    ${lengthInstruction}
    ${humanizeInstruction}
    ${coverLetterInstruction}

    FINAL CHECK:
    - Ensure all JSON fields are present.
    - Experience bullets must be an array of strings.
    - Skills must be categorized.
    - Return ONLY pure JSON.
  `;

  const parts = getBaseParts(request);
  parts.push({
    text: `
      USER CONFIRMATION:
      The user has confirmed they possess the following missing skills/keywords: ${request.confirmedSkills.join(', ')}.
      
      Additional User Context (incorporate this truthfully): 
      ${request.additionalContext || "None provided."}
      
      Please rewrite the resume now.
    `
  });

  return retryOperation(async () => {
    const ai = new GoogleGenAI({ apiKey });
    console.log(`[ATS] Resume generation using model: ${model}`);
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: resumeSchema as any,
        temperature: request.enableHumanize ? 0.6 : 0.3,
      },
    });

    console.log("Resume generation raw response:", response.text?.substring(0, 200));
    const generated = cleanAndParseJSON(response.text);

    if (!generated || !generated.optimizedResume) {
      throw new Error("Failed to generate valid resume structure");
    }

    const sanitizedResume = sanitizeResumeData(generated.optimizedResume);

    return {
      ...initialGapResult,
      optimizedResume: sanitizedResume,
      scoreBreakdown: generated.scoreBreakdown || { keywords: 85, impact: 85, formatting: 100, relevance: 85 },
      currentScore: generated.scoreBreakdown?.keywords || 85,
      theme: request.theme
    } as AnalysisResult;
  });
};

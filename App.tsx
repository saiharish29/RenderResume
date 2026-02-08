import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResumePreview } from './components/ResumePreview';
import { ScoreChart } from './components/ScoreChart';
import { VerificationSection } from './components/VerificationSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SettingsControls } from './components/SettingsControls';
import { analyzeResumeGap, generateFinalResume } from './services/geminiService';
import { AppStep, AnalysisResult, GapAnalysisResult, ResumeTheme } from './types';
import { Loader2, AlertTriangle, Download, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [jdText, setJdText] = useState('');
  
  const [mode, setMode] = useState<'concise' | 'detailed'>('concise');
  const [theme, setTheme] = useState<ResumeTheme>('classic');
  const [enableHumanize, setEnableHumanize] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [context, setContext] = useState('');
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);
  
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialAnalysis = async () => {
    setLoading(true);
    setStep(AppStep.ANALYZING);
    setError(null);
    try {
      const analysis = await analyzeResumeGap({
        currentResume: resumeText,
        resumeFile: resumeFile,
        jobDescription: jdText,
        mode: mode,
      });
      setGapAnalysis(analysis);
      setStep(AppStep.VERIFICATION);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to analyze resume: ${message}`);
      setStep(AppStep.INPUT);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneration = async (skills: string[]) => {
    if (!gapAnalysis) return;
    setConfirmedSkills(skills);
    setLoading(true);
    setStep(AppStep.GENERATING);
    try {
      const finalResult = await generateFinalResume({
        currentResume: resumeText,
        resumeFile: resumeFile,
        jobDescription: jdText,
        mode,
        confirmedSkills: skills,
        additionalContext: context,
        enableHumanize,
        includeCoverLetter,
        theme
      }, gapAnalysis);
      setResult(finalResult);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error("Generation Error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to generate the final resume: ${message}`);
      setStep(AppStep.VERIFICATION);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!gapAnalysis) return;
    setLoading(true);
    setStep(AppStep.GENERATING);
    try {
      const finalResult = await generateFinalResume({
        currentResume: resumeText,
        resumeFile: resumeFile,
        jobDescription: jdText,
        mode,
        confirmedSkills,
        additionalContext: context,
        enableHumanize,
        includeCoverLetter,
        theme
      }, gapAnalysis);
      setResult(finalResult);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error("Regeneration Error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to regenerate: ${message}`);
      setStep(AppStep.RESULT);
    } finally {
      setLoading(false);
    }
  };

  const isAnalyzable = jdText.length > 20 && (resumeText.length > 20 || resumeFile !== null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="no-print bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">ATS<span className="text-blue-600">Optimizer</span></span>
          </div>
          {step === AppStep.RESULT && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStep(AppStep.INPUT)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                New Analysis
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        
        {step === AppStep.INPUT && (
          <>
             {error && (
              <div className="max-w-5xl mx-auto mt-6 px-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            <InputSection 
              resumeText={resumeText} 
              setResumeText={setResumeText} 
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              jdText={jdText} 
              setJdText={setJdText} 
              onAnalyze={handleInitialAnalysis}
              isAnalyzable={isAnalyzable}
            />
          </>
        )}

        {(step === AppStep.ANALYZING || step === AppStep.GENERATING) && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-blue-600 animate-pulse" size={32} />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-slate-800">
                {step === AppStep.ANALYZING ? "Analyzing Resume Gaps..." : "Tailoring Your Resume..."}
            </h2>
            <p className="text-slate-500 mt-2 animate-pulse">
                {step === AppStep.ANALYZING 
                    ? "Identifying missing keywords and comparing against job description" 
                    : "Applying requested length, theme, and writing style..."
                }
            </p>
          </div>
        )}

        {step === AppStep.VERIFICATION && gapAnalysis && (
             <>
             {error && (
                <div className="max-w-4xl mx-auto mt-6 px-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
            <VerificationSection 
                analysis={gapAnalysis} 
                onConfirm={handleGeneration}
                isGenerating={loading}
                mode={mode} setMode={setMode}
                theme={theme} setTheme={setTheme}
                enableHumanize={enableHumanize} setEnableHumanize={setEnableHumanize}
                includeCoverLetter={includeCoverLetter} setIncludeCoverLetter={setIncludeCoverLetter}
                additionalContext={context} setAdditionalContext={setContext}
            />
            </>
        )}

        {step === AppStep.RESULT && result && (
          <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <aside className="no-print lg:col-span-3 space-y-6 h-fit lg:sticky lg:top-24">
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-500"/>
                  Optimized ATS Score
                </h3>
                <ScoreChart score={result.scoreBreakdown.keywords} />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                   <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-slate-500 uppercase font-semibold">Keywords</div>
                      <div className="text-lg font-bold text-slate-800">{result.scoreBreakdown.keywords}/100</div>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-slate-500 uppercase font-semibold">Impact</div>
                      <div className="text-lg font-bold text-slate-800">{result.scoreBreakdown.impact}/100</div>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Configuration</h3>
                <SettingsControls 
                    mode={mode} setMode={setMode}
                    theme={theme} setTheme={setTheme}
                    enableHumanize={enableHumanize} setEnableHumanize={setEnableHumanize}
                    includeCoverLetter={includeCoverLetter} setIncludeCoverLetter={setIncludeCoverLetter}
                />
                <button 
                    onClick={handleRegenerate}
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={16} /> Update Resume
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Updating Mode or Options requires regeneration. Theme updates instantly.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2">Optimization Summary</h3>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {result.critique}
                </p>
              </div>

            </aside>

            <div className="lg:col-span-9 flex justify-center">
               <div className="print-w-full w-full">
                  <ErrorBoundary>
                    <ResumePreview data={result.optimizedResume} theme={theme} mode={mode} />
                  </ErrorBoundary>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

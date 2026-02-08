import React, { useState } from 'react';
import { GapAnalysisResult, ResumeTheme } from '../types';
import { AlertTriangle, CheckSquare, Square, ArrowRight, ShieldCheck, Settings } from 'lucide-react';
import { SettingsControls } from './SettingsControls';

interface VerificationSectionProps {
  analysis: GapAnalysisResult;
  onConfirm: (confirmedSkills: string[]) => void;
  isGenerating: boolean;
  mode: 'concise' | 'detailed';
  setMode: (m: 'concise' | 'detailed') => void;
  theme: ResumeTheme;
  setTheme: (t: ResumeTheme) => void;
  enableHumanize: boolean;
  setEnableHumanize: (b: boolean) => void;
  includeCoverLetter: boolean;
  setIncludeCoverLetter: (b: boolean) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({ 
    analysis, 
    onConfirm, 
    isGenerating,
    mode, setMode,
    theme, setTheme,
    enableHumanize, setEnableHumanize,
    includeCoverLetter, setIncludeCoverLetter,
    additionalContext, setAdditionalContext
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (term: string) => {
    setSelectedSkills(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term) 
        : [...prev, term]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-bold">Verification & Settings</h2>
          </div>
          <p className="text-slate-300">
            Confirm your skills and customize how your resume looks and reads.
          </p>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className={`text-3xl font-bold ${analysis.currentScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {analysis.currentScore}/100
            </div>
            <div>
              <div className="font-semibold text-slate-800">Current Match Score</div>
              <div className="text-sm text-slate-500">Before optimization. Select skills below to improve this.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                Identified Missing Keywords
                </h3>
                
                {analysis.missingKeywords.length === 0 ? (
                    <p className="text-slate-500 italic">No major keywords found missing. You can proceed directly.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                    {analysis.missingKeywords.map((item, idx) => (
                        <div 
                        key={idx}
                        onClick={() => toggleSkill(item.term)}
                        className={`
                            cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 relative
                            ${selectedSkills.includes(item.term) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                        `}
                        >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold ${selectedSkills.includes(item.term) ? 'text-blue-700' : 'text-slate-700'}`}>
                            {item.term}
                            </span>
                            {selectedSkills.includes(item.term) 
                            ? <CheckSquare className="text-blue-600" size={20} /> 
                            : <Square className="text-slate-300" size={20} />
                            }
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: item.importance === 'Critical' ? '#ef4444' : '#f59e0b' }}>
                            {item.importance}
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{item.reason}</p>
                        </div>
                    ))}
                    </div>
                )}
                
                <div className="mt-6 border-t border-slate-100 pt-6">
                    <label className="block font-semibold text-slate-700 mb-2">
                        Additional Context (Optional)
                    </label>
                    <textarea 
                        className="w-full p-4 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                        placeholder="E.g., I have used React for 3 years in my last role but didn't list it explicitly..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
                  <Settings className="text-slate-500" size={20} />
                  Configuration
                </h3>
                <SettingsControls 
                    mode={mode} setMode={setMode}
                    theme={theme} setTheme={setTheme}
                    enableHumanize={enableHumanize} setEnableHumanize={setEnableHumanize}
                    includeCoverLetter={includeCoverLetter} setIncludeCoverLetter={setIncludeCoverLetter}
                    disabled={isGenerating}
                />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => onConfirm(selectedSkills)}
            disabled={isGenerating}
            className={`
              px-8 py-3 rounded-full font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-70
              ${enableHumanize 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
          >
            {isGenerating ? (
                <>Generating...</>
            ) : (
                <>Generate Resume <ArrowRight size={20} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

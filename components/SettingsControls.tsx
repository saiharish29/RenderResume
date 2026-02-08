import React from 'react';
import { ResumeTheme } from '../types';
import { Layout, Palette, Sparkles, FileText, CheckSquare, Square } from 'lucide-react';

interface SettingsControlsProps {
  mode: 'concise' | 'detailed';
  setMode: (m: 'concise' | 'detailed') => void;
  theme: ResumeTheme;
  setTheme: (t: ResumeTheme) => void;
  enableHumanize: boolean;
  setEnableHumanize: (b: boolean) => void;
  includeCoverLetter: boolean;
  setIncludeCoverLetter: (b: boolean) => void;
  disabled?: boolean;
}

export const SettingsControls: React.FC<SettingsControlsProps> = ({
  mode, setMode,
  theme, setTheme,
  enableHumanize, setEnableHumanize,
  includeCoverLetter, setIncludeCoverLetter,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
       <div className="p-3 border rounded-xl border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-slate-700 mb-2 text-sm">
            <Palette size={16} /> Visual Theme
        </div>
        <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value as ResumeTheme)}
            disabled={disabled}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="classic">Classic Corporate (Serif)</option>
            <option value="modern">Modern Professional (Sans)</option>
            <option value="minimal">Minimalist Tech (Clean)</option>
        </select>
      </div>

      <div className="p-3 border rounded-xl border-slate-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-slate-700 mb-2 text-sm">
            <Layout size={16} /> Resume Length
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setMode('concise')}
                disabled={disabled}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'concise' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                One Page
            </button>
            <button 
                onClick={() => setMode('detailed')}
                disabled={disabled}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'detailed' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Detailed
            </button>
        </div>
      </div>

      <div 
        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer bg-white ${enableHumanize ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setEnableHumanize(!enableHumanize)}
      >
          <div className={`p-1.5 rounded-full ${enableHumanize ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
              <div className="font-bold text-sm text-slate-700">AI Humanizer</div>
              <div className="text-[10px] text-slate-500">Bypass AI Detectors</div>
          </div>
          <div>
            {enableHumanize ? <CheckSquare className="text-purple-600" size={18} /> : <Square className="text-slate-300" size={18} />}
          </div>
      </div>

      <div 
        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer bg-white ${includeCoverLetter ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIncludeCoverLetter(!includeCoverLetter)}
      >
          <div className={`p-1.5 rounded-full ${includeCoverLetter ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            <FileText size={16} />
          </div>
          <div className="flex-1">
              <div className="font-bold text-sm text-slate-700">Cover Letter</div>
              <div className="text-[10px] text-slate-500">Auto-generate</div>
          </div>
          <div>
            {includeCoverLetter ? <CheckSquare className="text-indigo-600" size={18} /> : <Square className="text-slate-300" size={18} />}
          </div>
      </div>
    </div>
  );
};

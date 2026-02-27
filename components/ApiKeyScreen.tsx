import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyScreenProps {
  onApiKeySubmit: (key: string, remember: boolean) => void;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    if (!trimmed.startsWith('AIza')) {
      setError('That doesn\'t look like a valid Gemini API key. Keys usually start with "AIza".');
      return;
    }
    onApiKeySubmit(trimmed, remember);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <KeyRound size={32} className="text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">
          Enter your Gemini API Key
        </h1>
        <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
          Each user brings their own key. Your key is used directly from your browser —
          it is never sent to any server.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(''); }}
                placeholder="AIzaSy..."
                autoFocus
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
              Remember for this browser session
            </span>
          </label>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start Optimizing →
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
          Don&apos;t have a key?{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-0.5 font-medium"
          >
            Get a free key at Google AI Studio <ExternalLink size={11} />
          </a>
        </p>
      </div>
    </div>
  );
};

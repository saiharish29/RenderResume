import React, { useCallback, useState } from 'react';
import { Upload, FileText, Briefcase, X, FileUp, FileType } from 'lucide-react';
import mammoth from 'mammoth';

interface InputSectionProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFile: { name: string; data: string; mimeType: string } | null;
  setResumeFile: (file: { name: string; data: string; mimeType: string } | null) => void;
  jdText: string;
  setJdText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzable: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  resumeText, 
  setResumeText, 
  resumeFile,
  setResumeFile,
  jdText, 
  setJdText, 
  onAnalyze,
  isAnalyzable
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          setResumeFile({
            name: file.name,
            data: base64Data,
            mimeType: file.type
          });
          setResumeText(''); 
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } 
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(result.value);
        setResumeFile({
          name: file.name,
          data: '',
          mimeType: file.type
        });
        setIsProcessing(false);
      }
      else if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        setResumeFile({
            name: file.name,
            data: '',
            mimeType: file.type
        });
        setIsProcessing(false);
      }
      else {
        alert('Unsupported file format. Please use PDF, DOCX, or TXT.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Error reading file:", err);
      alert("Failed to read file.");
      setIsProcessing(false);
    }
  }, [setResumeFile, setResumeText]);

  const removeFile = () => {
    setResumeFile(null);
    setResumeText('');
  };

  const isPdf = resumeFile?.mimeType === 'application/pdf';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Supercharge Your Resume
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your resume (PDF, DOCX, TXT) or paste the text. Our AI will analyze, verify skills with you, and rewrite it to pass ATS filters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Your Resume</h3>
          </div>

          <div className="flex-1 flex flex-col relative">
            {isProcessing ? (
               <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-slate-500">Processing file...</p>
               </div>
            ) : resumeFile ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                   {isPdf ? <FileText size={32} className="text-blue-600" /> : <FileType size={32} className="text-blue-600" />}
                </div>
                <p className="font-bold text-slate-800 text-lg mb-1">{resumeFile.name}</p>
                <p className="text-sm text-slate-500 mb-4">
                  {isPdf ? 'PDF Uploaded (Visual Analysis)' : 'Text Extracted Successfully'}
                </p>
                <button 
                  onClick={removeFile}
                  className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-full text-sm font-semibold shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-2"
                >
                  <X size={14} /> Remove File
                </button>
              </div>
            ) : (
              <>
                 <div className="mb-4">
                  <label 
                    htmlFor="resume-upload" 
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-600">
                        <FileUp size={20} />
                        <span className="font-medium">Upload Resume</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</span>
                    </div>
                    <input 
                      id="resume-upload" 
                      type="file" 
                      accept=".pdf,.docx,.doc,.txt"
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </label>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400">Or paste text</span>
                    </div>
                  </div>
                 </div>
                 <textarea
                    className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-slate-700"
                    placeholder="Paste your full resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100">
             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Job Description</h3>
          </div>
          <textarea
            className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm text-slate-700"
            placeholder="Paste the full job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={!isAnalyzable || isProcessing}
          className={`
            px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 transform
            flex items-center gap-3
            ${isAnalyzable && !isProcessing
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-2xl' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          <Upload size={24} />
          Analyze Resume
        </button>
      </div>
    </div>
  );
};

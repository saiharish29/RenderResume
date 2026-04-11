import React, { useState } from 'react';
import { ResumeData, ResumeTheme } from '../types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Download, AlertCircle, FileText, File } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  theme: ResumeTheme;
  mode: 'concise' | 'detailed';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1, theme, mode }) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');

  const isConcise = mode === 'concise';

  if (!data || Object.keys(data).length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <AlertCircle size={48} className="mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold mb-2">Resume Generation Failed</h3>
              <p className="text-sm text-center max-w-md">
                  The AI returned an empty or invalid structure. Please try clicking "New Analysis" and running it again.
              </p>
          </div>
      );
  }

  const fullName = data.fullName || "Candidate Name";
  const contact = data.contact || "";
  const summary = data.summary || "";
  const skills = Array.isArray(data.skills) ? data.skills.filter(Boolean) : [];
  const experience = Array.isArray(data.experience) ? data.experience.filter(Boolean) : [];
  const education = Array.isArray(data.education) ? data.education.filter(Boolean) : [];
  const certifications = Array.isArray(data.certifications) ? data.certifications.filter(Boolean) : [];
  const projects = Array.isArray(data.projects) ? data.projects.filter(Boolean) : [];
  const coverLetter = data.coverLetter || "";

  const getThemeStyles = () => {
    switch (theme) {
        case 'modern':
            return {
                fontFamily: "'Inter', sans-serif",
                headerColor: '#1e40af',
                accentColor: '#3b82f6',
                headingsUppercase: false,
                lineHeight: isConcise ? '1.2' : '1.5',
                fontSize: isConcise ? '11px' : '14px'
            };
        case 'minimal':
            return {
                fontFamily: "'Courier New', monospace",
                headerColor: '#0f172a',
                accentColor: '#64748b',
                headingsUppercase: true,
                lineHeight: isConcise ? '1.15' : '1.4',
                fontSize: isConcise ? '11px' : '13px'
            };
        case 'classic':
        default:
            return {
                fontFamily: "Arial, Helvetica, sans-serif",
                headerColor: '#111827',
                accentColor: '#374151',
                headingsUppercase: true,
                lineHeight: isConcise ? '1.15' : '1.4',
                fontSize: isConcise ? '11px' : '13px'
            };
    }
  };

  const styles = getThemeStyles();

  const downloadPdf = () => {
    // Clean up any stale html2pdf overlays that block clicks
    document.querySelectorAll('.html2pdf__overlay, .html2pdf__container').forEach(el => el.remove());

    const element = document.getElementById('resume-preview-content');
    if (!element) {
        alert("Could not find resume content to export.");
        return;
    }

    if (!(window as any).html2pdf) {
        window.print();
        return;
    }

    const opt = {
      margin:       isConcise ? 0.3 : 0.5,
      filename:     'Optimized_Resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const },
      pagebreak:    { mode: 'avoid-all' }
    };

    (window as any).html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch((err: any) => {
        console.error('PDF generation failed:', err);
        alert('PDF generation failed. Please try again.');
      })
      .finally(() => {
        // Always clean up overlay elements after generation
        document.querySelectorAll('.html2pdf__overlay, .html2pdf__container').forEach(el => el.remove());
      });
  };

  const generateDocx = async (type: 'resume' | 'coverLetter') => {
    try {
        let docSections: any[] = [];

        if (type === 'resume') {
            docSections = [
                {
                properties: {},
                children: [
                    new Paragraph({
                    text: fullName,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    }),
                    new Paragraph({
                    text: contact,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                    }),
                    new Paragraph({
                    text: "PROFESSIONAL SUMMARY",
                    heading: HeadingLevel.HEADING_2,
                    thematicBreak: true,
                    spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                    text: summary,
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 200 },
                    }),
                    new Paragraph({
                    text: "KEY SKILLS",
                    heading: HeadingLevel.HEADING_2,
                    thematicBreak: true,
                    spacing: { before: 200, after: 100 },
                    }),
                    ...skills.map(s => new Paragraph({
                        children: [
                            new TextRun({ text: `${s?.category || 'General'}: `, bold: true }),
                            new TextRun(Array.isArray(s?.items) ? s.items.join(', ') : (s?.items || '')),
                        ],
                        spacing: { after: 100 },
                    })),
                    new Paragraph({
                    text: "PROFESSIONAL EXPERIENCE",
                    heading: HeadingLevel.HEADING_2,
                    thematicBreak: true,
                    spacing: { before: 200, after: 100 },
                    }),
                    ...experience.flatMap(exp => {
                        const safeBullets = Array.isArray(exp?.bullets) 
                            ? exp.bullets 
                            : (typeof exp?.bullets === 'string' ? [exp.bullets] : []);
                        
                        return [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp?.company || 'Company', bold: true, size: 24 }),
                                    new TextRun({ text: ` | ${exp?.location || ''}`, italics: true }),
                                ],
                                spacing: { before: 100 },
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: exp?.role || 'Role', bold: true }),
                                    new TextRun({ text: `  ${exp?.date || ''}`, italics: true }), 
                                ],
                                alignment: AlignmentType.BOTH, 
                                spacing: { after: 100 },
                            }),
                            ...safeBullets.map(b => new Paragraph({
                                text: b || '',
                                bullet: { level: 0 },
                            }))
                        ];
                    }),
                    new Paragraph({
                    text: "EDUCATION",
                    heading: HeadingLevel.HEADING_2,
                    thematicBreak: true,
                    spacing: { before: 200, after: 100 },
                    }),
                    ...education.map(edu => new Paragraph({
                        children: [
                            new TextRun({ text: edu?.school || 'School', bold: true }),
                            new TextRun(` — ${edu?.degree || 'Degree'}, ${edu?.year || ''}`),
                        ]
                    })),
                    ...(certifications.length > 0 ? [
                        new Paragraph({
                            text: "CERTIFICATIONS",
                            heading: HeadingLevel.HEADING_2,
                            thematicBreak: true,
                            spacing: { before: 200, after: 100 },
                        }),
                        new Paragraph({
                            text: certifications.join(' • '),
                        })
                    ] : []),
                    ...(projects.length > 0 ? [
                        new Paragraph({
                            text: "PROJECTS",
                            heading: HeadingLevel.HEADING_2,
                            thematicBreak: true,
                            spacing: { before: 200, after: 100 },
                        }),
                        ...projects.map(p => new Paragraph({
                            children: [
                                new TextRun({ text: `${p?.name || 'Project'}: `, bold: true }),
                                new TextRun(p?.description || ''),
                            ]
                        }))
                    ] : []),
                ],
                }
            ];
        } else {
             docSections = [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: fullName,
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 100 },
                        }),
                        new Paragraph({
                            text: contact,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                        new Paragraph({
                            text: coverLetter.replace(/\n/g, '\n\n'),
                            spacing: { line: 360 },
                        })
                    ]
                }
             ];
        }

        const doc = new Document({ sections: docSections });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, type === 'resume' ? "Optimized_Resume.docx" : "Cover_Letter.docx");
    } catch (e) {
        console.error("Failed to generate DOCX", e);
        alert("Could not generate DOCX. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      
      <div className="no-print w-full flex justify-between items-center mb-4 max-w-[210mm]">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button 
                onClick={() => setActiveTab('resume')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'resume' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <FileText size={16} /> Resume
            </button>
            {coverLetter && (
                <button 
                    onClick={() => setActiveTab('coverLetter')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'coverLetter' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <File size={16} /> Cover Letter
                </button>
            )}
        </div>

        <div className="flex gap-2">
            <button 
                onClick={downloadPdf}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 flex items-center gap-2 transition-colors shadow-md"
            >
                <Download size={16} /> PDF
            </button>
            <button 
                onClick={() => generateDocx(activeTab)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-md"
            >
                <Download size={16} /> DOCX
            </button>
        </div>
      </div>

      <div 
        id="resume-preview-content"
        className="resume-page bg-white shadow-xl mx-auto text-left text-slate-900 overflow-hidden relative"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: isConcise ? '15mm' : '20mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          fontFamily: styles.fontFamily,
          lineHeight: styles.lineHeight,
          fontSize: styles.fontSize,
        }}
      >
        {activeTab === 'resume' ? (
            <>
                <div className={`border-b-2 ${isConcise ? 'pb-2 mb-2' : 'pb-4 mb-4'} ${theme === 'minimal' ? 'border-transparent text-center' : 'border-slate-800'}`}>
                <h1 
                    className={`${isConcise ? 'text-2xl' : 'text-3xl'} font-bold tracking-wide ${isConcise ? 'mb-1' : 'mb-2'}`}
                    style={{ color: styles.headerColor, textTransform: styles.headingsUppercase ? 'uppercase' : 'none' }}
                >
                    {fullName}
                </h1>
                <p className={`${isConcise ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: styles.accentColor }}>
                    {contact}
                </p>
                </div>

                <div className={isConcise ? 'mb-3' : 'mb-5'}>
                <h2 
                    className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                    style={{ 
                        textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                        color: styles.headerColor,
                        borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                        letterSpacing: theme === 'classic' ? '0.05em' : '0'
                    }}
                >
                    Professional Summary
                </h2>
                <p className="text-justify">{summary}</p>
                </div>

                {skills.length > 0 && (
                    <div className={isConcise ? 'mb-3' : 'mb-5'}>
                    <h2 
                        className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                        style={{ 
                            textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                            color: styles.headerColor,
                            borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                            letterSpacing: theme === 'classic' ? '0.05em' : '0'
                        }}
                    >
                        Key Skills
                    </h2>
                    <div className={`grid grid-cols-1 ${isConcise ? 'gap-1' : 'gap-2'}`}>
                        {skills.map((skillGroup, idx) => (
                        <div key={idx} className="flex">
                            <span className="font-semibold w-32 shrink-0" style={{ color: styles.headerColor }}>{skillGroup?.category || 'Skills'}:</span>
                            <span>{Array.isArray(skillGroup?.items) ? skillGroup.items.join(', ') : (skillGroup?.items || '')}</span>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                <div className={isConcise ? 'mb-3' : 'mb-5'}>
                <h2 
                    className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                    style={{ 
                        textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                        color: styles.headerColor,
                        borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                        letterSpacing: theme === 'classic' ? '0.05em' : '0'
                    }}
                >
                    Professional Experience
                </h2>
                <div className={isConcise ? 'space-y-2' : 'space-y-4'}>
                    {experience.map((exp, idx) => {
                    const safeBullets = Array.isArray(exp?.bullets) 
                        ? exp.bullets 
                        : (typeof exp?.bullets === 'string' ? [exp.bullets] : []);

                    return (
                        <div key={idx}>
                        <div className={`flex justify-between items-baseline ${isConcise ? 'mb-0' : 'mb-1'}`}>
                            <div className={`${isConcise ? 'text-sm' : 'text-lg'} font-bold`} style={{ color: styles.headerColor }}>{exp?.company || 'Company'}</div>
                            <div className={`${isConcise ? 'text-xs' : 'text-sm'} font-semibold`} style={{ color: styles.accentColor }}>{exp?.location || ''}</div>
                        </div>
                        <div className={`flex justify-between items-baseline ${isConcise ? 'mb-0.5' : 'mb-2'} italic`}>
                            <div className={`${isConcise ? 'text-xs' : 'font-medium'}`} style={{ color: styles.headerColor }}>{exp?.role || 'Role'}</div>
                            <div className={`${isConcise ? 'text-xs' : 'text-sm'}`} style={{ color: styles.accentColor }}>{exp?.date || ''}</div>
                        </div>
                        <ul className={`list-disc ml-5 ${isConcise ? 'space-y-0' : 'space-y-1'}`}>
                            {safeBullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="pl-1">{bullet}</li>
                            ))}
                        </ul>
                        </div>
                    );
                    })}
                </div>
                </div>

                <div className={isConcise ? 'mb-3' : 'mb-5'}>
                <h2 
                    className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                    style={{ 
                        textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                        color: styles.headerColor,
                        borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                        letterSpacing: theme === 'classic' ? '0.05em' : '0'
                    }}
                >
                    Education
                </h2>
                <div className="space-y-1">
                    {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between">
                        <div><span className="font-bold" style={{ color: styles.headerColor }}>{edu?.school || 'School'}</span> — {edu?.degree || 'Degree'}</div>
                        <div style={{ color: styles.accentColor }}>{edu?.year || ''}</div>
                    </div>
                    ))}
                </div>
                </div>

                {certifications && certifications.length > 0 && (
                <div className={isConcise ? 'mb-3' : 'mb-5'}>
                    <h2 
                        className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                        style={{ 
                            textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                            color: styles.headerColor,
                            borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                            letterSpacing: theme === 'classic' ? '0.05em' : '0'
                        }}
                    >
                        Certifications
                    </h2>
                    <ul className="list-none flex flex-wrap gap-x-4 gap-y-1">
                    {certifications.map((cert, idx) => (
                        <li key={idx}>• {cert}</li>
                    ))}
                    </ul>
                </div>
                )}

                {projects && projects.length > 0 && (
                <div className={isConcise ? 'mb-3' : 'mb-5'}>
                    <h2 
                        className={`font-bold border-b ${isConcise ? 'text-xs mb-1 pb-0' : 'text-sm mb-2 pb-1'}`}
                        style={{ 
                            textTransform: styles.headingsUppercase ? 'uppercase' : 'none',
                            color: styles.headerColor,
                            borderColor: theme === 'modern' ? styles.accentColor : '#cbd5e1',
                            letterSpacing: theme === 'classic' ? '0.05em' : '0'
                        }}
                    >
                        Projects
                    </h2>
                    <div className="space-y-1">
                    {projects.map((proj, idx) => (
                        <div key={idx}>
                        <span className="font-bold" style={{ color: styles.headerColor }}>{proj?.name || 'Project'}: </span>
                        <span>{proj?.description || ''}</span>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </>
        ) : (
            <div className="whitespace-pre-line text-justify leading-relaxed">
                <div className="mb-8 text-center border-b pb-6">
                    <h1 className="text-2xl font-bold uppercase mb-2" style={{ color: styles.headerColor }}>{fullName}</h1>
                    <p style={{ color: styles.accentColor }}>{contact}</p>
                </div>
                
                <div className="max-w-[90%] mx-auto">
                    {coverLetter ? coverLetter : (
                        <div className="text-center text-slate-400 italic mt-20">
                            Cover letter was not generated.
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

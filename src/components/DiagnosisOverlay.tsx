import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { useState } from 'react';
import html2canvas from 'html2canvas';

function stripUnsupportedColors(input: string | null): string | null {
  if (!input) return input;
  let output = input.replace(/oklch\([^)]+\)/g, '#94a3b8');
  output = output.replace(/color-mix\([^)]*\)/g, 'rgba(148,163,184,0.3)');
  return output;
}

interface AnalysisResult {
  diagnosis: string;
  organs: string[];
  explanation: string;
  confidence?: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface DiagnosisOverlayProps {
  result: AnalysisResult;
  visualizationRef: React.RefObject<HTMLDivElement>;
  isDarkMode: boolean;
}

export function DiagnosisOverlay({ result, visualizationRef, isDarkMode }: DiagnosisOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!visualizationRef.current) return;
    
    setIsSaving(true);
    try {
      const canvas = await html2canvas(visualizationRef.current, {
        backgroundColor: '#020617',
        scale: 2,
        logging: false,
        useCORS: true,
        ignoreElements: () => false,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent?.includes('oklch') || styleTag.textContent?.includes('color-mix')) {
              styleTag.textContent = stripUnsupportedColors(styleTag.textContent) ?? '';
            }
          });
          clonedDoc.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
            const sanitized = stripUnsupportedColors(el.getAttribute('style'));
            if (sanitized) {
              el.setAttribute('style', sanitized);
            }
          });
          const style = clonedDoc.createElement('style');
          style.textContent = `
            :root, * {
              --foreground: #0f172a !important;
              --background: #020617 !important;
              --card: #0f172a !important;
              --card-foreground: #f8fafc !important;
              --popover: #0f172a !important;
              --popover-foreground: #f8fafc !important;
              --primary: #2563eb !important;
              --primary-foreground: #ffffff !important;
              --secondary: #1e293b !important;
              --secondary-foreground: #e2e8f0 !important;
              --muted: #1e293b !important;
              --muted-foreground: #94a3b8 !important;
              --accent: #1e293b !important;
              --accent-foreground: #e2e8f0 !important;
              --destructive: #ef4444 !important;
              --destructive-foreground: #ffffff !important;
              --border: rgba(148, 163, 184, 0.3) !important;
              --input: rgba(15, 23, 42, 0.8) !important;
              --ring: rgba(14, 165, 233, 0.8) !important;
              color: inherit !important;
            }
            body, .min-h-screen {
              background: #020617 !important;
            }
            .bg-gradient-to-br {
              background-image: none !important;
              background-color: #020617 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });
      
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1)
      );

      if (!blob) {
        throw new Error('Unable to export captured canvas');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `medical-analysis-${timestamp}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityConfig = () => {
    switch (result.severity) {
      case 'low':
        return {
          color: 'emerald',
          icon: CheckCircle2,
          label: 'Low Severity',
          bgClass: 'bg-emerald-500/10',
          borderClass: 'border-emerald-500/20',
          textClass: 'text-emerald-400'
        };
      case 'medium':
        return {
          color: 'amber',
          icon: AlertCircle,
          label: 'Medium Severity',
          bgClass: 'bg-amber-500/10',
          borderClass: 'border-amber-500/20',
          textClass: 'text-amber-400'
        };
      case 'high':
        return {
          color: 'red',
          icon: AlertTriangle,
          label: 'High Severity',
          bgClass: 'bg-red-500/10',
          borderClass: 'border-red-500/20',
          textClass: 'text-red-400'
        };
    }
  };

  const severityConfig = getSeverityConfig();
  const SeverityIcon = severityConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0 }}
      className="absolute bottom-8 left-8 right-8"
    >
      <div className={`${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-xl border rounded-xl shadow-2xl max-w-4xl mx-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} ${severityConfig.bgClass} ${severityConfig.borderClass}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${severityConfig.bgClass} rounded-lg`}>
                <SeverityIcon className={`w-5 h-5 ${severityConfig.textClass}`} />
              </div>
              <div>
                <h3 className={isDarkMode ? 'text-white' : 'text-slate-900'}>Diagnosis Result</h3>
                <p className={`text-sm ${severityConfig.textClass}`}>{severityConfig.label}</p>
              </div>
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className={`px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} text-sm rounded-lg transition-colors`}
            >
              {expanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>

        {/* Compact View */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-6">
            {/* Diagnosis */}
            <div>
              <p className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Primary Diagnosis</p>
              <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>{result.diagnosis}</p>
            </div>

            {/* Confidence */}
            {result.confidence && (
              <div>
                <p className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>AI Confidence Score</p>
                <div className="flex items-center gap-3">
                  <div className={`flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-full h-2 overflow-hidden`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                  <span className={`min-w-[3rem] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{result.confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Affected Organs */}
          <div className="mt-5">
            <p className={`text-xs mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Affected Systems</p>
            <div className="flex flex-wrap gap-2">
              {result.organs.map((organ, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm capitalize flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  {organ}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}
          >
            <div className="px-6 py-5 space-y-5">
              {/* Clinical Explanation */}
              <div>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Clinical Explanation</p>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {result.explanation}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Clinical Recommendations</p>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className={`w-5 h-5 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className="text-cyan-400 text-xs">{index + 1}</span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Image'}
                </button>
                <button className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} rounded-lg transition-colors text-sm`}>
                  Share with Team
                </button>
                <button className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} rounded-lg transition-colors text-sm`}>
                  Request Follow-up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
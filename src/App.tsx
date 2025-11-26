import React, { useState, useRef } from 'react';
import { InputPanel } from './components/InputPanel';
import { BodyVisualizationMain } from './components/BodyVisualizationMain';
import { DiagnosisOverlay } from './components/DiagnosisOverlay';
import { OrganGridTable } from './components/OrganGridTable';
import { Activity, FileText, Shield, Moon, Sun } from 'lucide-react';
import { API_CONFIG } from './config';
import { toast, Toaster } from 'sonner@2.0.3';

interface AnalysisResult {
  diagnosis: string;
  organs: string[];
  organDetails?: Record<string, string>; // Organ-specific issue details
  explanation: string;
  confidence?: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Backend API response interface
interface APIResponse {
  diagnosis?: string;
  supporting_organs?: string[];
  organ_details?: Record<string, string>; // Organ-specific issue details
  explanation?: string;
  confidence?: number;
  severity?: 'low' | 'medium' | 'high';
  recommendations?: string[];
  error?: string;
}

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const visualizationRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (data: {
    patientName: string;
    doctorName: string;
    description: string;
  }) => {
    setIsAnalyzing(true);
    
    try {
      // Make API call to Flask backend
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: data.patientName,
          doctor_name: data.doctorName,
          description: data.description
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const apiResult: APIResponse = await response.json();

      // Check for API errors
      if (apiResult.error) {
        throw new Error(apiResult.error);
      }

      // Map API response to frontend format
      const result: AnalysisResult = {
        diagnosis: apiResult.diagnosis || 'No diagnosis available',
        organs: apiResult.supporting_organs || [],
        organDetails: apiResult.organ_details || {},
        explanation: apiResult.explanation || 'No explanation provided',
        confidence: apiResult.confidence,
        severity: apiResult.severity || 'medium',
        recommendations: apiResult.recommendations || []
      };
      
      setAnalysisResult(result);
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze. Please try again.');
      
      // Optionally: Show a fallback result or keep the error visible
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setAnalysisResult(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950' : 'bg-white'} text-white overflow-hidden`}>
      <Toaster position="top-right" theme={isDarkMode ? 'dark' : 'light'} />
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'} backdrop-blur-sm`}>
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Medical AI Analyzer</h1>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Advanced Pattern Recognition & Clinical Assessment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm">HIPAA Compliant</span>
              </div>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg transition-colors`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-slate-700'}`} />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700" />
                )}
              </button>
              
              <button
                onClick={() => setShowInput(!showInput)}
                className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} rounded-lg transition-colors`}
              >
                <FileText className="w-4 h-4" />
                {showInput ? 'Hide Input' : 'Show Input'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto">
        <div className="flex h-[calc(100vh-81px)]">
          {/* Main Body Visualization Area */}
          <div className="flex-1 relative" ref={visualizationRef}>
            {/* Invisible Grid Table Overlay - Pre-tagged to organs */}
            {analysisResult && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <OrganGridTable
                  highlightedOrgans={analysisResult.organs}
                  organDetails={analysisResult.organDetails}
                  analysisResult={{
                    diagnosis: analysisResult.diagnosis,
                    explanation: analysisResult.explanation,
                    severity: analysisResult.severity,
                    confidence: analysisResult.confidence,
                  }}
                  isDarkMode={isDarkMode}
                  showGrid={false} // Set to true to see grid lines for debugging
                  className="w-full h-full"
                />
              </div>
            )}

            <BodyVisualizationMain 
              highlightedOrgans={analysisResult?.organs || []}
              organDetails={analysisResult?.organDetails}
              isAnalyzing={isAnalyzing}
              severity={analysisResult?.severity}
              isDarkMode={isDarkMode}
            />
            
            {analysisResult && (
              <DiagnosisOverlay result={analysisResult} visualizationRef={visualizationRef} isDarkMode={isDarkMode} />
            )}
          </div>

          {/* Organ Status Grid Sidebar */}
          {analysisResult && (
            <div className="w-80 border-l border-slate-700/50 overflow-y-auto">
              <OrganGridTable
                highlightedOrgans={analysisResult.organs}
                organDetails={analysisResult.organDetails}
                analysisResult={{
                  diagnosis: analysisResult.diagnosis,
                  explanation: analysisResult.explanation,
                  severity: analysisResult.severity,
                  confidence: analysisResult.confidence,
                }}
                isDarkMode={isDarkMode}
                showGrid={false}
                className="h-full"
              />
            </div>
          )}

          {/* Input Panel */}
          <InputPanel
            show={showInput}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
            hasResult={!!analysisResult}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
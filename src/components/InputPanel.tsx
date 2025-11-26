import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Send,
  RotateCcw,
  Lock,
  Loader2,
} from "lucide-react";

interface InputPanelProps {
  show: boolean;
  onAnalyze: (data: {
    patientName: string;
    doctorName: string;
    description: string;
  }) => void;
  onClear: () => void;
  isAnalyzing: boolean;
  hasResult: boolean;
  isDarkMode: boolean;
}

export function InputPanel({
  show,
  onAnalyze,
  onClear,
  isAnalyzing,
  hasResult,
  isDarkMode,
}: InputPanelProps) {
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [description, setDescription] = useState("");
  const [hasConsent, setHasConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsent) return;

    onAnalyze({
      patientName,
      doctorName,
      description,
    });
  };

  const handleClear = () => {
    setPatientName("");
    setDoctorName("");
    setDescription("");
    setHasConsent(false);
    onClear();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
          }}
          className={`w-[420px] ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-l flex flex-col`}
        >
          {/* Panel Header */}
          <div
            className={`p-6 border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2
                className={`text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Patient Analysis Input
              </h2>
            </div>
            <p
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Enter patient information and symptoms for
              AI-powered clinical assessment
            </p>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className={`block text-sm mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) =>
                    setPatientName(e.target.value)
                  }
                  placeholder="Enter patient name"
                  className={`w-full px-4 py-2.5 ${isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  Attending Physician
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) =>
                    setDoctorName(e.target.value)
                  }
                  placeholder="Dr. [Name]"
                  className={`w-full px-4 py-2.5 ${isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  Clinical Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe symptoms, vitals, medications, patient history..."
                  rows={8}
                  className={`w-full px-4 py-2.5 ${isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all`}
                  required
                />
                <p
                  className={`text-xs mt-2 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                >
                  Include relevant symptoms, medications, and
                  clinical observations
                </p>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={hasConsent}
                      onChange={(e) =>
                        setHasConsent(e.target.checked)
                      }
                      className={`w-5 h-5 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"} border-2 rounded appearance-none checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer transition-all`}
                    />
                    {hasConsent && (
                      <svg
                        className="w-3 h-3 text-white absolute pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm ${isDarkMode ? "text-slate-300 group-hover:text-white" : "text-slate-700 group-hover:text-slate-900"} transition-colors`}
                    >
                      I consent to secure AI analysis of this
                      clinical data
                    </span>
                    <div
                      className={`flex items-center gap-1.5 mt-1 text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>
                        HIPAA compliant • End-to-end encrypted
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className={`flex-1 px-4 py-2.5 ${isDarkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"} border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={!hasConsent || isAnalyzing}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>

              {/* AI Engine Info */}
              <div
                className={`pt-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
              >
                <p
                  className={`text-xs mb-3 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                >
                  Analysis Engines
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        isDarkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    >
                      Google Gemini API
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                      Primary
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        isDarkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    >
                      Local Llama Model
                    </span>
                    <span
                      className={`px-2 py-0.5 ${isDarkMode ? "bg-slate-700 text-slate-500" : "bg-slate-200 text-slate-600"} rounded`}
                    >
                      Fallback
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        isDarkMode
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    >
                      Triton Server
                    </span>
                    <span
                      className={`px-2 py-0.5 ${isDarkMode ? "bg-slate-700 text-slate-500" : "bg-slate-200 text-slate-600"} rounded`}
                    >
                      Fallback
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Disclaimer */}
          <div
            className={`p-6 border-t ${isDarkMode ? "border-slate-800 bg-amber-500/5" : "border-slate-200 bg-amber-50"}`}
          >
            <div className="flex gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <p
                className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                AI-generated analysis is for clinical decision
                support only. Always verify findings with
                professional medical judgment and additional
                diagnostic procedures.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
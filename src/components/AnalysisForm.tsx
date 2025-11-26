import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AnalysisFormProps {
  onAnalyze: (data: {
    patientName: string;
    doctorName: string;
    description: string;
  }) => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

export function AnalysisForm({ onAnalyze, onClear, isAnalyzing }: AnalysisFormProps) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [description, setDescription] = useState('');
  const [hasConsent, setHasConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsent) return;
    
    onAnalyze({
      patientName,
      doctorName,
      description
    });
  };

  const handleClear = () => {
    setPatientName('');
    setDoctorName('');
    setDescription('');
    setHasConsent(false);
    onClear();
  };

  return (
    <div>
      <h2 className="text-gray-800 mb-2">Prescription Input</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter patient name, doctor, symptoms or medicines
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Patient Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Doctor Name
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="e.g. Dr. Aksu+Mehta"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Description / Symptoms
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe symptoms, vitals, medicines..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="consent"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="consent" className="text-gray-700 text-sm">
            I consent to secure analysis (HIPAA)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!hasConsent || isAnalyzing}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        <div className="pt-2">
          <p className="text-gray-400 text-xs">
            ⚡ Local (llama or triton) → External (Gemini) fallback • Redact
          </p>
        </div>

        <div className="pt-4">
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-800 text-sm underline"
          >
            Clear Highlights
          </button>
        </div>
      </form>
    </div>
  );
}

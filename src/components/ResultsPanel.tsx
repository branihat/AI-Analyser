interface AnalysisResult {
  diagnosis: string;
  organs: string[];
  explanation: string;
  confidence?: number;
}

interface ResultsPanelProps {
  result: AnalysisResult;
  activeTab: 'summary' | 'engines';
}

export function ResultsPanel({ result, activeTab }: ResultsPanelProps) {
  if (activeTab === 'summary') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-gray-700 mb-2">Diagnosis</h3>
          <p className="text-gray-900">{result.diagnosis}</p>
        </div>

        <div>
          <h3 className="text-gray-700 mb-2">Affected Organs</h3>
          <div className="flex flex-wrap gap-2">
            {result.organs.map((organ, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm capitalize"
              >
                {organ}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-gray-700 mb-2">Clinical Explanation</h3>
          <p className="text-gray-600 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {result.confidence && (
          <div>
            <h3 className="text-gray-700 mb-2">Confidence Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span className="text-gray-900 min-w-[3rem]">
                {result.confidence}%
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            <span className="text-amber-600">⚠️ Disclaimer:</span> This analysis is
            AI-generated and should not replace professional medical diagnosis.
            Always consult with a qualified healthcare provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-800">Google Gemini API</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Active
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Primary analysis engine using Google's Gemini model for medical pattern
            detection and diagnosis assistance.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 opacity-60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-800">Local Llama Model</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              Fallback
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Local inference model for offline analysis when external APIs are
            unavailable.
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 opacity-60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-800">Triton Inference Server</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              Fallback
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            High-performance inference server for batch processing and advanced
            model deployment.
          </p>
        </div>
      </div>
    </div>
  );
}

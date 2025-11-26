import { useMemo } from 'react';
import { motion } from 'motion/react';

// Organ definitions matching OrganSvg.tsx
const ORGAN_DEFINITIONS = {
  brain: { label: 'Brain', color: '#8b5cf6' },
  heart: { label: 'Heart', color: '#ef4444' },
  lungs: { label: 'Lungs', color: '#3b82f6' },
  liver: { label: 'Liver', color: '#10b981' },
  stomach: { label: 'Stomach', color: '#f59e0b' },
  kidney: { label: 'Kidneys', color: '#ec4899' },
  intestine: { label: 'Intestines', color: '#06b6d4' },
  pancreas: { label: 'Pancreas', color: '#84cc16' },
  sinuses: { label: 'Sinuses', color: '#a855f7' },
  throat: { label: 'Throat', color: '#6366f1' },
  bronchi: { label: 'Bronchi', color: '#0ea5e9' },
  bladder: { label: 'Bladder', color: '#14b8a6' },
} as const;

type OrganKey = keyof typeof ORGAN_DEFINITIONS;

interface OrganGridTableProps {
  highlightedOrgans: string[];
  organDetails?: Record<string, string>; // Organ-specific issue details
  analysisResult?: {
    diagnosis?: string;
    explanation?: string;
    severity?: 'low' | 'medium' | 'high';
    confidence?: number;
  };
  isDarkMode?: boolean;
  showGrid?: boolean; // Toggle to show/hide grid lines for debugging
  className?: string;
}

interface OrganRowData {
  organKey: OrganKey;
  label: string;
  color: string;
  isHighlighted: boolean;
  status?: string;
  details?: string;
}

export function OrganGridTable({
  highlightedOrgans,
  organDetails = {},
  analysisResult,
  isDarkMode = false,
  showGrid = false,
  className = '',
}: OrganGridTableProps) {
  // Normalize highlighted organs for matching
  const normalizedHighlights = useMemo(
    () => highlightedOrgans.map((organ) => organ.toLowerCase()),
    [highlightedOrgans]
  );

  // Create organ rows with status
  const organRows = useMemo<OrganRowData[]>(() => {
    return (Object.keys(ORGAN_DEFINITIONS) as OrganKey[]).map((organKey) => {
      const organ = ORGAN_DEFINITIONS[organKey];
      const isHighlighted = normalizedHighlights.some((name) => 
        name.includes(organKey) || organKey.includes(name)
      );

      // Determine status and details based on analysis
      let status: string | undefined;
      let details: string | undefined;

      if (isHighlighted && analysisResult) {
        status = analysisResult.severity 
          ? `${analysisResult.severity.toUpperCase()} SEVERITY`
          : 'AFFECTED';
        
        // Get organ-specific issue from organDetails (preferred)
        const organDetail = organDetails[organKey] || organDetails[organ.label.toLowerCase()];
        if (organDetail) {
          details = organDetail;
        } else if (analysisResult.explanation) {
          // Fallback: Extract organ-specific details from explanation if possible
          const explanationLower = analysisResult.explanation.toLowerCase();
          const organLabelLower = organ.label.toLowerCase();
          if (explanationLower.includes(organLabelLower)) {
            // Try to find a sentence mentioning this organ
            const sentences = analysisResult.explanation.split(/[.!?]+/);
            const relevantSentence = sentences.find(s => 
              s.toLowerCase().includes(organLabelLower)
            );
            if (relevantSentence) {
              details = relevantSentence.trim();
            }
          }
        }
      }

      return {
        organKey,
        label: organ.label,
        color: organ.color,
        isHighlighted,
        status,
        details,
      };
    });
  }, [normalizedHighlights, analysisResult]);

  const getSeverityColor = (severity?: string) => {
    if (!severity) return '#64748b';
    switch (severity.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        // Invisible grid - only shows when showGrid is true
        display: showGrid ? 'block' : 'none',
      }}
    >
      {/* Grid Container */}
      <div
        className={`absolute inset-0 ${
          isDarkMode ? 'bg-slate-900/50' : 'bg-white/50'
        } backdrop-blur-sm rounded-lg border ${
          isDarkMode ? 'border-slate-700' : 'border-slate-300'
        }`}
        style={{
          // Grid layout
          display: 'grid',
          gridTemplateRows: `repeat(${organRows.length}, minmax(60px, auto))`,
          gap: '2px',
          padding: '8px',
        }}
      >
        {/* Grid Lines (visible only when showGrid is true) */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.2)'} 1px, transparent 1px),
                linear-gradient(to bottom, ${isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.2)'} 1px, transparent 1px)
              `,
              backgroundSize: '100px 60px',
            }}
          />
        )}

        {/* Organ Rows */}
        {organRows.map((row, index) => (
          <motion.div
            key={row.organKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`grid grid-cols-12 gap-2 items-center p-3 rounded transition-all ${
              row.isHighlighted
                ? `${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100/80'} border-l-4`
                : `${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50/30'} border-l-4 border-transparent`
            }`}
            style={{
              borderLeftColor: row.isHighlighted ? row.color : 'transparent',
            }}
            data-organ={row.organKey}
            data-highlighted={row.isHighlighted}
          >
            {/* Organ Label Column */}
            <div className="col-span-3 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: row.color,
                  opacity: row.isHighlighted ? 1 : 0.3,
                }}
              />
              <span
                className={`text-sm font-medium ${
                  row.isHighlighted
                    ? isDarkMode
                      ? 'text-white'
                      : 'text-slate-900'
                    : isDarkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {row.label}
              </span>
            </div>

            {/* Status Column */}
            <div className="col-span-2">
              {row.status && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                  }`}
                  style={{
                    color: getSeverityColor(row.status),
                  }}
                >
                  {row.status}
                </span>
              )}
            </div>

            {/* Details Column */}
            <div className="col-span-7">
              {row.details && (
                <p
                  className={`text-xs ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  } line-clamp-2`}
                >
                  {row.details}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visible Table (when showGrid is false, show as sidebar) */}
      {!showGrid && (
        <div
          className={`h-full ${
            isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'
          } backdrop-blur-xl border ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          } shadow-xl`}
        >
          <div className="p-4 h-full flex flex-col">
            <h3
              className={`text-sm font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Organ Status Grid
            </h3>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {organRows.map((row) => (
                <div
                  key={row.organKey}
                  className={`flex items-start gap-3 p-2.5 rounded transition-all ${
                    row.isHighlighted
                      ? `${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100/80'} border-l-2`
                      : `${isDarkMode ? 'bg-transparent' : 'bg-transparent'} border-l-2 border-transparent`
                  }`}
                  style={{
                    borderLeftColor: row.isHighlighted ? row.color : 'transparent',
                  }}
                  data-organ={row.organKey}
                  data-highlighted={row.isHighlighted}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{
                      backgroundColor: row.color,
                      opacity: row.isHighlighted ? 1 : 0.3,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          row.isHighlighted
                            ? isDarkMode
                              ? 'text-white'
                              : 'text-slate-900'
                            : isDarkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {row.label}
                      </span>
                      {row.status && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{
                            backgroundColor: `${getSeverityColor(row.status)}20`,
                            color: getSeverityColor(row.status),
                          }}
                        >
                          {row.status.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    {row.details && (
                      <p
                        className={`text-xs leading-relaxed ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        } line-clamp-2`}
                      >
                        {row.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { motion } from 'motion/react';
import { BodyOrganSvg } from './OrganSvg';

interface BodyVisualizationMainProps {
  highlightedOrgans: string[];
  organDetails?: Record<string, string>; // Organ-specific issue details
  isAnalyzing: boolean;
  severity?: 'low' | 'medium' | 'high';
  isDarkMode: boolean;
  captureRef?: React.RefObject<HTMLDivElement>;
}

export function BodyVisualizationMain({ 
  highlightedOrgans,
  organDetails,
  isAnalyzing,
  severity,
  isDarkMode,
  captureRef,
}: BodyVisualizationMainProps) {
  const getSeverityColor = () => {
    if (!severity) return '#64748b';
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div
      ref={captureRef}
      className={`h-full flex items-center justify-center relative ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100'}`}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" 
          style={{
            backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.2)'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(100, 116, 139, 0.2)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Analyzing Pulse Effect */}
      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-[600px] h-[600px] rounded-full border-2 border-cyan-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <BodyOrganSvg
          highlightedOrgans={highlightedOrgans}
          organDetails={organDetails}
          isDarkMode={isDarkMode}
          className="drop-shadow-2xl"
          style={{ maxWidth: '450px', maxHeight: '85vh' }}
        />

        {/* Status Indicator */}
        {highlightedOrgans.length > 0 && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 text-center"
          >
            <div className={`px-6 py-3 ${isDarkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-full border ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <span style={{ color: getSeverityColor() }}>●</span> {highlightedOrgans.length} organ(s) affected
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface OrganComponentProps {
  highlighted: boolean;
  color: string;
  position: { x: number; y: number };
  label: string;
  children: React.ReactNode;
}

function OrganComponent({ highlighted, color, position, label, children }: OrganComponentProps) {
  return (
    <g className={highlighted ? 'cursor-pointer' : ''}>
      {children}
      
      {highlighted && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pulse effect */}
          <motion.circle
            cx={position.x}
            cy={position.y}
            r="20"
            fill={color}
            opacity="0.3"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Marker */}
          <circle
            cx={position.x}
            cy={position.y}
            r="16"
            fill={color}
            filter="url(#glow)"
          />
          <text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="18"
          >
            ⚠
          </text>
          
          {/* Label */}
          <rect
            x={position.x + 25}
            y={position.y - 12}
            width={label.length * 8 + 16}
            height="24"
            fill="rgba(15, 23, 42, 0.95)"
            stroke={color}
            strokeWidth="1"
            rx="4"
          />
          <text
            x={position.x + 33}
            y={position.y + 5}
            fill="white"
            fontSize="12"
          >
            {label}
          </text>
        </motion.g>
      )}
    </g>
  );
}
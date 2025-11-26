interface BodyVisualizationProps {
  highlightedOrgans: string[];
  diagnosis?: string;
}

export function BodyVisualization({ highlightedOrgans, diagnosis }: BodyVisualizationProps) {
  const isHighlighted = (organ: string) => 
    highlightedOrgans.some(h => h.toLowerCase().includes(organ.toLowerCase()));

  return (
    <div>
      <h2 className="text-gray-800 mb-2">Body Visualization</h2>
      <p className="text-gray-500 text-sm mb-6">
        Detected organs will have a blue + icon
      </p>

      <div className="relative flex items-center justify-center h-[450px]">
        <svg
          viewBox="0 0 300 600"
          className="w-full h-full"
          style={{ maxWidth: '250px' }}
        >
          {/* Body outline */}
          <image
            href={require('./ui/Body.svg').default}
            x="0"
            y="0"
            width="300"
            height="600"
            opacity="0.8"
          />

          {/* Brain */}
          <g>
            <ellipse cx="150" cy="50" rx="25" ry="28" fill="#e89ac7" opacity="0.8" />
            {isHighlighted('brain') && (
              <>
                <circle cx="190" cy="50" r="12" fill="#60a5fa" />
                <path d="M 185 50 L 195 50 M 190 45 L 190 55" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Throat/Sinuses */}
          <g>
            <rect x="140" y="85" width="20" height="25" fill="#ff9999" opacity="0.7" rx="3" />
            {isHighlighted('throat') || isHighlighted('sinus') && (
              <>
                <circle cx="190" cy="95" r="12" fill="#60a5fa" />
                <path d="M 185 95 L 195 95 M 190 90 L 190 100" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Heart */}
          <g>
            <path
              d="M 160 140 Q 170 125 175 135 Q 180 145 170 160 L 160 170 L 150 160 Q 140 145 145 135 Q 150 125 160 140"
              fill="#e74c3c"
              opacity="0.8"
            />
            {isHighlighted('heart') && (
              <>
                <circle cx="200" cy="150" r="12" fill="#60a5fa" />
                <path d="M 195 150 L 205 150 M 200 145 L 200 155" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Lungs */}
          <g>
            <ellipse cx="125" cy="150" rx="18" ry="35" fill="#6ab5db" opacity="0.7" />
            <ellipse cx="175" cy="150" rx="18" ry="35" fill="#6ab5db" opacity="0.7" />
            {isHighlighted('lung') && (
              <>
                <circle cx="210" cy="150" r="12" fill="#60a5fa" />
                <path d="M 205 150 L 215 150 M 210 145 L 210 155" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Liver */}
          <g>
            <ellipse cx="165" cy="210" rx="30" ry="25" fill="#8b6f47" opacity="0.7" />
            {isHighlighted('liver') && (
              <>
                <circle cx="210" cy="210" r="12" fill="#60a5fa" />
                <path d="M 205 210 L 215 210 M 210 205 L 210 215" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Stomach */}
          <g>
            <ellipse cx="135" cy="230" rx="20" ry="30" fill="#d98cb3" opacity="0.7" />
            {isHighlighted('stomach') && (
              <>
                <circle cx="90" cy="230" r="12" fill="#60a5fa" />
                <path d="M 85 230 L 95 230 M 90 225 L 90 235" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Intestines */}
          <g>
            <path
              d="M 130 265 Q 140 265 145 275 Q 150 285 140 290 Q 130 295 125 285 Q 120 275 130 265"
              fill="#d98cb3"
              opacity="0.7"
            />
            <path
              d="M 155 265 Q 165 265 170 275 Q 175 285 165 290 Q 155 295 150 285 Q 145 275 155 265"
              fill="#d98cb3"
              opacity="0.7"
            />
            {isHighlighted('intestine') && (
              <>
                <circle cx="210" cy="275" r="12" fill="#60a5fa" />
                <path d="M 205 275 L 215 275 M 210 270 L 210 280" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Kidneys */}
          <g>
            <ellipse cx="120" cy="250" rx="12" ry="20" fill="#c85a5a" opacity="0.7" />
            <ellipse cx="180" cy="250" rx="12" ry="20" fill="#c85a5a" opacity="0.7" />
            {isHighlighted('kidney') && (
              <>
                <circle cx="210" cy="250" r="12" fill="#60a5fa" />
                <path d="M 205 250 L 215 250 M 210 245 L 210 255" stroke="white" strokeWidth="2" />
              </>
            )}
          </g>
        </svg>
      </div>

      {diagnosis && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-gray-600 text-sm">
            Pathology was approximated for
          </p>
          <p className="text-gray-800 mt-1">
            Diagnosis
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {diagnosis}
          </p>
        </div>
      )}
    </div>
  );
}

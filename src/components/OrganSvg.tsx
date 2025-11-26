import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import RawBodySvg from './body-organs.svg?raw';

const BODY_VIEWBOX = {
  width: 810,
  height: 1012.5,
};

const ORGAN_CLIP_IDS = {
  brain: 'Brain',
  heart: 'Heart',
  lungs: 'Lungs',
  liver: 'Liver',
  stomach: 'Stomach',
  kidney: 'Kidney',
  intestine: 'Intestine',
  pancreas: 'Pancreas',
} as const;

type OrganKey = keyof typeof ORGAN_CLIP_IDS;

const ORGAN_LABELS: Record<OrganKey, string> = {
  brain: 'Brain',
  heart: 'Heart',
  lungs: 'Lungs',
  liver: 'Liver',
  stomach: 'Stomach',
  kidney: 'Kidneys',
  intestine: 'Intestines',
  pancreas: 'Pancreas',
};

const ORGAN_COLORS: Record<OrganKey, string> = {
  brain: '#a855f7',
  heart: '#ef4444',
  lungs: '#3b82f6',
  liver: '#92400e',
  stomach: '#f97316',
  kidney: '#b91c1c',
  intestine: '#d946ef',
  pancreas: '#f59e0b',
};

interface BodyOrganSvgProps {
  highlightedOrgans: string[];
  organDetails?: Record<string, string>; // Organ-specific issue details
  isDarkMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function BodyOrganSvg({
  highlightedOrgans,
  organDetails = {},
  isDarkMode = false,
  className,
  style,
}: BodyOrganSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgReady, setSvgReady] = useState(false);
  const [markerPositions, setMarkerPositions] = useState<
    Partial<Record<OrganKey, { left: number; top: number }>>
  >({});

  const normalizedHighlights = useMemo(
    () => highlightedOrgans.map((organ) => organ.toLowerCase()),
    [highlightedOrgans]
  );

  const isOrganHighlighted = useCallback(
    (organKey: OrganKey) => normalizedHighlights.some((name) => name.includes(organKey)),
    [normalizedHighlights]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = RawBodySvg;
    const svgElement = containerRef.current.querySelector('svg');

    if (svgElement) {
      svgElement.setAttribute('class', 'w-full h-auto');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgRef.current = svgElement as unknown as SVGSVGElement;
      setSvgReady(true);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      svgRef.current = null;
      setSvgReady(false);
    };
  }, []);

  useEffect(() => {
    if (!svgReady || !svgRef.current) return;

    const svgElement = svgRef.current;
    const viewBox = svgElement.viewBox?.baseVal;
    const viewBoxWidth = viewBox?.width || BODY_VIEWBOX.width;
    const viewBoxHeight = viewBox?.height || BODY_VIEWBOX.height;

    const positions: Partial<Record<OrganKey, { left: number; top: number }>> = {};

    (Object.entries(ORGAN_CLIP_IDS) as [OrganKey, string][]).forEach(([organKey, clipId]) => {
      const organGroup = svgElement.querySelector(
        `g[clip-path="url(#${clipId})"]`
      ) as SVGGElement | null;

      if (!organGroup) return;

      const highlighted = isOrganHighlighted(organKey);
      organGroup.style.transition = 'opacity 0s ease, filter 0.3s ease';
      organGroup.style.opacity = highlighted ? '1' : isDarkMode ? '0' : '0';
      organGroup.style.filter = highlighted ? `drop-shadow(0 0 12px ${ORGAN_COLORS[organKey]})` : 'none';
      organGroup.setAttribute('data-organ', organKey);

      const bbox = organGroup.getBBox();
      positions[organKey] = {
        left: ((bbox.x + bbox.width / 2) / viewBoxWidth) * 100,
        top: ((bbox.y + bbox.height / 2) / viewBoxHeight) * 100,
      };
    });

    setMarkerPositions(positions);
  }, [highlightedOrgans, isDarkMode, isOrganHighlighted, svgReady]);

  return (
    <div
      className={`relative w-full ${className ?? ''}`}
      style={{
        aspectRatio: `${BODY_VIEWBOX.width} / ${BODY_VIEWBOX.height}`,
        ...style,
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
        aria-label="Human body with organs"
      />

      <OrganMarkersContainer
        highlightedOrgans={highlightedOrgans}
        organDetails={organDetails}
        markerPositions={markerPositions}
        isOrganHighlighted={isOrganHighlighted}
      />
    </div>
  );
}

interface OrganMarkersContainerProps {
  highlightedOrgans: string[];
  organDetails: Record<string, string>;
  markerPositions: Partial<Record<OrganKey, { left: number; top: number }>>;
  isOrganHighlighted: (organKey: OrganKey) => boolean;
}

// Container component to handle label collision detection and positioning
function OrganMarkersContainer({
  highlightedOrgans,
  organDetails,
  markerPositions,
  isOrganHighlighted,
}: OrganMarkersContainerProps) {
  // Calculate adjusted positions to avoid overlaps
  const adjustedPositions = useMemo(() => {
    const positions: Array<{
      organKey: OrganKey;
      originalPosition: { left: number; top: number };
      adjustedPosition: { left: number; top: number; labelX: number; labelY: number };
      isRightSide: boolean;
      labelHeight: number;
    }> = [];

    const LABEL_HEIGHT = 6.5;
    const MIN_VERTICAL_SPACING = 6;
    const MIN_BOUND = 8;
    const MAX_BOUND = 92;
    const clampValue = (value: number) => Math.max(MIN_BOUND, Math.min(MAX_BOUND, value));
    const clampCenterWithHeight = (center: number, height: number) => {
      const half = height / 2;
      if (center - half < MIN_BOUND) return MIN_BOUND + half;
      if (center + half > MAX_BOUND) return MAX_BOUND - half;
      return center;
    };

    const getOrganDetail = (organKey: OrganKey) =>
      organDetails[organKey] || organDetails[ORGAN_LABELS[organKey].toLowerCase()];

    const estimateLabelHeight = (detail?: string) => {
      if (!detail) return LABEL_HEIGHT;
      const clean = detail.replace(/\s+/g, ' ').trim();
      if (!clean) return LABEL_HEIGHT;
      const approxLines = Math.ceil(clean.length / 34);
      return LABEL_HEIGHT + approxLines * 3.2;
    };

    (Object.keys(ORGAN_CLIP_IDS) as OrganKey[]).forEach((organKey) => {
      if (!isOrganHighlighted(organKey)) return;
      const position = markerPositions[organKey];
      if (!position) return;

      const organCenterX = position.left;
      const organCenterY = position.top;
      const isRightSide = organCenterX > 55;
      const labelOffsetX = 36;
      const labelX = isRightSide ? organCenterX - labelOffsetX : organCenterX + labelOffsetX;
      const organDetail = getOrganDetail(organKey);
      const dynamicLabelHeight = estimateLabelHeight(organDetail);

      positions.push({
        organKey,
        originalPosition: position,
        adjustedPosition: {
          left: organCenterX,
          top: organCenterY,
          labelX,
          labelY: clampCenterWithHeight(organCenterY, dynamicLabelHeight),
        },
        isRightSide,
        labelHeight: dynamicLabelHeight,
      });
    });

    const resolveSide = (isRightSide: boolean) => {
      const sideEntries = positions
        .filter((entry) => entry.isRightSide === isRightSide)
        .sort((a, b) => a.originalPosition.top - b.originalPosition.top);

      if (!sideEntries.length) return;

      const availableHeight = MAX_BOUND - MIN_BOUND;
      const totalHeight =
        sideEntries.reduce((sum, entry) => sum + entry.labelHeight, 0) +
        Math.max(0, sideEntries.length - 1) * MIN_VERTICAL_SPACING;
      const spacing =
        totalHeight > availableHeight
          ? Math.max(
              1.5,
              (availableHeight - sideEntries.reduce((sum, entry) => sum + entry.labelHeight, 0)) /
                Math.max(1, sideEntries.length - 1)
            )
          : MIN_VERTICAL_SPACING;

      sideEntries.forEach((entry) => {
        entry.adjustedPosition.labelY = clampCenterWithHeight(entry.originalPosition.top, entry.labelHeight);
      });

      const applyForwardSpacing = () => {
        for (let i = 1; i < sideEntries.length; i++) {
          const prev = sideEntries[i - 1];
          const current = sideEntries[i];
          const prevBottom = prev.adjustedPosition.labelY + prev.labelHeight / 2;
          const currentTop = current.adjustedPosition.labelY - current.labelHeight / 2;
          if (currentTop - prevBottom < spacing) {
            const needed = spacing - (currentTop - prevBottom);
            current.adjustedPosition.labelY += needed;
          }
        }
      };

      const applyBackwardSpacing = () => {
        for (let i = sideEntries.length - 2; i >= 0; i--) {
          const next = sideEntries[i + 1];
          const current = sideEntries[i];
          const nextTop = next.adjustedPosition.labelY - next.labelHeight / 2;
          const currentBottom = current.adjustedPosition.labelY + current.labelHeight / 2;
          if (nextTop - currentBottom < spacing) {
            const needed = spacing - (nextTop - currentBottom);
            current.adjustedPosition.labelY -= needed;
          }
        }
      };

      applyForwardSpacing();

      const last = sideEntries[sideEntries.length - 1];
      const lastBottom = last.adjustedPosition.labelY + last.labelHeight / 2;
      if (lastBottom > MAX_BOUND) {
        const overflow = lastBottom - MAX_BOUND;
        for (let i = sideEntries.length - 1; i >= 0; i--) {
          sideEntries[i].adjustedPosition.labelY -= overflow;
        }
        applyBackwardSpacing();
      }

      const first = sideEntries[0];
      const firstTop = first.adjustedPosition.labelY - first.labelHeight / 2;
      if (firstTop < MIN_BOUND) {
        const underflow = MIN_BOUND - firstTop;
        sideEntries.forEach((entry) => {
          entry.adjustedPosition.labelY += underflow;
        });
        applyForwardSpacing();
      }

      sideEntries.forEach((entry) => {
        entry.adjustedPosition.labelY = clampCenterWithHeight(entry.adjustedPosition.labelY, entry.labelHeight);
      });
    };

    resolveSide(true);
    resolveSide(false);

    positions.forEach((current) => {
      const distance = Math.abs(current.adjustedPosition.labelY - current.originalPosition.top);
      if (distance < LABEL_HEIGHT) {
        current.adjustedPosition.labelY =
          current.adjustedPosition.labelY < current.originalPosition.top
            ? current.originalPosition.top - LABEL_HEIGHT - 1
            : current.originalPosition.top + LABEL_HEIGHT + 1;
      }
      current.adjustedPosition.labelY = clampCenterWithHeight(current.adjustedPosition.labelY, current.labelHeight);
    });

    return positions;
  }, [markerPositions, highlightedOrgans, isOrganHighlighted, organDetails]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {adjustedPositions.map(({ organKey, adjustedPosition, isRightSide }) => {
        const organDetail = organDetails[organKey] || organDetails[ORGAN_LABELS[organKey].toLowerCase()];
        return (
          <OrganMarker
            key={organKey}
            color={ORGAN_COLORS[organKey]}
            label={ORGAN_LABELS[organKey]}
            issue={organDetail}
            highlighted={true}
            position={adjustedPosition}
            isRightSide={isRightSide}
          />
        );
      })}
    </div>
  );
}

interface OrganMarkerProps {
  highlighted: boolean;
  color: string;
  label: string;
  issue?: string; // Organ-specific issue detail
  position: { left: number; top: number; labelX: number; labelY: number };
  isRightSide: boolean;
}

const OrganMarker: React.FC<OrganMarkerProps> = ({
  highlighted,
  color,
  label,
  issue,
  position,
  isRightSide,
}) => {
  if (!highlighted) return null;

  // Use pre-calculated positions from container (in percentages)
  const organCenterX = position.left;
  const organCenterY = position.top;
  const labelX = position.labelX;
  const labelY = position.labelY;
  
  // Calculate control points for curved line (in percentages)
  // Create a smooth curve from organ to label, curving away from the body
  const midX = (organCenterX + labelX) / 2;
  const controlPointX = midX + (isRightSide ? -8 : 8); // Curve away from body
  const controlPointY = (organCenterY + labelY) / 2;

  return (
    <>
      {/* Connecting Curved Line from Organ to Label */}
      <svg
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{ zIndex: 1, overflow: 'visible' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d={`M ${organCenterX} ${organCenterY} Q ${controlPointX} ${controlPointY} ${labelX} ${labelY}`}
          fill="none"
          stroke={color}
          strokeWidth="0.3"
          strokeDasharray="0.8,0.5"
          opacity={0.7}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        />
      </svg>

      {/* Organ Marker (at organ center) */}
      <motion.div
        className="absolute"
        style={{
          left: `${organCenterX}%`,
          top: `${organCenterY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-10 w-10">
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.2 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-lg text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            ⚠
          </span>
        </div>
      </motion.div>

      {/* Label Container (positioned away from body) */}
      <motion.div
        className="absolute flex flex-col gap-1.5"
        style={{
          left: `${labelX}%`,
          top: `${labelY}%`,
          transform: `translateY(-50%) ${isRightSide ? 'translateX(-100%)' : ''}`,
          zIndex: 3,
          alignItems: isRightSide ? 'flex-end' : 'flex-start',
        }}
        initial={{ opacity: 0, x: isRightSide ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {/* Organ Label */}
        <div
          className="rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap"
          style={{ backgroundColor: 'rgba(42, 15, 15, 0.95)', border: `1px solid ${color}` }}
        >
          {label}
        </div>

        {/* Organ-Specific Issue Detail */}
        {issue && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-md px-2.5 py-1.5 text-[10px] text-white shadow-lg max-w-[160px] text-left leading-tight"
            style={{ backgroundColor: 'rgba(42, 15, 15, 0.95)', border: `1px solid ${color}` }}
          >
            {issue}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};


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

// Grid configuration - invisible layout reference
const GRID_CONFIG = {
  // Left side columns
  leftNameColumnX: 73, // Left organ name column
  // Right side columns
  rightNameColumnX: 27, // Right organ name column (mirrors right:73%)
  // Vertical rows
  rowHeight: 12.5, // 100% / 8 rows
  startY: 6.25, // First row center
  totalRows: 8,
  cardAnchorOffset: 3.5, // Amount to move connector anchor upward (in %)
  separatorOpacity: 0.1,
};

const LABEL_LAYOUT = {
  minVerticalGap: 4, // gap between cards after accounting for their height
  cardHeight: 7, // approximate height in percentage space
  topPadding: 3,
  bottomPadding: 3,
  minWidth: 0,
};

const SEVERITY_COLORS = {
  low: '#22c55e',
  medium: '#fbbf24',
  high: '#ef4444',
  default: '#475569',
} as const;

interface ColumnPositionOverrides {
  left?: number;
  right?: number;
}

type SeverityLevel = keyof Omit<typeof SEVERITY_COLORS, 'default'>;

interface BodyOrganSvgProps {
  highlightedOrgans: string[];
  organDetails?: Record<string, string>;
  isDarkMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  columnPositions?: ColumnPositionOverrides;
  severityLevels?: Partial<Record<OrganKey, SeverityLevel>>;
}

export function BodyOrganSvg({
  highlightedOrgans,
  organDetails = {},
  isDarkMode = false,
  className,
  style,
  columnPositions,
  severityLevels = {},
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
        columnPositions={columnPositions}
        severityLevels={severityLevels}
      />
    </div>
  );
}

interface OrganMarkersContainerProps {
  highlightedOrgans: string[];
  organDetails: Record<string, string>;
  markerPositions: Partial<Record<OrganKey, { left: number; top: number }>>;
  isOrganHighlighted: (organKey: OrganKey) => boolean;
  columnPositions?: ColumnPositionOverrides;
  severityLevels: Partial<Record<OrganKey, SeverityLevel>>;
}

function OrganMarkersContainer({
  highlightedOrgans,
  organDetails,
  markerPositions,
  isOrganHighlighted,
  columnPositions,
  severityLevels,
}: OrganMarkersContainerProps) {
  const gridPositions = useMemo(() => {
    const highlighted = (Object.keys(ORGAN_CLIP_IDS) as OrganKey[])
      .filter(isOrganHighlighted)
      .map((organKey) => ({
        organKey,
        position: markerPositions[organKey],
      }))
      .filter(
        (item): item is { organKey: OrganKey; position: { left: number; top: number } } =>
          !!item.position
      );

    const halfHeight = LABEL_LAYOUT.cardHeight / 2;
    const minCenter = LABEL_LAYOUT.topPadding + halfHeight;
    const maxCenter = 100 - LABEL_LAYOUT.bottomPadding - halfHeight;
    const spacing = LABEL_LAYOUT.cardHeight + LABEL_LAYOUT.minVerticalGap;

    const clampCenter = (value: number) => Math.min(Math.max(value, minCenter), maxCenter);

    const adjustSide = (items: typeof highlighted, columnX: number, isRightSide: boolean) => {
      const sortedItems = items.sort((a, b) => a.position.top - b.position.top);
      const centers: number[] = [];

      sortedItems.forEach(({ position }, index) => {
        const preferred = clampCenter(position.top);
        const minAllowed = index === 0 ? minCenter : centers[index - 1] + spacing;
        centers[index] = Math.max(preferred, minAllowed);
      });

      if (centers.length > 0 && centers[centers.length - 1] > maxCenter) {
        let overflow = centers[centers.length - 1] - maxCenter;
        for (let i = centers.length - 1; i >= 0 && overflow > 0; i -= 1) {
          const prevBound = i === 0 ? minCenter : centers[i - 1] + spacing;
          const availableShift = centers[i] - prevBound;
          if (availableShift <= 0) continue;
          const shift = Math.min(availableShift, overflow);
          centers[i] -= shift;
          overflow -= shift;
        }
      }

      return sortedItems.map(({ organKey, position }, index) => ({
        organKey,
        organPosition: position,
        isRightSide,
        columnX,
        rowY: centers[index],
      }));
    };

    const leftColumnX = columnPositions?.left ?? GRID_CONFIG.leftNameColumnX;
    const rightColumnX = columnPositions?.right ?? GRID_CONFIG.rightNameColumnX;

    const leftAssignments = adjustSide(
      highlighted.filter((item) => item.position.left <= 50),
      leftColumnX,
      false
    );
    const rightAssignments = adjustSide(
      highlighted.filter((item) => item.position.left > 50),
      rightColumnX,
      true
    );

    return [...leftAssignments, ...rightAssignments];
  }, [markerPositions, isOrganHighlighted, columnPositions]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {gridPositions.map(({ organKey, organPosition, isRightSide, columnX, rowY }) => {
        const organDetail =
          organDetails[organKey] || organDetails[ORGAN_LABELS[organKey].toLowerCase()];
        const severityKey = severityLevels[organKey];
        const severityColor = severityKey ? SEVERITY_COLORS[severityKey] : ORGAN_COLORS[organKey];
        return (
          <OrganMarker
            key={organKey}
            color={ORGAN_COLORS[organKey]}
            severityColor={severityColor}
            label={ORGAN_LABELS[organKey]}
            issue={organDetail}
            organPosition={organPosition}
            gridPosition={{ columnX, rowY }}
            isRightSide={isRightSide}
          />
        );
      })}
    </div>
  );
}

interface OrganMarkerProps {
  color: string;
  severityColor: string;
  label: string;
  issue?: string;
  organPosition: { left: number; top: number };
  gridPosition: { columnX: number; rowY: number };
  isRightSide: boolean;
}

const OrganMarker: React.FC<OrganMarkerProps> = ({
  color,
  severityColor,
  label,
  issue,
  organPosition,
  gridPosition,
  isRightSide,
}) => {
  const organX = organPosition.left;
  const organY = organPosition.top;
  const { columnX, rowY } = gridPosition;

  const anchorX = columnX;
  const connectorMidX = (organX + anchorX) / 2;
  const pathCommand = `M ${anchorX} ${rowY} L ${connectorMidX} ${rowY} L ${organX} ${organY}`;
  return (
    <>
      {/* Horizontal connecting line */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d={pathCommand}
          fill="none"
          stroke={color}
          strokeWidth="0.25"
          strokeDasharray="1,0.6"
          opacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        />
      </svg>

      {/* Organ marker with pulsing animation */}
      <motion.div
        className="absolute"
        style={{
          left: `${organX}%`,
          top: `${organY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative h-9 w-9">
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.2 }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-base text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            ⚠️
          </span>
        </div>
      </motion.div>

      {/* Organ info card */}
      <motion.div
        className="absolute"
        style={{
          ...(isRightSide
            ? { right: `${100 - columnX}%`, left: 'auto' }
            : { left: `${columnX}%`, right: 'auto' }),
          top: `${rowY}%`,
          transform: isRightSide ? 'translate(0%, -50%)' : 'translate(-100%, -50%)',
          zIndex: 3,
          minWidth: LABEL_LAYOUT.minWidth ? `${LABEL_LAYOUT.minWidth}%` : undefined,
          width: 'max-content',
        }}
        initial={{ opacity: 0, x: isRightSide ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div
          className="rounded-xl border shadow-lg px-3 py-2 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            borderColor: `${color}aa`,
            boxShadow: `0 10px 25px ${color}20`,
            borderTop: `1px solid rgba(148, 163, 184, ${GRID_CONFIG.separatorOpacity})`,
          }}
        >
          <div className="relative overflow-hidden rounded-md mb-1 h-7 flex items-center">
            <motion.span
              className="absolute inset-0 opacity-50"
              style={{ backgroundColor: severityColor }}
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="relative text-[0.8rem] font-semibold uppercase tracking-wide text-white px-2 flex-1"
              style={{ letterSpacing: '0.08em' }}
            >
              <span>{label}</span>
            </div>
          </div>
          {issue && (
            <p
              className="text-[0.65rem] text-slate-200/80 leading-snug line-clamp-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {issue}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
};
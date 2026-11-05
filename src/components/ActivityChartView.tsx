import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BirdId, Jama, ActivityType, SubPeriod } from '../types';
import { BIRDS, ALL_BIRD_IDS, ACTIVITY_DETAILS } from '../data/panchaPakshiData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  Activity,
  Star,
  ArrowDownUp,
  Sun,
  Moon,
  Check,
  Clock,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpDown,
  MoveVertical,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface ActivityChartViewProps {
  selectedBird: BirdId;
  customJamas?: Jama[];
  sunriseTime?: string;
  sunsetTime?: string;
  nextSunriseTime?: string;
  onSelectBird?: (birdId: BirdId) => void;
}

export type ChartMethod = 'work' | 'star';
export type ChartResolution = 'main' | 'sub';
export type CurveType = 'smooth' | 'straight';

interface ChartPoint {
  x: number; // 0 to 1440 minutes from cycle start
  yVal: number; // normalized 0 (top) to 1 (bottom)
  actualTime: string;
  timeRange: string;
  activity: ActivityType;
  star: number;
  jamaNumber: number;
  subIndex?: number;
  subBirdId?: BirdId;
  birdId: BirdId;
  startMin: number;
  endMin: number;
  isOwnSubPeriod?: boolean;
}

// Catmull-Rom to Cubic Bezier curve path generator
function generateCurvedPath(points: { x: number; y: number }[], tension = 0.22): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * (1 + tension);
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * (1 + tension);

    const cp2x = p2.x - ((p3.x - p1.x) / 6) * (1 + tension);
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * (1 + tension);

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

function generateStraightPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

// Work order arrays
const WORK_ORDER_NORMAL: ActivityType[] = ['Die', 'Sleep', 'Walk', 'Eat', 'Rule'];
const WORK_ORDER_INVERTED: ActivityType[] = ['Rule', 'Eat', 'Walk', 'Sleep', 'Die'];

export const ActivityChartView: React.FC<ActivityChartViewProps> = ({
  selectedBird,
  customJamas,
  sunriseTime = '06:00',
  sunsetTime = '18:00',
  nextSunriseTime = '06:00',
  onSelectBird,
}) => {
  const { language, t, getBirdName, getActivityName } = useLanguage();
  const { isDark } = useTheme();

  // Chart configuration state
  const [method, setMethod] = useState<ChartMethod>('work');
  const [resolution, setResolution] = useState<ChartResolution>('sub');
  const [invertWorkOrder, setInvertWorkOrder] = useState<boolean>(false);
  const [invertStarOrder, setInvertStarOrder] = useState<boolean>(false);
  const [curveType, setCurveType] = useState<CurveType>('smooth');

  // Multi-bird comparison state: allow selecting 1 to 5 birds
  const [comparedBirds, setComparedBirds] = useState<BirdId[]>([selectedBird]);

  // Zoom & Pan / Swipe state
  const [zoomX, setZoomX] = useState<number>(1.0); // 1.0 to 4.0
  const [panX, setPanX] = useState<number>(0); // 0 to 1440 * (1 - 1/zoomX) minutes
  const [panY, setPanY] = useState<number>(0); // -0.4 to +0.4 normalized Y shift (Swiping Y-axis)
  const [zoomY, setZoomY] = useState<number>(1.0); // 1.0 to 2.0 vertical stretch

  // Dragging / swiping tracking
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialPanX: number; initialPanY: number; target: 'all' | 'y-axis' } | null>(null);
  const pinchStartRef = useRef<{ dist: number; initialZoom: number } | null>(null);

  // Ensure current active bird is included when user changes selectedBird outside
  useEffect(() => {
    if (!comparedBirds.includes(selectedBird)) {
      setComparedBirds((prev) => [...prev, selectedBird]);
    }
  }, [selectedBird]);

  // Keep panX within valid bounds whenever zoomX changes
  useEffect(() => {
    const maxPanX = Math.max(0, 1440 * (1 - 1 / zoomX));
    if (panX > maxPanX) {
      setPanX(maxPanX);
    }
  }, [zoomX, panX]);

  // Interactive hover / scrub state
  const [hoveredMinute, setHoveredMinute] = useState<number | null>(null);
  const [hoveredPointInfo, setHoveredPointInfo] = useState<{
    minute: number;
    points: Record<BirdId, ChartPoint>;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG Dimension system
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 440;
  const MARGIN = { top: 38, right: 35, bottom: 65, left: 130 };
  const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Active jamas list
  const jamas = useMemo(() => {
    return customJamas || [];
  }, [customJamas]);

  const cycleStartMin = jamas[0]?.startMinutesFromMidnight ?? 360;
  const totalDuration = 1440; // 24 hours = 1440 minutes
  const visibleDuration = totalDuration / zoomX;

  // Current real-time minute in cycle
  const currentLiveMinuteInCycle = useMemo(() => {
    const d = new Date();
    const currMidnight = d.getHours() * 60 + d.getMinutes();
    let diff = currMidnight - cycleStartMin;
    if (diff < 0) diff += 1440;
    return diff;
  }, [cycleStartMin]);

  // Work order determination
  const workOrder = invertWorkOrder ? WORK_ORDER_INVERTED : WORK_ORDER_NORMAL;

  // Toggle bird selection in compare list
  const toggleBirdInCompare = (birdId: BirdId) => {
    if (comparedBirds.includes(birdId)) {
      if (comparedBirds.length === 1) return; // keep at least one
      setComparedBirds(comparedBirds.filter((b) => b !== birdId));
    } else {
      setComparedBirds([...comparedBirds, birdId]);
    }
  };

  // Helper mappings
  const getActivityY = (activity: ActivityType): number => {
    const idx = workOrder.indexOf(activity);
    if (idx === -1) return 0.5;
    return idx / (workOrder.length - 1); // 0 (top) to 1 (bottom)
  };

  const getStarY = (star: number): number => {
    const clamped = Math.max(1, Math.min(10, star));
    if (invertStarOrder) {
      return (10 - clamped) / 9;
    }
    return (clamped - 1) / 9;
  };

  // Coordinate transforms incorporating Zoom & Y-Axis Swipe / Pan
  const getSvgX = (minFromCycleStart: number): number => {
    return MARGIN.left + ((minFromCycleStart - panX) / visibleDuration) * CHART_WIDTH;
  };

  const getSvgY = (yNorm: number): number => {
    // scaled around center 0.5 with zoomY and panY (swipe offset)
    const scaled = (yNorm - 0.5) * zoomY + 0.5 + panY;
    return MARGIN.top + scaled * CHART_HEIGHT;
  };

  // Build chart dataset for each compared bird
  // CORRECTION APPLIED:
  // In Main Jama mode, star ratings are taken strictly from this main bird's OWN sub-period
  // under its jama column (sp.birdId === birdId). We NEVER take or average from other birds' sub-periods!
  const birdDatasets = useMemo(() => {
    const result: Record<BirdId, { rawPoints: ChartPoint[]; svgPoints: { x: number; y: number; point: ChartPoint }[] }> = {} as any;

    if (!jamas || jamas.length === 0) return result;

    comparedBirds.forEach((birdId) => {
      const rawPoints: ChartPoint[] = [];

      if (resolution === 'main') {
        // 10 Jamas mode
        jamas.forEach((jama) => {
          const col = jama.columns[birdId];
          if (!col) return;

          // Compute midpoint minute from cycle start
          let startOffset = jama.startMinutesFromMidnight - cycleStartMin;
          if (startOffset < 0) startOffset += 1440;
          let endOffset = jama.endMinutesFromMidnight - cycleStartMin;
          if (endOffset <= 0) endOffset += 1440;
          const midOffset = (startOffset + endOffset) / 2;

          // EXACT CORRECTION: Find this bird's OWN sub-period under its main bird jama column!
          // sp.birdId === birdId is this bird's own sub-period.
          const ownSubPeriod = col.subPeriods.find((sp) => sp.birdId === birdId) || col.subPeriods[0];
          const starVal = ownSubPeriod.star;
          const activityVal = col.mainActivity;

          const yVal = method === 'work' ? getActivityY(activityVal) : getStarY(starVal);

          rawPoints.push({
            x: midOffset,
            yVal,
            actualTime: `${jama.startTime} - ${jama.endTime}`,
            timeRange: `${jama.startTime} - ${jama.endTime}`,
            activity: activityVal,
            star: starVal,
            jamaNumber: jama.jamaNumber,
            birdId,
            startMin: startOffset,
            endMin: endOffset,
            isOwnSubPeriod: true,
          });
        });
      } else {
        // Sub-periods mode: 50 points across the day
        // All 5 sub-periods belong strictly to this main bird's jama (col.subPeriods)
        jamas.forEach((jama) => {
          const col = jama.columns[birdId];
          if (!col) return;

          col.subPeriods.forEach((sp: SubPeriod, subIdx: number) => {
            let startOffset = sp.startMinutesFromMidnight - cycleStartMin;
            if (startOffset < 0) startOffset += 1440;
            let endOffset = sp.endMinutesFromMidnight - cycleStartMin;
            if (endOffset <= 0) endOffset += 1440;
            const midOffset = (startOffset + endOffset) / 2;

            const yVal = method === 'work' ? getActivityY(sp.activity) : getStarY(sp.star);

            rawPoints.push({
              x: midOffset,
              yVal,
              actualTime: `${sp.startTime} - ${sp.endTime}`,
              timeRange: `${sp.startTime} - ${sp.endTime}`,
              activity: sp.activity,
              star: sp.star,
              jamaNumber: jama.jamaNumber,
              subIndex: subIdx + 1,
              subBirdId: sp.birdId,
              birdId,
              startMin: startOffset,
              endMin: endOffset,
              isOwnSubPeriod: sp.birdId === birdId,
            });
          });
        });
      }

      // Sort points by x coordinate
      rawPoints.sort((a, b) => a.x - b.x);

      // Convert raw points to SVG coordinate space using dynamic zoom & pan
      const svgPoints = rawPoints.map((pt) => {
        const svgX = getSvgX(pt.x);
        const svgY = getSvgY(pt.yVal);
        return { x: svgX, y: svgY, point: pt };
      });

      result[birdId] = { rawPoints, svgPoints };
    });

    return result;
  }, [
    comparedBirds,
    jamas,
    resolution,
    method,
    invertWorkOrder,
    invertStarOrder,
    cycleStartMin,
    totalDuration,
    zoomX,
    panX,
    panY,
    zoomY,
    CHART_WIDTH,
    CHART_HEIGHT,
    MARGIN.left,
    MARGIN.top,
  ]);

  // Handle pointer down (initiate Drag or Y-axis swipe)
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const svgScale = SVG_WIDTH / rect.width;
    const scaledX = relativeX * svgScale;

    // Detect if user started drag on the Y-Axis region (left margin)
    const target = scaledX <= MARGIN.left ? 'y-axis' : 'all';

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
      target,
    };
    setIsDragging(true);

    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Handle pointer move (Drag/Swipe Y-axis or Pan X, or Hover scrub)
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDragging && dragStartRef.current) {
      const deltaX = e.clientX - dragStartRef.current.clientX;
      const deltaY = e.clientY - dragStartRef.current.clientY;

      // 1. Swipe Y-axis (Vertical drag)
      const ySensitivity = 1.4 / rect.height;
      const newPanY = Math.max(-0.45, Math.min(0.45, dragStartRef.current.initialPanY + deltaY * ySensitivity));
      setPanY(newPanY);

      // 2. Pan X (Horizontal drag when zoomed)
      if (dragStartRef.current.target === 'all' && zoomX > 1.0) {
        const xSensitivity = visibleDuration / rect.width;
        const maxPanX = Math.max(0, totalDuration * (1 - 1 / zoomX));
        const newPanX = Math.max(0, Math.min(maxPanX, dragStartRef.current.initialPanX - deltaX * xSensitivity));
        setPanX(newPanX);
      }
      return;
    }

    // When not dragging, perform hover scrubbing
    const relativeX = e.clientX - rect.left;
    const svgScale = SVG_WIDTH / rect.width;
    const scaledX = relativeX * svgScale;

    if (scaledX < MARGIN.left || scaledX > MARGIN.left + CHART_WIDTH) {
      setHoveredMinute(null);
      setHoveredPointInfo(null);
      return;
    }

    const minuteFraction = (scaledX - MARGIN.left) / CHART_WIDTH;
    const targetMinute = panX + minuteFraction * visibleDuration;
    setHoveredMinute(targetMinute);

    // Find nearest point for each compared bird
    const matchedPoints: Record<BirdId, ChartPoint> = {} as any;
    comparedBirds.forEach((bId) => {
      const ds = birdDatasets[bId];
      if (ds && ds.rawPoints.length > 0) {
        let best = ds.rawPoints[0];
        let minDiff = Math.abs(best.x - targetMinute);
        for (const pt of ds.rawPoints) {
          const diff = Math.abs(pt.x - targetMinute);
          if (diff < minDiff) {
            minDiff = diff;
            best = pt;
          }
        }
        matchedPoints[bId] = best;
      }
    });

    setHoveredPointInfo({
      minute: targetMinute,
      points: matchedPoints,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerLeave = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    setHoveredMinute(null);
    setHoveredPointInfo(null);
  };

  // Touch pinch-to-zoom support for mobile / Android environment
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartRef.current = { dist, initialZoom: zoomX };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = currentDist / pinchStartRef.current.dist;
      const newZoom = Math.max(1.0, Math.min(4.0, pinchStartRef.current.initialZoom * factor));
      setZoomX(Math.round(newZoom * 10) / 10);
    }
  };

  const handleTouchEnd = () => {
    pinchStartRef.current = null;
  };

  // Mouse wheel zoom / pan handler
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
      const nextZoom = Math.max(1.0, Math.min(4.0, Math.round((zoomX + zoomDelta) * 100) / 100));
      setZoomX(nextZoom);
    } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && zoomX > 1.0) {
      // Horizontal trackpad scroll
      e.preventDefault();
      const maxPanX = Math.max(0, totalDuration * (1 - 1 / zoomX));
      const deltaMin = (e.deltaX / 500) * visibleDuration;
      setPanX((prev) => Math.max(0, Math.min(maxPanX, prev + deltaMin)));
    } else if (e.shiftKey) {
      // Shift+scroll swipes Y-axis
      e.preventDefault();
      const deltaPanY = (e.deltaY / 600);
      setPanY((prev) => Math.max(-0.45, Math.min(0.45, prev - deltaPanY)));
    }
  };

  // Zoom controls helper functions
  const handleZoomIn = () => {
    setZoomX((prev) => Math.min(4.0, Math.round((prev + 0.5) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomX((prev) => Math.max(1.0, Math.round((prev - 0.5) * 10) / 10));
  };

  const handleResetZoomPan = () => {
    setZoomX(1.0);
    setPanX(0);
    setPanY(0);
    setZoomY(1.0);
  };

  // Jama X positions & boundaries
  const jamaBoundaries = useMemo(() => {
    if (!jamas || jamas.length === 0) return [];
    return jamas.map((j) => {
      let offset = j.startMinutesFromMidnight - cycleStartMin;
      if (offset < 0) offset += 1440;
      const x = getSvgX(offset);
      return {
        jamaNumber: j.jamaNumber,
        isDay: j.isDay,
        title: j.title,
        startTime: j.startTime,
        endTime: j.endTime,
        offset,
        x,
      };
    });
  }, [jamas, cycleStartMin, panX, visibleDuration, CHART_WIDTH, MARGIN.left]);

  // Y-axis tick marks
  const yTicks = useMemo(() => {
    if (method === 'work') {
      return workOrder.map((act, idx) => {
        const yNorm = idx / (workOrder.length - 1);
        const yPos = getSvgY(yNorm);
        const details = ACTIVITY_DETAILS[act];
        return {
          id: act,
          labelEn: act,
          labelTa: details?.tamilName.split(' ')[0] || act,
          y: yPos,
          color:
            act === 'Rule'
              ? '#10b981'
              : act === 'Eat'
              ? '#14b8a6'
              : act === 'Walk'
              ? '#f59e0b'
              : act === 'Sleep'
              ? '#818cf8'
              : '#f43f5e',
        };
      });
    } else {
      // Star ratings 1 to 10
      const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const displayRatings = invertStarOrder ? [...ratings].reverse() : ratings;

      return displayRatings.map((rating) => {
        const yNorm = getStarY(rating);
        const yPos = getSvgY(yNorm);
        return {
          id: `star-${rating}`,
          labelEn: `${rating} Star${rating > 1 ? 's' : ''}`,
          labelTa: `${rating} ⭐`,
          y: yPos,
          color: rating >= 8 ? '#10b981' : rating >= 5 ? '#f59e0b' : '#f43f5e',
          rating,
        };
      });
    }
  }, [method, workOrder, invertStarOrder, panY, zoomY, CHART_HEIGHT, MARGIN.top]);

  return (
    <div
      id="pancha-pakshi-activity-chart-view"
      className="bg-[#FAF6EF] dark:bg-slate-900/95 border border-[#D9CFBD] dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-sm space-y-4 select-none transition-colors"
    >
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#D9CFBD] dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{t('chartTitle')}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('chartSubtitle')}
            </p>
          </div>
        </div>

        {/* Quick presets for compared birds */}
        <div className="flex items-center gap-1.5 flex-wrap self-start md:self-auto text-xs">
          <button
            type="button"
            onClick={() => setComparedBirds([selectedBird])}
            id="preset-my-bird-btn"
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              comparedBirds.length === 1 && comparedBirds.includes(selectedBird)
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold'
                : 'bg-[#EFE7DA] dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DBCB] dark:hover:bg-slate-700'
            }`}
          >
            {t('presetMyBird')}
          </button>

          <button
            type="button"
            onClick={() => setComparedBirds(['vulture', 'crow'])}
            id="preset-rulers-btn"
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              comparedBirds.length === 2 && comparedBirds.includes('vulture') && comparedBirds.includes('crow')
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold'
                : 'bg-[#EFE7DA] dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DBCB] dark:hover:bg-slate-700'
            }`}
          >
            {t('presetRulers')}
          </button>

          <button
            type="button"
            onClick={() => setComparedBirds([...ALL_BIRD_IDS])}
            id="preset-all-birds-btn"
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              comparedBirds.length === 5
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold'
                : 'bg-[#EFE7DA] dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-700 hover:bg-[#E5DBCB] dark:hover:bg-slate-700'
            }`}
          >
            {t('presetAll')}
          </button>
        </div>
      </div>

      {/* 2. Interactive Controls Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-[#EFE7DA]/50 dark:bg-slate-950/70 p-3 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-xs">
        {/* Method 1 vs Method 2 Switcher */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'வரைபட முறை (Method)' : 'Chart Method'}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#FAF6EF] dark:bg-slate-900 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMethod('work')}
              id="chart-method-work-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'work'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'முறை 1: தொழில்' : 'Method 1: Work'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('star')}
              id="chart-method-star-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                method === 'star'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'முறை 2: நட்சத்திரம்' : 'Method 2: Stars'}</span>
            </button>
          </div>
        </div>

        {/* Resolution: Main Jama vs Sub-Periods */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'கால அளவு (Period)' : 'Timeline Granularity'}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#FAF6EF] dark:bg-slate-900 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setResolution('main')}
              id="chart-res-main-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                resolution === 'main'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '10 சாமங்கள்' : '10 Jamas'}</span>
            </button>

            <button
              type="button"
              onClick={() => setResolution('sub')}
              id="chart-res-sub-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                resolution === 'sub'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '50 அந்தர்தசை' : '50 Sub-Periods'}</span>
            </button>
          </div>
        </div>

        {/* Curve Type: Smooth Curved Line vs Straight */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'கோட்டு வடிவம்' : 'Line Smoothing'}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#FAF6EF] dark:bg-slate-900 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurveType('smooth')}
              id="chart-curve-smooth-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                curveType === 'smooth'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('curveTypeSmooth')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurveType('straight')}
              id="chart-curve-straight-btn"
              className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                curveType === 'straight'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t('curveTypeStraight')}</span>
            </button>
          </div>
        </div>

        {/* Invert Order Toggle (Method 1: Work Order, Method 2: Star Rating) */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {method === 'work' ? t('invertWorkOrderLabel') : t('invertStarOrderLabel')}
          </label>
          {method === 'work' ? (
            <button
              type="button"
              onClick={() => setInvertWorkOrder(!invertWorkOrder)}
              id="toggle-invert-work-btn"
              className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-between transition-all cursor-pointer ${
                invertWorkOrder
                  ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40'
                  : 'bg-[#FAF6EF] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">
                  {invertWorkOrder
                    ? language === 'ta'
                      ? 'அரசு (மேல்) ⇄ சாவு (கீழ்)'
                      : 'Rule (Top) ⇄ Die (Bottom)'
                    : language === 'ta'
                    ? 'சாவு (மேல்) ⇄ அரசு (கீழ்)'
                    : 'Die (Top) ⇄ Rule (Bottom)'}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#EFE7DA] dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-1">
                {invertWorkOrder ? 'Inverted' : 'Default'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setInvertStarOrder(!invertStarOrder)}
              id="toggle-invert-star-btn"
              className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-between transition-all cursor-pointer ${
                invertStarOrder
                  ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40'
                  : 'bg-[#FAF6EF] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#D9CFBD] dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">
                  {invertStarOrder
                    ? language === 'ta'
                      ? '10 ⭐ (மேல்) ⇄ 1 ⭐ (கீழ்)'
                      : '10 Stars (Top) ⇄ 1 (Bottom)'
                    : language === 'ta'
                    ? '1 ⭐ (மேல்) ⇄ 10 ⭐ (கீழ்)'
                    : '1 Star (Top) ⇄ 10 (Bottom)'}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-1">
                {invertStarOrder ? 'Inverted' : 'Default'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Birds Multi-Toggle Bar & Zoom / Swipe Y Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Bird selection toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('compareBirdsPrompt')}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_BIRD_IDS.map((bId) => {
              const birdInfo = BIRDS[bId];
              const isCompared = comparedBirds.includes(bId);
              const isPrimary = selectedBird === bId;

              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => toggleBirdInCompare(bId)}
                  id={`toggle-chart-bird-${bId}`}
                  className={`py-1.5 px-2 sm:px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer relative ${
                    isCompared
                      ? 'text-slate-950 dark:text-white shadow-xs'
                      : 'bg-[#FAF6EF] dark:bg-slate-900/60 border-[#D9CFBD] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-2xs'
                  }`}
                  style={{
                    backgroundColor: isCompared ? `${birdInfo.color}25` : undefined,
                    borderColor: isCompared ? birdInfo.color : undefined,
                  }}
                  title={birdInfo.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: birdInfo.color }}
                  />
                  <span className="truncate">
                    {getBirdName(bId).split(' ')[0]}
                  </span>
                  {isCompared && (
                    <Check className="w-3 h-3 ml-0.5 shrink-0" style={{ color: birdInfo.color }} />
                  )}
                  {isPrimary && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-950"
                      title="Active Primary Bird"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoom & Swipe Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto text-xs">
          {/* Zoom Level Indicator & Buttons */}
          <div className="flex items-center bg-[#FAF6EF] dark:bg-slate-900 rounded-xl border border-[#D9CFBD] dark:border-slate-800 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomX <= 1.0}
              id="chart-zoom-out-btn"
              aria-label="Zoom Out"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px] min-w-[34px] text-center">
              {zoomX.toFixed(1)}x
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomX >= 4.0}
              id="chart-zoom-in-btn"
              aria-label="Zoom In"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EFE7DA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Zoom Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-[#FAF6EF] dark:bg-slate-900 p-0.5 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-[10px] font-bold shadow-2xs">
            {[1.0, 2.0, 3.0, 4.0].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setZoomX(level)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  zoomX === level
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {level}x
              </button>
            ))}
          </div>

          {/* Swipe Y-Axis Nudge / Helper Pill */}
          <div className="flex items-center gap-1 bg-[#FAF6EF] dark:bg-slate-900 p-1 rounded-xl border border-[#D9CFBD] dark:border-slate-800 text-[11px] shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 px-1 font-semibold">
              <MoveVertical className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">{t('swipeYAxis')}</span>
            </span>
            <button
              type="button"
              onClick={() => setPanY((prev) => Math.max(-0.45, Math.round((prev - 0.1) * 100) / 100))}
              id="swipe-y-up-btn"
              aria-label="Swipe Y Up"
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              title="Shift Y Axis Up"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => setPanY((prev) => Math.min(0.45, Math.round((prev + 0.1) * 100) / 100))}
              id="swipe-y-down-btn"
              aria-label="Swipe Y Down"
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              title="Shift Y Axis Down"
            >
              ▼
            </button>
          </div>

          {/* Reset Zoom & Pan button */}
          {(zoomX > 1.0 || panX > 0 || panY !== 0) && (
            <button
              type="button"
              onClick={handleResetZoomPan}
              id="chart-reset-zoom-pan-btn"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title={t('resetZoom')}
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>{t('resetZoom')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Swipe Y & Zoom instructions banner */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{t('swipeYHelp')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="hidden sm:inline">{t('ownSubPeriodNote')}</span>
        </div>
      </div>

      {/* 4. Main SVG Curved Chart Display Container */}
      <div
        ref={containerRef}
        className={`relative bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto block select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <defs>
            {/* Clip path for the chart plot area */}
            <clipPath id="chart-plot-clip">
              <rect x={MARGIN.left} y={MARGIN.top} width={CHART_WIDTH} height={CHART_HEIGHT} rx="4" />
            </clipPath>

            {/* Clip path for Y-axis label area */}
            <clipPath id="chart-yaxis-clip">
              <rect x={0} y={MARGIN.top - 15} width={MARGIN.left} height={CHART_HEIGHT + 30} />
            </clipPath>

            {/* Gradients for each bird's area fill underneath the curve */}
            {comparedBirds.map((bId) => {
              const birdInfo = BIRDS[bId];
              return (
                <linearGradient
                  key={`gradient-${bId}`}
                  id={`chart-gradient-${bId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={birdInfo.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={birdInfo.color} stopOpacity="0.01" />
                </linearGradient>
              );
            })}

            {/* Day and Night background tint filters */}
            <linearGradient id="day-bg-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="night-bg-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Y-Axis Swipe Strip Visual Cue (Left Margin Area) */}
          <rect
            x={0}
            y={MARGIN.top}
            width={MARGIN.left - 8}
            height={CHART_HEIGHT}
            fill={isDark ? '#090d16' : '#f8fafc'}
            opacity="0.85"
            rx="6"
            className="cursor-ns-resize"
          />
          <g transform={`translate(16, ${MARGIN.top + CHART_HEIGHT / 2})`}>
            <text
              transform="rotate(-90)"
              x="0"
              y="0"
              fill={isDark ? '#475569' : '#94a3b8'}
              fontSize="9"
              fontWeight="bold"
              letterSpacing="2"
              textAnchor="middle"
            >
              ↕ SWIPE Y
            </text>
          </g>

          {/* CLIPPED PLOT CONTENT */}
          <g clipPath="url(#chart-plot-clip)">
            {/* Background: Day Phase (first 720 mins) & Night Phase (second 720 mins) */}
            <rect
              x={getSvgX(0)}
              y={MARGIN.top}
              width={(720 / visibleDuration) * CHART_WIDTH}
              height={CHART_HEIGHT}
              fill="url(#day-bg-tint)"
            />
            <rect
              x={getSvgX(720)}
              y={MARGIN.top}
              width={(720 / visibleDuration) * CHART_WIDTH}
              height={CHART_HEIGHT}
              fill="url(#night-bg-tint)"
            />

            {/* Vertical Grid Lines for each of the 10 Jamas */}
            {jamaBoundaries.map((jb, idx) => (
              <g key={`jama-grid-${idx}`}>
                <line
                  x1={jb.x}
                  y1={MARGIN.top}
                  x2={jb.x}
                  y2={MARGIN.top + CHART_HEIGHT}
                  stroke={jb.isDay ? (isDark ? '#334155' : '#cbd5e1') : (isDark ? '#1e293b' : '#e2e8f0')}
                  strokeWidth={jb.jamaNumber === 6 ? '2.5' : '1'}
                  strokeDasharray={jb.jamaNumber === 6 ? 'none' : '3,3'}
                  strokeOpacity={jb.jamaNumber === 6 ? '0.9' : '0.6'}
                />
              </g>
            ))}

            {/* Horizontal Grid lines (moves along with swiped Y-axis) */}
            {yTicks.map((tick) => (
              <line
                key={`h-grid-${tick.id}`}
                x1={MARGIN.left}
                y1={tick.y}
                x2={MARGIN.left + CHART_WIDTH}
                y2={tick.y}
                stroke={isDark ? '#334155' : '#e2e8f0'}
                strokeWidth="1"
                strokeDasharray="4,4"
                strokeOpacity={isDark ? '0.35' : '0.7'}
              />
            ))}

            {/* Real-time Current Live Moment Line ("NOW") */}
            {currentLiveMinuteInCycle >= 0 && currentLiveMinuteInCycle <= totalDuration && (
              <g>
                <line
                  x1={getSvgX(currentLiveMinuteInCycle)}
                  y1={MARGIN.top}
                  x2={getSvgX(currentLiveMinuteInCycle)}
                  y2={MARGIN.top + CHART_HEIGHT}
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="5,3"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* Render Curve Lines and Filled Areas for each compared bird */}
            {comparedBirds.map((bId) => {
              const ds = birdDatasets[bId];
              if (!ds || ds.svgPoints.length === 0) return null;

              const birdInfo = BIRDS[bId];
              const isSingle = comparedBirds.length === 1;

              const pathD =
                curveType === 'smooth'
                  ? generateCurvedPath(ds.svgPoints)
                  : generateStraightPath(ds.svgPoints);

              const firstPt = ds.svgPoints[0];
              const lastPt = ds.svgPoints[ds.svgPoints.length - 1];
              const areaD = `${pathD} L ${lastPt.x.toFixed(1)} ${MARGIN.top + CHART_HEIGHT} L ${firstPt.x.toFixed(1)} ${
                MARGIN.top + CHART_HEIGHT
              } Z`;

              return (
                <g key={`bird-curve-${bId}`}>
                  {/* Area under curve */}
                  <path d={areaD} fill={`url(#chart-gradient-${bId})`} opacity={isSingle ? 0.9 : 0.45} />

                  {/* Main Curved Line Stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={birdInfo.color}
                    strokeWidth={isSingle ? '3.5' : '2.8'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-150"
                  />

                  {/* Point markers */}
                  {ds.svgPoints.map((pt, pIdx) => {
                    const isHovered =
                      hoveredPointInfo &&
                      hoveredPointInfo.points[bId] &&
                      hoveredPointInfo.points[bId].x === pt.point.x;

                    return (
                      <g key={`pt-${bId}-${pIdx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6.5 : resolution === 'main' ? 4.5 : 2.8}
                          fill={birdInfo.color}
                          stroke={isDark ? '#0f172a' : '#ffffff'}
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className="transition-all cursor-pointer"
                        />
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={11}
                            fill="none"
                            stroke={birdInfo.color}
                            strokeWidth="1.8"
                            opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Hover Scrubbing Vertical Guide Line */}
            {hoveredMinute !== null && (
              <line
                x1={getSvgX(hoveredMinute)}
                y1={MARGIN.top}
                x2={getSvgX(hoveredMinute)}
                y2={MARGIN.top + CHART_HEIGHT}
                stroke={isDark ? '#ffffff' : '#0f172a'}
                strokeWidth="1.5"
                strokeDasharray="2,2"
                opacity="0.75"
              />
            )}
          </g>

          {/* NON-CLIPPED HEADERS, AXES & LABELS */}

          {/* Day / Night phase labels & icons */}
          <g className="text-[11px] font-bold">
            <g transform={`translate(${MARGIN.left + 15}, ${MARGIN.top - 14})`}>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <text x="18" y="10" fill={isDark ? '#f59e0b' : '#b45309'} fontSize="11" fontWeight="bold">
                {t('dayCycleLabel')} ({sunriseTime} - {sunsetTime})
              </text>
            </g>

            <g transform={`translate(${MARGIN.left + CHART_WIDTH / 2 + 15}, ${MARGIN.top - 14})`}>
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <text x="18" y="10" fill={isDark ? '#818cf8' : '#4f46e5'} fontSize="11" fontWeight="bold">
                {t('nightCycleLabel')} ({sunsetTime} - {nextSunriseTime})
              </text>
            </g>
          </g>

          {/* Current Live Moment Badge ("NOW") */}
          {currentLiveMinuteInCycle >= panX && currentLiveMinuteInCycle <= panX + visibleDuration && (
            <g transform={`translate(${getSvgX(currentLiveMinuteInCycle)}, ${MARGIN.top - 14})`}>
              <circle cx="0" cy="0" r="4" fill="#0284c7" />
              <rect
                x="-18"
                y="-16"
                width="36"
                height="14"
                rx="4"
                fill={isDark ? '#0369a1' : '#0284c7'}
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-6"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                NOW
              </text>
            </g>
          )}

          {/* Y-Axis Label Box on Left (Moving smoothly with swiped Y-axis) */}
          <g clipPath="url(#chart-yaxis-clip)">
            {yTicks.map((tick) => (
              <g key={`y-label-${tick.id}`} transform={`translate(${MARGIN.left - 12}, ${tick.y + 4})`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="end"
                  fill={tick.color}
                  fontSize={method === 'work' ? '12' : '11'}
                  fontWeight="bold"
                  className="cursor-ns-resize"
                >
                  {language === 'ta' ? tick.labelTa : tick.labelEn}
                </text>
              </g>
            ))}
          </g>

          {/* Bottom X-Axis Jama and Time ticks */}
          {jamaBoundaries.map((jb, idx) => {
            if (jb.x < MARGIN.left - 20 || jb.x > MARGIN.left + CHART_WIDTH + 20) return null;
            return (
              <g key={`jama-lbl-${idx}`}>
                {/* Jama Number marker */}
                <text
                  x={jb.x + ((72 / visibleDuration) * CHART_WIDTH)}
                  y={MARGIN.top + CHART_HEIGHT + 18}
                  fill={isDark ? '#94a3b8' : '#475569'}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  J{jb.jamaNumber}
                </text>
                {/* Time tick */}
                <text
                  x={jb.x}
                  y={MARGIN.top + CHART_HEIGHT + 35}
                  fill={isDark ? '#64748b' : '#94a3b8'}
                  fontSize="9"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {jb.startTime}
                </text>
              </g>
            );
          })}

          {/* Final end boundary time label */}
          {getSvgX(1440) >= MARGIN.left && getSvgX(1440) <= MARGIN.left + CHART_WIDTH + 20 && (
            <text
              x={getSvgX(1440)}
              y={MARGIN.top + CHART_HEIGHT + 35}
              fill={isDark ? '#64748b' : '#94a3b8'}
              fontSize="9"
              fontWeight="500"
              textAnchor="middle"
            >
              {nextSunriseTime}
            </text>
          )}
        </svg>

        {/* 5. Rich Floating Tooltip */}
        {hoveredPointInfo && (
          <div className="absolute top-2 right-2 max-w-xs bg-[#FAF6EF]/95 dark:bg-slate-900/95 backdrop-blur-md border border-[#D9CFBD] dark:border-slate-700/90 rounded-xl p-3 shadow-2xl space-y-2 pointer-events-none animate-fadeIn text-xs z-30">
            {/* Header: Time and Period */}
            <div className="flex items-center justify-between gap-2 border-b border-[#D9CFBD] dark:border-slate-800 pb-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {Object.values(hoveredPointInfo.points)[0]?.timeRange || ''}
                </span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EFE7DA] dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Jama {Object.values(hoveredPointInfo.points)[0]?.jamaNumber}
                {Object.values(hoveredPointInfo.points)[0]?.subIndex
                  ? ` · Sub ${Object.values(hoveredPointInfo.points)[0]?.subIndex}`
                  : ''}
              </span>
            </div>

            {/* List of values for each compared bird */}
            <div className="space-y-1.5">
              {comparedBirds.map((bId) => {
                const pt = hoveredPointInfo.points[bId];
                if (!pt) return null;
                const birdInfo = BIRDS[bId];

                return (
                  <div
                    key={`tip-${bId}`}
                    className="p-1.5 rounded-lg bg-[#EFE7DA]/50 dark:bg-slate-950/70 border border-[#D9CFBD] dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: birdInfo.color }}
                      />
                      <span className="font-bold text-slate-900 dark:text-slate-200 text-[11px]">
                        {getBirdName(bId).split(' ')[0]}
                      </span>
                      {pt.isOwnSubPeriod && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                          Own
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Activity Badge */}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor:
                            pt.activity === 'Rule'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : pt.activity === 'Eat'
                              ? 'rgba(20, 184, 166, 0.2)'
                              : pt.activity === 'Walk'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : pt.activity === 'Sleep'
                              ? 'rgba(129, 140, 248, 0.2)'
                              : 'rgba(244, 63, 94, 0.2)',
                          color:
                            pt.activity === 'Rule'
                              ? '#059669'
                              : pt.activity === 'Eat'
                              ? '#0d9488'
                              : pt.activity === 'Walk'
                              ? '#d97706'
                              : pt.activity === 'Sleep'
                              ? '#6366f1'
                              : '#e11d48',
                        }}
                      >
                        {getActivityName(pt.activity)}
                      </span>

                      {/* Star Rating Badge (from own sub-period under main jama) */}
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{pt.star}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Mini 24-Hour Scrub Bar (Shows when zoomed in) */}
      {zoomX > 1.0 && (
        <div className="bg-[#FAF6EF] dark:bg-slate-950 p-2.5 rounded-xl border border-[#D9CFBD] dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">24-Hour Timeline Scrub:</span>
            <span>
              {language === 'ta' ? 'காட்சி நேரம்:' : 'Visible Window:'}{' '}
              <strong className="text-amber-700 dark:text-amber-300 font-mono">
                {Math.round(visibleDuration / 60)} hrs ({Math.round(panX / 60)}h - {Math.round((panX + visibleDuration) / 60)}h)
              </strong>
            </span>
          </div>

          <div
            className="relative h-6 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const frac = clickX / rect.width;
              const targetCenter = frac * totalDuration;
              const maxPanX = Math.max(0, totalDuration * (1 - 1 / zoomX));
              const newPan = Math.max(0, Math.min(maxPanX, targetCenter - visibleDuration / 2));
              setPanX(newPan);
            }}
          >
            {/* 10 Jamas mini ticks */}
            <div className="absolute inset-0 grid grid-cols-10 divide-x divide-slate-200 dark:divide-slate-800 pointer-events-none opacity-40">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-center text-[8px] font-mono text-slate-500 dark:text-slate-400">
                  J{idx + 1}
                </div>
              ))}
            </div>

            {/* Draggable Visible Box */}
            <div
              className="absolute top-0 bottom-0 bg-amber-500/25 border-2 border-amber-500 dark:border-amber-400 rounded-md transition-all pointer-events-none"
              style={{
                left: `${(panX / totalDuration) * 100}%`,
                width: `${(visibleDuration / totalDuration) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Chart Legend & Informative Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 dark:text-slate-500 font-semibold">{t('clickToPinNotice')}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {comparedBirds.map((bId) => {
            const b = BIRDS[bId];
            return (
              <div key={`legend-${bId}`} className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span style={{ color: b.color }}>{getBirdName(bId)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

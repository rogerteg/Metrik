import { useMemo } from 'react';
import { CfdDataPoint } from '../../../types/analytics';
import { ColumnModel, getDefaultColumnColor } from '../../../types/kanban';
import {
  calculateHorizontalLeadTime,
  detectQueueExpansion,
  getPointValue,
} from '../../../utils/cfdMetrics';

export interface CfdCoord {
  x: number;
  yDone: number;
  yStarted: number;
  yTotal: number;
  stageY: Record<string, number>;
  data: CfdDataPoint;
}

export interface StagePolygon {
  col: ColumnModel;
  color: string;
  points: string;
  strokeLine: string;
  cumValueName: string;
}

export interface CfdInspectionData {
  topY: number;
  bottomY: number;
  wipCount: number;
  leadTimeDays: number;
  startX: number;
  endX: number;
  stageTitle: string;
  isExpanding: boolean;
}

export interface UseCfdPlotCoordinatesParams {
  data: CfdDataPoint[];
  maxTotal: number;
  columns?: ColumnModel[];
  visibleColumnIds: Set<string>;
  scrubberRange: { start: number; end: number };
  hoverIndex: number | null;
  isExpanded: boolean;
}

export const getColumnColor = (col: ColumnModel): string => {
  return getDefaultColumnColor(col);
};

export function useCfdPlotCoordinates({
  data,
  maxTotal,
  columns,
  visibleColumnIds,
  scrubberRange,
  hoverIndex,
  isExpanded,
}: UseCfdPlotCoordinatesParams) {
  const activeColumns = useMemo(() => {
    if (!columns || columns.length === 0) return undefined;
    return columns.filter((col) => visibleColumnIds.has(col.id));
  }, [columns, visibleColumnIds]);

  const displayedData = useMemo(() => {
    if (data.length < 4) return data;
    const s = Math.max(0, Math.min(scrubberRange.start, data.length - 1));
    const e = Math.max(s, Math.min(scrubberRange.end, data.length - 1));
    return data.slice(s, e + 1);
  }, [data, scrubberRange]);

  const viewBoxWidth = 600;
  const viewBoxHeight = isExpanded ? 340 : 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 35;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;
  const yBaseline = paddingTop + plotHeight;

  const pointCount = displayedData.length;
  const safeMax = Math.max(1, maxTotal);

  const effectiveColumns = activeColumns || columns;
  const hasDynamicStages = Boolean(
    effectiveColumns && effectiveColumns.length > 0 && displayedData[0]?.stageCounts,
  );

  const coords: CfdCoord[] = useMemo(() => {
    return displayedData.map((d, i) => {
      const x =
        pointCount > 1
          ? paddingLeft + (i / (pointCount - 1)) * plotWidth
          : paddingLeft + plotWidth / 2;

      const yDone = yBaseline - (d.cumulativeDone / safeMax) * plotHeight;
      const yStarted = yBaseline - (d.cumulativeStarted / safeMax) * plotHeight;
      const yTotal = yBaseline - (d.total / safeMax) * plotHeight;

      const stageY: Record<string, number> = {};
      if (hasDynamicStages && effectiveColumns && d.cumulativeStages) {
        effectiveColumns.forEach((col) => {
          const cumVal = d.cumulativeStages?.[col.id] || 0;
          stageY[col.id] = yBaseline - (cumVal / safeMax) * plotHeight;
        });
      }

      return { x, yDone, yStarted, yTotal, stageY, data: d };
    });
  }, [
    displayedData,
    pointCount,
    plotWidth,
    paddingLeft,
    yBaseline,
    safeMax,
    plotHeight,
    hasDynamicStages,
    effectiveColumns,
  ]);

  const stagePolygons: StagePolygon[] | null = useMemo(() => {
    if (!hasDynamicStages || !effectiveColumns) return null;

    return effectiveColumns.map((col, idx) => {
      const color = getColumnColor(col);
      const isLastCol = idx === effectiveColumns.length - 1;
      const nextCol = !isLastCol ? effectiveColumns[idx + 1] : null;

      const topPoints = coords.map((c) => `${c.x},${c.stageY[col.id]}`);
      const bottomPoints = [...coords].reverse().map((c) => {
        const yBottom = nextCol ? c.stageY[nextCol.id] : yBaseline;
        return `${c.x},${yBottom}`;
      });

      const points = `${topPoints.join(' ')} ${bottomPoints.join(' ')}`;
      const strokeLine = topPoints.join(' ');

      return {
        col,
        color,
        points,
        strokeLine,
        cumValueName: col.id,
      };
    });
  }, [hasDynamicStages, effectiveColumns, coords, yBaseline]);

  const donePoints = useMemo(() => {
    if (coords.length === 0) return '';
    return [
      `${coords[0].x},${yBaseline}`,
      ...coords.map((c) => `${c.x},${c.yDone}`),
      `${coords[coords.length - 1].x},${yBaseline}`,
    ].join(' ');
  }, [coords, yBaseline]);

  const progressPoints = useMemo(() => {
    if (coords.length === 0) return '';
    return [
      `${coords[0].x},${coords[0].yDone}`,
      ...coords.map((c) => `${c.x},${c.yStarted}`),
      ...[...coords].reverse().map((c) => `${c.x},${c.yDone}`),
    ].join(' ');
  }, [coords]);

  const todoPoints = useMemo(() => {
    if (coords.length === 0) return '';
    return [
      `${coords[0].x},${coords[0].yStarted}`,
      ...coords.map((c) => `${c.x},${c.yTotal}`),
      ...[...coords].reverse().map((c) => `${c.x},${c.yStarted}`),
    ].join(' ');
  }, [coords]);

  const lineTotal = useMemo(() => coords.map((c) => `${c.x},${c.yTotal}`).join(' '), [coords]);
  const lineStarted = useMemo(() => coords.map((c) => `${c.x},${c.yStarted}`).join(' '), [coords]);
  const lineDone = useMemo(() => coords.map((c) => `${c.x},${c.yDone}`).join(' '), [coords]);

  const activeCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  const inspection: CfdInspectionData | null = useMemo(() => {
    if (!activeCoord || hoverIndex === null || pointCount <= 1) return null;

    let topY = activeCoord.yStarted;
    let bottomY = activeCoord.yDone;
    let stageTitle = 'Em Progresso';
    let arrivalKey = 'cumulativeStarted';
    let departureKey = 'cumulativeDone';
    let wipCount = activeCoord.data.inProgress;

    if (hasDynamicStages && effectiveColumns && effectiveColumns.length > 1) {
      const progressCol =
        effectiveColumns.find((c) => c.category === 'in_progress') || effectiveColumns[1];
      const doneCol =
        effectiveColumns.find((c) => c.category === 'done') ||
        effectiveColumns[effectiveColumns.length - 1];

      if (progressCol && doneCol) {
        topY = activeCoord.stageY[progressCol.id] || topY;
        bottomY = activeCoord.stageY[doneCol.id] || bottomY;
        stageTitle = progressCol.title;
        arrivalKey = progressCol.id;
        departureKey = doneCol.id;
        wipCount = activeCoord.data.stageCounts?.[progressCol.id] || 0;
      }
    }

    const leadTimeDays = calculateHorizontalLeadTime(
      displayedData,
      hoverIndex,
      arrivalKey,
      departureKey,
    );

    const departureVal = getPointValue(activeCoord.data, departureKey);
    let arrivalIndex = -1;
    if (departureVal > 0) {
      for (let i = 0; i <= hoverIndex; i++) {
        const val = getPointValue(displayedData[i], arrivalKey);
        if (val >= departureVal) {
          arrivalIndex = i;
          break;
        }
      }
    }

    let startX = activeCoord.x;
    if (arrivalIndex !== -1 && coords[arrivalIndex]) {
      startX = coords[arrivalIndex].x;
    }

    const isExpanding = detectQueueExpansion(displayedData, arrivalKey, departureKey);

    return {
      topY,
      bottomY,
      wipCount,
      leadTimeDays,
      startX,
      endX: activeCoord.x,
      stageTitle,
      isExpanding,
    };
  }, [
    activeCoord,
    hoverIndex,
    pointCount,
    displayedData,
    hasDynamicStages,
    effectiveColumns,
    coords,
  ]);

  return {
    activeColumns,
    effectiveColumns,
    displayedData,
    viewBoxWidth,
    viewBoxHeight,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotWidth,
    plotHeight,
    yBaseline,
    pointCount,
    safeMax,
    hasDynamicStages,
    coords,
    stagePolygons,
    donePoints,
    progressPoints,
    todoPoints,
    lineTotal,
    lineStarted,
    lineDone,
    activeCoord,
    inspection,
  };
}

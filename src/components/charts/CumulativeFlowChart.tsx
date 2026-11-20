import React, { useState, useRef, useEffect } from 'react';
import { CfdDataPoint } from '../../types/analytics';
import { ColumnModel } from '../../types/kanban';
import { CfdFilterDrawer } from './CfdFilterDrawer';
import { CfdTimelineScrubber } from './CfdTimelineScrubber';
import { useCfdPlotCoordinates } from './cfd/useCfdPlotCoordinates';
import { CfdLegend } from './cfd/CfdLegend';
import { CfdInspectionOverlay } from './cfd/CfdInspectionOverlay';
import { CfdAxesLabels } from './cfd/CfdAxesLabels';
import { CfdTooltip } from './cfd/CfdTooltip';

export interface CumulativeFlowChartProps {
  data: CfdDataPoint[];
  maxTotal: number;
  isEmpty?: boolean;
  columns?: ColumnModel[];
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  onFilterDateRange?: (startDate: string, endDate: string) => void;
  onResetDateFilter?: () => void;
}

export const CumulativeFlowChart: React.FC<CumulativeFlowChartProps> = ({
  data,
  maxTotal,
  isEmpty = false,
  columns,
  onToggleExpand,
  isExpanded = false,
  onFilterDateRange,
  onResetDateFilter,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<Set<string>>(() => {
    return new Set(columns ? columns.map((c) => c.id) : []);
  });

  const [scrubberRange, setScrubberRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: Math.max(0, data.length - 1),
  });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setScrubberRange({
      start: 0,
      end: Math.max(0, data.length - 1),
    });
  }, [data.length]);

  const handleToggleColumnVisibility = (colId: string) => {
    setVisibleColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        if (next.size > 1) {
          next.delete(colId);
        }
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const {
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
    hasDynamicStages,
    stagePolygons,
    donePoints,
    progressPoints,
    todoPoints,
    lineTotal,
    lineStarted,
    lineDone,
    activeCoord,
    inspection,
  } = useCfdPlotCoordinates({
    data,
    maxTotal,
    columns,
    visibleColumnIds,
    scrubberRange,
    hoverIndex,
    isExpanded,
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || pointCount <= 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * viewBoxWidth;

    const relativeX = Math.max(0, Math.min(plotWidth, svgX - paddingLeft));
    const index = Math.round((relativeX / plotWidth) * (pointCount - 1));
    setHoverIndex(Math.max(0, Math.min(pointCount - 1, index)));
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div
      className={`chart-container cfd-advanced-container ${isExpanded ? 'is-chart-expanded' : ''}`}
      data-testid="cfd-advanced-container"
    >
      <div
        className="chart-header-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CfdFilterDrawer
            isOpen={isFilterOpen}
            onToggleOpen={() => setIsFilterOpen((prev) => !prev)}
            startDate={data[0]?.date || ''}
            endDate={data[data.length - 1]?.date || ''}
            onApplyDateFilter={(s, e) => {
              if (onFilterDateRange) onFilterDateRange(s, e);
              setIsFilterOpen(false);
            }}
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            onToggleColumnVisibility={handleToggleColumnVisibility}
            onResetFilters={() => {
              if (onResetDateFilter) onResetDateFilter();
              setVisibleColumnIds(new Set(columns ? columns.map((c) => c.id) : []));
              setIsFilterOpen(false);
            }}
          />

          <div>
            <h3 className="chart-title" style={{ margin: 0 }}>
              Diagrama de Fluxo Cumulativo (CFD)
            </h3>
            <span className="scatter-subtitle">
              Inspeção dual de WIP e Lead Time com identificação de gargalos
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleExpand && (
            <button
              type="button"
              className="btn-chart-expand"
              onClick={onToggleExpand}
              title={isExpanded ? 'Restaurar tamanho' : 'Expandir gráfico'}
              aria-label={isExpanded ? 'Restaurar gráfico CFD' : 'Expandir gráfico CFD'}
            >
              {isExpanded ? '✕ Fechar' : '⛶ Expandir'}
            </button>
          )}
        </div>
      </div>

      <CfdLegend hasDynamicStages={hasDynamicStages} effectiveColumns={effectiveColumns} />

      <div className="chart-y-axis-label">Total de Tarefas Acumuladas</div>

      <div className="cfd-chart-area" style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="cfd-svg"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-testid="cfd-svg"
        >
          <defs>
            <linearGradient id="cfd-grad-todo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="cfd-grad-progress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cfd-grad-done" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
            <marker
              id="arrow-left"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 10 0 L 0 5 L 10 10 z" fill="#ef4444" />
            </marker>
            <marker
              id="arrow-right"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Grid Lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={viewBoxWidth - paddingRight}
            y2={paddingTop}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + plotHeight / 2}
            x2={viewBoxWidth - paddingRight}
            y2={paddingTop + plotHeight / 2}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingLeft}
            y1={yBaseline}
            x2={viewBoxWidth - paddingRight}
            y2={yBaseline}
            stroke="rgba(255,255,255,0.2)"
          />

          {/* Stacked Areas */}
          {!isEmpty && (
            <>
              {hasDynamicStages && stagePolygons ? (
                stagePolygons.map((sp) => (
                  <g key={sp.col.id}>
                    <polygon
                      points={sp.points}
                      fill={sp.color}
                      fillOpacity="0.4"
                      data-testid={`cfd-polygon-${sp.col.id}`}
                    />
                    <polyline
                      points={sp.strokeLine}
                      fill="none"
                      stroke={sp.color}
                      strokeWidth="2"
                    />
                  </g>
                ))
              ) : (
                <>
                  <polygon points={todoPoints} fill="url(#cfd-grad-todo)" />
                  <polygon points={progressPoints} fill="url(#cfd-grad-progress)" />
                  <polygon points={donePoints} fill="url(#cfd-grad-done)" />

                  <polyline points={lineTotal} fill="none" stroke="#818cf8" strokeWidth="2" />
                  <polyline points={lineStarted} fill="none" stroke="#fbbf24" strokeWidth="2" />
                  <polyline points={lineDone} fill="none" stroke="#34d399" strokeWidth="2" />
                </>
              )}
            </>
          )}

          {/* Inspeção Dual Interativa */}
          {inspection && activeCoord && !isEmpty && (
            <CfdInspectionOverlay
              inspection={inspection}
              activeCoord={activeCoord}
              paddingTop={paddingTop}
              paddingLeft={paddingLeft}
              yBaseline={yBaseline}
            />
          )}

          {/* Transparent interaction overlay */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
          />
        </svg>

        <CfdAxesLabels
          maxTotal={maxTotal}
          plotHeight={plotHeight}
          viewBoxHeight={viewBoxHeight}
          paddingBottom={paddingBottom}
          paddingLeft={paddingLeft}
          paddingRight={paddingRight}
          viewBoxWidth={viewBoxWidth}
          displayedData={displayedData}
        />

        {activeCoord && (
          <CfdTooltip
            activeCoord={activeCoord}
            viewBoxWidth={viewBoxWidth}
            hasDynamicStages={hasDynamicStages}
            effectiveColumns={effectiveColumns}
          />
        )}

        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              pointerEvents: 'none',
            }}
          >
            Nenhuma tarefa registrada no período
          </div>
        )}
      </div>

      {!isEmpty && data.length >= 4 && (
        <CfdTimelineScrubber
          data={data}
          maxTotal={maxTotal}
          startIndex={scrubberRange.start}
          endIndex={scrubberRange.end}
          onChangeRange={(start, end) => setScrubberRange({ start, end })}
        />
      )}
    </div>
  );
};

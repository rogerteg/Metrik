import React, { useState, useRef } from 'react';
import { CfdDataPoint } from '../../types/analytics';

interface CumulativeFlowChartProps {
  data: CfdDataPoint[];
  maxTotal: number;
  isEmpty?: boolean;
}

export const CumulativeFlowChart: React.FC<CumulativeFlowChartProps> = ({
  data,
  maxTotal,
  isEmpty = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const viewBoxWidth = 600;
  const viewBoxHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const plotWidth = viewBoxWidth - paddingLeft - paddingRight;
  const plotHeight = viewBoxHeight - paddingTop - paddingBottom;
  const yBaseline = paddingTop + plotHeight;

  const pointCount = data.length;

  const coords = data.map((d, i) => {
    const x = pointCount > 1 
      ? paddingLeft + (i / (pointCount - 1)) * plotWidth
      : paddingLeft + plotWidth / 2;

    const safeMax = Math.max(1, maxTotal);

    const yDone = yBaseline - (d.cumulativeDone / safeMax) * plotHeight;
    const yStarted = yBaseline - (d.cumulativeStarted / safeMax) * plotHeight;
    const yTotal = yBaseline - (d.total / safeMax) * plotHeight;

    return { x, yDone, yStarted, yTotal, data: d };
  });

  // Polygons
  // 1. Done Area (from baseline up to yDone)
  const donePoints = coords.length > 0 ? [
    `${coords[0].x},${yBaseline}`,
    ...coords.map((c) => `${c.x},${c.yDone}`),
    `${coords[coords.length - 1].x},${yBaseline}`,
  ].join(' ') : '';

  // 2. In Progress Area (between yDone and yStarted)
  const progressPoints = coords.length > 0 ? [
    ...coords.map((c) => `${c.x},${c.yStarted}`),
    ...[...coords].reverse().map((c) => `${c.x},${c.yDone}`),
  ].join(' ') : '';

  // 3. Todo Area (between yStarted and yTotal)
  const todoPoints = coords.length > 0 ? [
    ...coords.map((c) => `${c.x},${c.yTotal}`),
    ...[...coords].reverse().map((c) => `${c.x},${c.yStarted}`),
  ].join(' ') : '';

  // Lines
  const lineTotal = coords.map((c) => `${c.x},${c.yTotal}`).join(' ');
  const lineStarted = coords.map((c) => `${c.x},${c.yStarted}`).join(' ');
  const lineDone = coords.map((c) => `${c.x},${c.yDone}`).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normalizedX = (clientX / rect.width) * viewBoxWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - normalizedX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeCoord = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="chart-container cfd-chart-container" style={{ position: 'relative' }}>
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Diagrama de Fluxo Cumulativo (CFD)</h3>
        
        {/* Legend */}
        <div className="cfd-legend" style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1', display: 'inline-block' }} />
            <span>A Fazer (Backlog)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b', display: 'inline-block' }} />
            <span>Em Progresso (WIP)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981', display: 'inline-block' }} />
            <span>Concluído</span>
          </div>
        </div>
      </div>

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
          </defs>

          {/* Grid Lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={viewBoxWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + plotHeight / 2} x2={viewBoxWidth - paddingRight} y2={paddingTop + plotHeight / 2} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={yBaseline} x2={viewBoxWidth - paddingRight} y2={yBaseline} stroke="rgba(255,255,255,0.2)" />

          {/* Stacked Areas */}
          {!isEmpty && (
            <>
              {/* Todo Area */}
              <polygon points={todoPoints} fill="url(#cfd-grad-todo)" />
              {/* In Progress Area */}
              <polygon points={progressPoints} fill="url(#cfd-grad-progress)" />
              {/* Done Area */}
              <polygon points={donePoints} fill="url(#cfd-grad-done)" />

              {/* Boundary Stroke Lines */}
              <polyline points={lineTotal} fill="none" stroke="#818cf8" strokeWidth="2" />
              <polyline points={lineStarted} fill="none" stroke="#fbbf24" strokeWidth="2" />
              <polyline points={lineDone} fill="none" stroke="#34d399" strokeWidth="2" />
            </>
          )}

          {/* Interactive Hover Indicator */}
          {activeCoord && !isEmpty && (
            <g className="cfd-hover-indicator">
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={yBaseline}
                stroke="rgba(255, 255, 255, 0.6)"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <circle cx={activeCoord.x} cy={activeCoord.yTotal} r="4" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={activeCoord.x} cy={activeCoord.yStarted} r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={activeCoord.x} cy={activeCoord.yDone} r="4" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
            </g>
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

        {/* Y-Axis HTML Labels */}
        <div className="chart-grid-lines" style={{ pointerEvents: 'none' }}>
          <div className="grid-line" style={{ bottom: `${(plotHeight / viewBoxHeight) * 100}%` }}>
            <span className="grid-line-label">{maxTotal}</span>
          </div>
          <div className="grid-line" style={{ bottom: `${((plotHeight / 2) / viewBoxHeight) * 100}%` }}>
            <span className="grid-line-label">{Math.round(maxTotal / 2)}</span>
          </div>
          <div className="grid-line" style={{ bottom: `${(paddingBottom / viewBoxHeight) * 100}%` }}>
            <span className="grid-line-label">0</span>
          </div>
        </div>

        {/* X-Axis HTML Labels */}
        {data.length > 0 && (
          <div
            className="scatter-x-axis"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft: `${(paddingLeft / viewBoxWidth) * 100}%`,
              paddingRight: `${(paddingRight / viewBoxWidth) * 100}%`,
              marginTop: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{data[0].date}</span>
            <span>{data[Math.floor(data.length / 2)].date}</span>
            <span>{data[data.length - 1].date}</span>
          </div>
        )}

        {/* Floating Tooltip Card */}
        {activeCoord && (
          <div
            className="cfd-tooltip"
            style={{
              position: 'absolute',
              top: '12px',
              left: activeCoord.x > viewBoxWidth / 2 ? 'auto' : `${(activeCoord.x / viewBoxWidth) * 100 + 3}%`,
              right: activeCoord.x > viewBoxWidth / 2 ? `${100 - (activeCoord.x / viewBoxWidth) * 100 + 3}%` : 'auto',
              background: 'rgba(23, 23, 23, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              minWidth: '150px'
            }}
          >
            <div style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px' }}>
              📅 {activeCoord.data.date}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#818cf8', marginBottom: '2px' }}>
              <span>A Fazer:</span>
              <strong>{activeCoord.data.todo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', marginBottom: '2px' }}>
              <span>Em Progresso:</span>
              <strong>{activeCoord.data.inProgress}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '4px' }}>
              <span>Concluído:</span>
              <strong>{activeCoord.data.done}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '4px', fontWeight: 600 }}>
              <span>Total no Sistema:</span>
              <span>{activeCoord.data.total}</span>
            </div>
          </div>
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
              pointerEvents: 'none'
            }}
          >
            Nenhuma tarefa registrada no período
          </div>
        )}
      </div>
    </div>
  );
};

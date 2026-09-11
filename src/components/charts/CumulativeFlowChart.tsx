import React, { useState, useRef, useMemo } from 'react';
import { CfdDataPoint } from '../../types/analytics';
import { ColumnModel, getDefaultColumnColor } from '../../types/kanban';
import { calculateHorizontalLeadTime, detectQueueExpansion, getPointValue } from '../../utils/cfdMetrics';
import { CfdFilterDrawer } from './CfdFilterDrawer';
import { CfdTimelineScrubber } from './CfdTimelineScrubber';

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

const getColumnColor = (col: ColumnModel): string => {
  return getDefaultColumnColor(col);
};

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

  // Timeline zoom range (índices dentro de `data`)
  const [scrubberRange, setScrubberRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: Math.max(0, data.length - 1),
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Sincronizar limites do scrubber caso a quantidade de dados mude
  React.useEffect(() => {
    setScrubberRange({
      start: 0,
      end: Math.max(0, data.length - 1),
    });
  }, [data.length]);

  // Se o usuário selecionou colunas visíveis
  const activeColumns = useMemo(() => {
    if (!columns || columns.length === 0) return undefined;
    return columns.filter((col) => visibleColumnIds.has(col.id));
  }, [columns, visibleColumnIds]);

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

  // Dados com zoom aplicados pelo scrubber
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

  // Se colunas foram fornecidas, usamos as etapas completas do board
  const effectiveColumns = activeColumns || columns;
  const hasDynamicStages = Boolean(effectiveColumns && effectiveColumns.length > 0 && displayedData[0]?.stageCounts);

  // Mapeamento de coordenadas
  const coords = displayedData.map((d, i) => {
    const x = pointCount > 1 
      ? paddingLeft + (i / (pointCount - 1)) * plotWidth
      : paddingLeft + plotWidth / 2;

    const yDone = yBaseline - (d.cumulativeDone / safeMax) * plotHeight;
    const yStarted = yBaseline - (d.cumulativeStarted / safeMax) * plotHeight;
    const yTotal = yBaseline - (d.total / safeMax) * plotHeight;

    // Se temos estágios dinâmicos, computamos o Y para cada coluna
    const stageY: Record<string, number> = {};
    if (hasDynamicStages && effectiveColumns && d.cumulativeStages) {
      effectiveColumns.forEach((col) => {
        const cumVal = d.cumulativeStages?.[col.id] || 0;
        stageY[col.id] = yBaseline - (cumVal / safeMax) * plotHeight;
      });
    }

    return { x, yDone, yStarted, yTotal, stageY, data: d };
  });

  // Polígonos dinâmicos por etapa (da direita para a esquerda)
  const stagePolygons = hasDynamicStages && effectiveColumns ? effectiveColumns.map((col, idx) => {
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
  }) : null;

  // Fallback para os 3 estágios padrão
  const donePoints = coords.length > 0 ? [
    `${coords[0].x},${yBaseline}`,
    ...coords.map((c) => `${c.x},${c.yDone}`),
    `${coords[coords.length - 1].x},${yBaseline}`,
  ].join(' ') : '';

  const progressPoints = coords.length > 0 ? [
    `${coords[0].x},${coords[0].yDone}`,
    ...coords.map((c) => `${c.x},${c.yStarted}`),
    ...[...coords].reverse().map((c) => `${c.x},${c.yDone}`),
  ].join(' ') : '';

  const todoPoints = coords.length > 0 ? [
    `${coords[0].x},${coords[0].yStarted}`,
    ...coords.map((c) => `${c.x},${c.yTotal}`),
    ...[...coords].reverse().map((c) => `${c.x},${c.yStarted}`),
  ].join(' ') : '';

  const lineTotal = coords.map((c) => `${c.x},${c.yTotal}`).join(' ');
  const lineStarted = coords.map((c) => `${c.x},${c.yStarted}`).join(' ');
  const lineDone = coords.map((c) => `${c.x},${c.yDone}`).join(' ');

  // Interação do mouse para inspeção contínua
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

  const activeCoord = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  // Inspeção Dual de Fluxo: Medições de WIP vertical e Lead Time horizontal
  const inspection = useMemo(() => {
    if (!activeCoord || hoverIndex === null || pointCount <= 1) return null;

    // Se temos colunas dinâmicas, focamos na etapa em andamento (in_progress)
    let topY = activeCoord.yStarted;
    let bottomY = activeCoord.yDone;
    let stageTitle = 'Em Progresso';
    let arrivalKey = 'cumulativeStarted';
    let departureKey = 'cumulativeDone';
    let wipCount = activeCoord.data.inProgress;

    if (hasDynamicStages && effectiveColumns && effectiveColumns.length > 1) {
      // Primeira coluna de progresso ou coluna do meio
      const progressCol = effectiveColumns.find((c) => c.category === 'in_progress') || effectiveColumns[1];
      const doneCol = effectiveColumns.find((c) => c.category === 'done') || effectiveColumns[effectiveColumns.length - 1];

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
      departureKey
    );

    // X onde a curva de chegada esteve no patamar de saída
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
  }, [activeCoord, hoverIndex, pointCount, displayedData, hasDynamicStages, effectiveColumns, coords]);

  return (
    <div
      className={`chart-container cfd-advanced-container ${isExpanded ? 'is-chart-expanded' : ''}`}
      data-testid="cfd-advanced-container"
    >
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Botão de Filtros Retrátil à Esquerda */}
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

      {/* Legenda de Etapas */}
      <div className="cfd-legend-bar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
        {hasDynamicStages && effectiveColumns ? (
          effectiveColumns.map((col) => {
            const color = getColumnColor(col);
            return (
              <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, display: 'inline-block' }} />
                <span>{col.title}</span>
              </div>
            );
          })
        ) : (
          <>
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
          </>
        )}
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
            {/* Marcadores de setas bidirecionais vermelhas para Lead Time */}
            <marker id="arrow-left" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 10 0 L 0 5 L 10 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-right" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Grid Lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={viewBoxWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + plotHeight / 2} x2={viewBoxWidth - paddingRight} y2={paddingTop + plotHeight / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={yBaseline} x2={viewBoxWidth - paddingRight} y2={yBaseline} stroke="rgba(255,255,255,0.2)" />

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
            <g className="cfd-inspection-group" data-testid="cfd-inspection-overlay">
              {/* Linha vertical de corte */}
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={yBaseline}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Medição Vertical de WIP com linha sólida e badge */}
              <line
                x1={activeCoord.x}
                y1={inspection.topY}
                x2={activeCoord.x}
                y2={inspection.bottomY}
                stroke="#38bdf8"
                strokeWidth="2.5"
                data-testid="wip-vertical-line"
              />
              <rect
                x={activeCoord.x + 6}
                y={(inspection.topY + inspection.bottomY) / 2 - 10}
                width={56}
                height={20}
                rx={4}
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text
                x={activeCoord.x + 10}
                y={(inspection.topY + inspection.bottomY) / 2 + 4}
                fill="#7dd3fc"
                fontSize="10px"
                fontWeight="700"
                fontFamily="monospace"
                data-testid="wip-items-badge"
              >
                {inspection.wipCount} items
              </text>

              {/* Medição Horizontal de Lead Time com seta bidirecional vermelha */}
              {inspection.endX > inspection.startX && (
                <g data-testid="leadtime-horizontal-group">
                  <line
                    x1={inspection.startX}
                    y1={inspection.bottomY}
                    x2={inspection.endX}
                    y2={inspection.bottomY}
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    markerStart="url(#arrow-left)"
                    markerEnd="url(#arrow-right)"
                  />
                  <rect
                    x={(inspection.startX + inspection.endX) / 2 - 28}
                    y={inspection.bottomY - 24}
                    width={56}
                    height={18}
                    rx={4}
                    fill="#450a0a"
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                  <text
                    x={(inspection.startX + inspection.endX) / 2 - 24}
                    y={inspection.bottomY - 11}
                    fill="#fca5a5"
                    fontSize="10px"
                    fontWeight="700"
                    fontFamily="monospace"
                    data-testid="leadtime-days-badge"
                  >
                    {inspection.leadTimeDays} days
                  </text>
                </g>
              )}

              {/* Tag de Alerta de Gargalo em Expansão */}
              {inspection.isExpanding && (
                <g data-testid="bottleneck-expansion-tag">
                  <rect
                    x={Math.max(paddingLeft + 5, activeCoord.x - 70)}
                    y={inspection.topY - 30}
                    width={140}
                    height={22}
                    rx={4}
                    fill="#f43f5e"
                    filter="drop-shadow(0 2px 6px rgba(244, 63, 94, 0.6))"
                  />
                  <text
                    x={Math.max(paddingLeft + 15, activeCoord.x - 60)}
                    y={inspection.topY - 15}
                    fill="#ffffff"
                    fontSize="10px"
                    fontWeight="700"
                  >
                    ⚠️ A queue column expanding
                  </text>
                </g>
              )}
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
        {displayedData.length > 0 && (
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
            <span>{displayedData[0].date}</span>
            <span>{displayedData[Math.floor(displayedData.length / 2)].date}</span>
            <span>{displayedData[displayedData.length - 1].date}</span>
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
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              minWidth: '170px'
            }}
          >
            <div style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '6px' }}>
              📅 {activeCoord.data.date}
            </div>

            {hasDynamicStages && effectiveColumns ? (
              effectiveColumns.map((col) => {
                const color = getColumnColor(col);
                const count = activeCoord.data.stageCounts?.[col.id] || 0;
                return (
                  <div key={col.id} style={{ display: 'flex', justifyContent: 'space-between', color, marginBottom: '2px' }}>
                    <span>{col.title}:</span>
                    <strong>{count}</strong>
                  </div>
                );
              })
            ) : (
              <>
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
              </>
            )}

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

      {/* Mini-Timeline Scrubber na base (Zoom & navegação temporal) */}
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

import React, { useState, useMemo } from 'react';
import { TaskModel } from '../../types/kanban';
import { calculateCycleTimeMs, formatDuration } from '../../utils/timeFormatters';
import { calculateFlowPercentiles } from '../../utils/statistics';
import { ChartControlsPanel } from './ChartControlsPanel';

export interface CycleTimeScatterPlotProps {
  tasks: TaskModel[];
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  initialTimeWindowDays?: number;
  title?: string;
  subtitle?: string;
}

export interface ScatterPointItem {
  id: string;
  title: string;
  completedAt: string;
  completedTimestamp: number;
  startedAt?: string;
  cycleTimeMs: number;
  cycleTimeDays: number;
  blocked: boolean;
  totalBlockedMs?: number;
  priority?: string;
}

export const CycleTimeScatterPlot: React.FC<CycleTimeScatterPlotProps> = ({
  tasks,
  onToggleExpand,
  isExpanded = false,
  initialTimeWindowDays = 30,
  title = 'Cycle Time Scatter Plot',
  subtitle = 'Tempo decorrido de conclusão com percentis probabilísticos',
}) => {
  // Estado dos controles do painel
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [percentilesVisibility, setPercentilesVisibility] = useState({
    p50: true,
    p85: true,
    p95: true,
  });
  const [highlightBlocked, setHighlightBlocked] = useState(true);
  const [timeWindowDays, setTimeWindowDays] = useState<number>(initialTimeWindowDays);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPointItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const MS_PER_DAY = 86_400_000;

  // Filtragem e mapeamento de tarefas concluídas com cycle time válido
  const { points, percentiles, maxCycleTimeDays, windowStartMs, windowEndMs } = useMemo(() => {
    const now = new Date();
    const endMs = now.getTime();
    const startMs = timeWindowDays > 0 ? endMs - timeWindowDays * MS_PER_DAY : 0;

    const rawPoints: ScatterPointItem[] = [];

    for (const t of tasks) {
      if (!t.completedAt) continue;
      const completedTime = new Date(t.completedAt).getTime();
      if (isNaN(completedTime)) continue;

      // Filtro de janela de tempo
      if (timeWindowDays > 0 && completedTime < startMs) {
        continue;
      }

      const cycleMs = calculateCycleTimeMs(t);
      if (cycleMs === null || cycleMs < 0) continue;

      const cycleDays = Math.max(0.1, Number((cycleMs / MS_PER_DAY).toFixed(2)));
      const hasBlocked = Boolean(t.blocked || (t.totalBlockedMs && t.totalBlockedMs > 0));

      rawPoints.push({
        id: t.id,
        title: t.title,
        completedAt: t.completedAt,
        completedTimestamp: completedTime,
        startedAt: t.startedAt || t.createdAt,
        cycleTimeMs: cycleMs,
        cycleTimeDays: cycleDays,
        blocked: hasBlocked,
        totalBlockedMs: t.totalBlockedMs,
        priority: t.priority,
      });
    }

    // Ordenar pontos por data de conclusão
    rawPoints.sort((a, b) => a.completedTimestamp - b.completedTimestamp);

    const cycleTimes = rawPoints.map((p) => p.cycleTimeDays);
    const calculatedPercentiles = calculateFlowPercentiles(cycleTimes);

    // Calcular escala máxima de Y (garantindo headroom acima do P95 ou do valor máximo)
    const highestVal = Math.max(
      calculatedPercentiles.max,
      calculatedPercentiles.p95,
      ...cycleTimes,
      1
    );
    // Margem de 20% no topo para boa legibilidade
    const maxDays = Math.ceil(highestVal * 1.2) || 5;

    // Calcular limites temporais X
    let effectiveStartMs = startMs;
    if (timeWindowDays === 0 && rawPoints.length > 0) {
      effectiveStartMs = rawPoints[0].completedTimestamp - MS_PER_DAY;
    }
    const effectiveEndMs = Math.max(endMs, effectiveStartMs + MS_PER_DAY);

    return {
      points: rawPoints,
      percentiles: calculatedPercentiles,
      maxCycleTimeDays: maxDays,
      windowStartMs: effectiveStartMs,
      windowEndMs: effectiveEndMs,
    };
  }, [tasks, timeWindowDays]);

  const handleTogglePercentile = (key: 'p50' | 'p85' | 'p95') => {
    setPercentilesVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Coordenadas viewBox do SVG: usamos 1000 x 500 para alta resolução de vetores
  const viewBoxWidth = 1000;
  const viewBoxHeight = 500;
  const padding = { top: 40, right: 90, bottom: 50, left: 60 };
  const chartInnerWidth = viewBoxWidth - padding.left - padding.right;
  const chartInnerHeight = viewBoxHeight - padding.top - padding.bottom;

  // Funções de projeção cartesiana
  const getX = (timestamp: number) => {
    const range = windowEndMs - windowStartMs || 1;
    const progress = (timestamp - windowStartMs) / range;
    const clamped = Math.max(0, Math.min(1, progress));
    return padding.left + clamped * chartInnerWidth;
  };

  const getY = (days: number) => {
    const progress = days / (maxCycleTimeDays || 1);
    const clamped = Math.max(0, Math.min(1, progress));
    // Invertido para SVG: 0 é o topo
    return padding.top + (1 - clamped) * chartInnerHeight;
  };

  // Linhas de percentil calculadas
  const p50Y = getY(percentiles.p50);
  const p85Y = getY(percentiles.p85);
  const p95Y = getY(percentiles.p95);

  // Marcas de data no eixo X (5 divisões)
  const dateTicks = useMemo(() => {
    const ticks = [];
    const divisions = 5;
    const step = (windowEndMs - windowStartMs) / divisions;
    for (let i = 0; i <= divisions; i++) {
      const time = windowStartMs + i * step;
      const date = new Date(time);
      const label = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      ticks.push({
        x: padding.left + (i / divisions) * chartInnerWidth,
        label,
      });
    }
    return ticks;
  }, [windowStartMs, windowEndMs, chartInnerWidth, padding.left]);

  // Marcas de dias no eixo Y (4 divisões)
  const dayTicks = useMemo(() => {
    const ticks = [];
    const divisions = 4;
    for (let i = 0; i <= divisions; i++) {
      const days = Number(((maxCycleTimeDays / divisions) * i).toFixed(1));
      ticks.push({
        y: padding.top + (1 - i / divisions) * chartInnerHeight,
        label: `${days}d`,
      });
    }
    return ticks;
  }, [maxCycleTimeDays, chartInnerHeight, padding.top]);

  return (
    <div
      className={`chart-container cycle-time-scatter-container ${isExpanded ? 'is-chart-expanded' : ''}`}
      data-testid="cycle-time-scatter-plot"
    >
      <div className="chart-header-row">
        <div className="scatter-header-left">
          <h3 className="chart-title" style={{ margin: 0 }}>
            {title}
          </h3>
          <span className="scatter-subtitle">
            {subtitle}
          </span>
        </div>

        <div className="scatter-header-actions">
          {/* Botão para abrir controles do gráfico */}
          <ChartControlsPanel
            isOpen={isControlsOpen}
            onToggleOpen={() => setIsControlsOpen((prev) => !prev)}
            percentilesVisibility={percentilesVisibility}
            onTogglePercentile={handleTogglePercentile}
            highlightBlocked={highlightBlocked}
            onToggleHighlightBlocked={() => setHighlightBlocked((prev) => !prev)}
            percentiles={percentiles}
            timeWindowDays={timeWindowDays}
            onChangeTimeWindowDays={setTimeWindowDays}
          />

          {onToggleExpand && (
            <button
              type="button"
              className="btn-chart-expand"
              onClick={onToggleExpand}
              title={isExpanded ? 'Restaurar tamanho' : 'Expandir gráfico'}
              aria-label={isExpanded ? 'Restaurar gráfico' : 'Expandir gráfico'}
            >
              {isExpanded ? '✕ Fechar' : '⛶ Expandir'}
            </button>
          )}
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="cycle-time-chart-body">
        {points.length === 0 ? (
          <div className="scatter-empty-state" data-testid="scatter-empty-state">
            <div className="empty-state-icon">⏱️</div>
            <h4 className="empty-state-title">Nenhuma tarefa concluída no período</h4>
            <p className="empty-state-desc">
              Conclua cartões no quadro Kanban ou amplie a janela temporal para visualizar a
              distribuição de tempo de ciclo e as linhas de percentil (50%, 85% e 95%).
            </p>
          </div>
        ) : (
          <div className="scatter-svg-wrapper">
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="cycle-time-svg"
            >
              {/* Grid Horizontal */}
              {dayTicks.map((tick, idx) => (
                <g key={`grid-h-${idx}`} className="chart-grid-group">
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={viewBoxWidth - padding.right}
                    y2={tick.y}
                    className="scatter-grid-line"
                  />
                  <text
                    x={padding.left - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    className="scatter-axis-text"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Grid Vertical e Labels do Eixo X */}
              {dateTicks.map((tick, idx) => (
                <g key={`grid-v-${idx}`} className="chart-grid-group">
                  <line
                    x1={tick.x}
                    y1={padding.top}
                    x2={tick.x}
                    y2={viewBoxHeight - padding.bottom}
                    className="scatter-grid-line vertical"
                  />
                  <text
                    x={tick.x}
                    y={viewBoxHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="scatter-axis-text"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Eixos X e Y */}
              <line
                x1={padding.left}
                y1={viewBoxHeight - padding.bottom}
                x2={viewBoxWidth - padding.right}
                y2={viewBoxHeight - padding.bottom}
                className="scatter-axis-line"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={viewBoxHeight - padding.bottom}
                className="scatter-axis-line"
              />

              {/* Linha de Percentil 95% (Variabilidade Extrema) */}
              {percentilesVisibility.p95 && percentiles.count > 0 && (
                <g className="percentile-group p95" data-testid="percentile-line-95">
                  <line
                    x1={padding.left}
                    y1={p95Y}
                    x2={viewBoxWidth - padding.right}
                    y2={p95Y}
                    className="percentile-dashed-line p95"
                  />
                  <rect
                    x={viewBoxWidth - padding.right + 4}
                    y={p95Y - 11}
                    width={76}
                    height={22}
                    rx={4}
                    className="percentile-badge-bg p95"
                  />
                  <text
                    x={viewBoxWidth - padding.right + 8}
                    y={p95Y + 4}
                    className="percentile-badge-text p95"
                  >
                    95%: {percentiles.p95}d
                  </text>
                </g>
              )}

              {/* Linha de Percentil 85% (SLE Típico) */}
              {percentilesVisibility.p85 && percentiles.count > 0 && (
                <g className="percentile-group p85" data-testid="percentile-line-85">
                  <line
                    x1={padding.left}
                    y1={p85Y}
                    x2={viewBoxWidth - padding.right}
                    y2={p85Y}
                    className="percentile-dashed-line p85"
                  />
                  <rect
                    x={viewBoxWidth - padding.right + 4}
                    y={p85Y - 11}
                    width={76}
                    height={22}
                    rx={4}
                    className="percentile-badge-bg p85"
                  />
                  <text
                    x={viewBoxWidth - padding.right + 8}
                    y={p85Y + 4}
                    className="percentile-badge-text p85"
                  >
                    85%: {percentiles.p85}d
                  </text>
                </g>
              )}

              {/* Linha de Percentil 50% (Mediana) */}
              {percentilesVisibility.p50 && percentiles.count > 0 && (
                <g className="percentile-group p50" data-testid="percentile-line-50">
                  <line
                    x1={padding.left}
                    y1={p50Y}
                    x2={viewBoxWidth - padding.right}
                    y2={p50Y}
                    className="percentile-dashed-line p50"
                  />
                  <rect
                    x={viewBoxWidth - padding.right + 4}
                    y={p50Y - 11}
                    width={76}
                    height={22}
                    rx={4}
                    className="percentile-badge-bg p50"
                  />
                  <text
                    x={viewBoxWidth - padding.right + 8}
                    y={p50Y + 4}
                    className="percentile-badge-text p50"
                  >
                    50%: {percentiles.p50}d
                  </text>
                </g>
              )}

              {/* Pontos de Dispersão (Scatter Points) */}
              {points.map((pt) => {
                const cx = getX(pt.completedTimestamp);
                const cy = getY(pt.cycleTimeDays);
                const isBlockedPoint = highlightBlocked && pt.blocked;

                return (
                  <g
                    key={pt.id}
                    className="scatter-point-wrapper"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredPoint(pt);
                      setTooltipPos({
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Glow ring for blocked items */}
                    {isBlockedPoint && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="8"
                        className="scatter-point-blocked-ring"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      className={`cycle-scatter-dot ${isBlockedPoint ? 'is-blocked' : ''}`}
                      data-testid={`scatter-dot-${pt.id}`}
                    >
                      <title>{`${pt.title} | ${pt.cycleTimeDays} dias ${pt.blocked ? '(Bloqueado)' : ''}`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Flutuante Rico */}
            {hoveredPoint && tooltipPos && (
              <div
                className="scatter-rich-tooltip"
                style={{
                  top: `${tooltipPos.y - 10}px`,
                  left: `${tooltipPos.x + 15}px`,
                }}
                data-testid="scatter-rich-tooltip"
              >
                <div className="tooltip-header">
                  <span className="tooltip-title">{hoveredPoint.title}</span>
                  {hoveredPoint.blocked && (
                    <span className="tooltip-blocked-badge">⚠️ Bloqueada</span>
                  )}
                </div>
                <div className="tooltip-grid">
                  <div className="tooltip-item">
                    <span className="tooltip-k">Cycle Time:</span>
                    <span className="tooltip-v highlight-v">{hoveredPoint.cycleTimeDays} dias</span>
                  </div>
                  <div className="tooltip-item">
                    <span className="tooltip-k">Duração:</span>
                    <span className="tooltip-v">{formatDuration(hoveredPoint.cycleTimeMs)}</span>
                  </div>
                  <div className="tooltip-item">
                    <span className="tooltip-k">Concluído:</span>
                    <span className="tooltip-v">
                      {new Date(hoveredPoint.completedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {hoveredPoint.totalBlockedMs ? (
                    <div className="tooltip-item">
                      <span className="tooltip-k">Tempo Bloqueado:</span>
                      <span className="tooltip-v text-alert">
                        {formatDuration(hoveredPoint.totalBlockedMs)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legenda inferior */}
      <div className="scatter-footer-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot normal-dot"></span>
            <span>Item Concluído</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot blocked-dot"></span>
            <span>Item com Bloqueio</span>
          </div>
          <div className="legend-item">
            <span className="legend-line p50-line"></span>
            <span>50% ({percentiles.p50}d)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line p85-line"></span>
            <span>85% SLE ({percentiles.p85}d)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line p95-line"></span>
            <span>95% ({percentiles.p95}d)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

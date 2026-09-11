import React, { useState } from 'react';
import { StageWipColumn, AgingWorkItem, getDeterministicJitter } from '../../utils/wipAgingMetrics';

export interface WipAgingChartProps {
  columns: StageWipColumn[];
  showP50?: boolean;
  showP70?: boolean;
  showP85?: boolean;
  showP95?: boolean;
  highlightBlockedOnly?: boolean;
  referenceDateStr?: string;
  onSelectTask?: (taskId: string) => void;
}

export const WipAgingChart: React.FC<WipAgingChartProps> = ({
  columns,
  showP50 = true,
  showP70 = true,
  showP85 = true,
  showP95 = true,
  highlightBlockedOnly = false,
  referenceDateStr,
  onSelectTask,
}) => {
  const [hoveredItem, setHoveredItem] = useState<{
    item: AgingWorkItem;
    x: number;
    y: number;
  } | null>(null);

  if (!columns || columns.length === 0) {
    return (
      <div className="wip-aging-empty-state" data-testid="wip-aging-empty">
        <p>Nenhuma coluna ativa encontrada para plotagem de envelhecimento.</p>
      </div>
    );
  }

  // Dimensões do SVG
  const width = 940;
  const height = 480;
  const paddingLeft = 55;
  const paddingRight = 40;
  const paddingTop = 50;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Determinar idade máxima para escala Y (com folga para visualização harmoniosa)
  const allAges = columns.flatMap((col) => col.items.map((i) => i.ageDays));
  const allPercentiles = columns.flatMap((col) => [col.percentiles.p95]);
  const maxAgeObserved = Math.max(...allAges, ...allPercentiles, 10);
  const maxScaleY = Math.ceil(maxAgeObserved * 1.15);

  const numColumns = columns.length;
  const colWidth = chartWidth / numColumns;

  // Função para converter idade em coordenada Y
  const getY = (age: number) => {
    const clampedAge = Math.max(0, Math.min(age, maxScaleY));
    return paddingTop + chartHeight - (clampedAge / maxScaleY) * chartHeight;
  };

  return (
    <div className="wip-aging-chart-container" data-testid="wip-aging-chart">
      {/* Cabeçalho do Gráfico */}
      <div className="wip-aging-header">
        <div className="wip-aging-title-wrap">
          <h4 className="wip-aging-title">Aging Work In Progress (Envelhecimento do WIP)</h4>
          {referenceDateStr && (
            <span className="wip-aging-as-of">
              📅 As of: <strong>{referenceDateStr}</strong>
            </span>
          )}
        </div>

        {/* Legenda de Zonas */}
        <div className="wip-aging-legend">
          <span className="legend-chip zone-green">
            <span className="color-box"></span> &lt; 50% (Saudável)
          </span>
          <span className="legend-chip zone-yellow">
            <span className="color-box"></span> 50% - 70% (Atenção)
          </span>
          <span className="legend-chip zone-orange">
            <span className="color-box"></span> 70% - 95% (SLE / Risco)
          </span>
          <span className="legend-chip zone-red">
            <span className="color-box"></span> &gt; 95% (Alerta Crítico)
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="wip-aging-svg"
        aria-label="Gráfico de Envelhecimento do Trabalho em Progresso"
        role="img"
      >
        <defs>
          <linearGradient id="bandGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="bandYellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="bandOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#c2410c" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="bandRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.80" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.60" />
          </linearGradient>
          <filter id="dotGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Linhas de Grade Horizontal (Idade em Dias) */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const ageLabel = Number((maxScaleY * ratio).toFixed(0));
          return (
            <g key={ratio} className="grid-line-group">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="axis-label"
                fill="rgba(255, 255, 255, 0.45)"
                fontSize="11"
              >
                {ageLabel}d
              </text>
            </g>
          );
        })}

        {/* Linha de Base do Eixo X */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
        />

        {/* Renderização de Cada Coluna (Faixas Coloridas + Indicadores) */}
        {columns.map((col, colIdx) => {
          const colX = paddingLeft + colIdx * colWidth;
          const { p50, p70, p95 } = col.percentiles;

          const yZero = paddingTop + chartHeight;
          const yP50 = getY(p50);
          const yP70 = getY(p70);
          const yP95 = getY(p95);
          const yTop = paddingTop;

          return (
            <g key={col.id} className="wip-column-band-group" data-testid={`col-band-${col.id}`}>
              {/* Faixa 1: Verde (0 até P50) */}
              <rect
                x={colX}
                y={yP50}
                width={colWidth}
                height={Math.max(yZero - yP50, 0)}
                fill="url(#bandGreen)"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />

              {/* Faixa 2: Amarelo (P50 até P70) */}
              <rect
                x={colX}
                y={yP70}
                width={colWidth}
                height={Math.max(yP50 - yP70, 0)}
                fill="url(#bandYellow)"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />

              {/* Faixa 3: Laranja (P70 até P95) */}
              <rect
                x={colX}
                y={yP95}
                width={colWidth}
                height={Math.max(yP70 - yP95, 0)}
                fill="url(#bandOrange)"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />

              {/* Faixa 4: Vermelho (> P95 até Topo) */}
              <rect
                x={colX}
                y={yTop}
                width={colWidth}
                height={Math.max(yP95 - yTop, 0)}
                fill="url(#bandRed)"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />

              {/* Divisória Vertical Entre Colunas */}
              <line
                x1={colX + colWidth}
                y1={paddingTop}
                x2={colX + colWidth}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />

              {/* Linhas de Percentil (Threshold Lines) */}
              {showP50 && (
                <line
                  x1={colX}
                  y1={yP50}
                  x2={colX + colWidth}
                  y2={yP50}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              {showP70 && (
                <line
                  x1={colX}
                  y1={yP70}
                  x2={colX + colWidth}
                  y2={yP70}
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              {showP85 && col.percentiles.p85 && (
                <line
                  x1={colX}
                  y1={getY(col.percentiles.p85)}
                  x2={colX + colWidth}
                  y2={getY(col.percentiles.p85)}
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}
              {showP95 && (
                <line
                  x1={colX}
                  y1={yP95}
                  x2={colX + colWidth}
                  y2={yP95}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5 2"
                />
              )}

              {/* Badge de WIP no Topo da Coluna */}
              <g className="wip-top-badge" transform={`translate(${colX + colWidth / 2}, ${paddingTop - 18})`}>
                <rect
                  x="-28"
                  y="-12"
                  width="56"
                  height="20"
                  rx="4"
                  fill="rgba(0, 0, 0, 0.6)"
                  stroke={col.wipCount > 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  fill={col.wipCount > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'}
                  fontSize="10.5"
                  fontWeight="bold"
                >
                  WIP: {col.wipCount}
                </text>
              </g>

              {/* Rótulo da Coluna no Eixo X */}
              <text
                x={colX + colWidth / 2}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.75)"
                fontSize="11"
                fontWeight="600"
                className="column-axis-label"
              >
                {col.title.length > 14 ? `${col.title.substring(0, 12)}…` : col.title}
              </text>
            </g>
          );
        })}

        {/* Pontos de Tarefas em Andamento (Aging Work Items) */}
        {columns.map((col, colIdx) => {
          const colX = paddingLeft + colIdx * colWidth;
          const centerX = colX + colWidth / 2;

          return col.items.map((item) => {
            const jitter = getDeterministicJitter(item.id, colWidth * 0.28);
            const cx = centerX + jitter;
            const cy = getY(item.ageDays);

            const isDimmed = highlightBlockedOnly && !item.isBlocked;
            const isHovered = hoveredItem?.item.id === item.id;

            return (
              <g
                key={item.id}
                className={`aging-item-dot-group ${isHovered ? 'is-hovered' : ''}`}
                onClick={() => onSelectTask && onSelectTask(item.id)}
                onMouseEnter={() => setHoveredItem({ item, x: cx, y: cy })}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer', opacity: isDimmed ? 0.25 : 1 }}
                data-testid={`dot-${item.id}`}
              >
                {/* Efeito Glow para tarefas bloqueadas ou hover */}
                {(item.isBlocked || isHovered) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 12 : 9}
                    fill={item.isBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)'}
                    className="dot-glow"
                  />
                )}

                {/* Círculo Principal do Ponto */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : item.isBlocked ? 6 : 5.5}
                  fill={item.isBlocked ? '#ef4444' : '#38bdf8'}
                  stroke="#ffffff"
                  strokeWidth={item.isBlocked ? 2 : 1.5}
                  filter="url(#dotGlow)"
                  className="aging-dot"
                />
              </g>
            );
          });
        })}
      </svg>

      {/* Tooltip Flutuante de Inspeção da Tarefa */}
      {hoveredItem && (
        <div
          className="wip-aging-tooltip"
          style={{
            left: `${(hoveredItem.x / width) * 100}%`,
            top: `${(hoveredItem.y / height) * 100}%`,
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-task-id">{hoveredItem.item.id}</span>
            {hoveredItem.item.isBlocked && <span className="tooltip-badge-blocked">🚫 Bloqueado</span>}
          </div>
          <div className="tooltip-task-title">{hoveredItem.item.title}</div>
          <div className="tooltip-meta-grid">
            <div className="tooltip-meta-item">
              <span className="meta-lbl">Etapa Atual:</span>
              <span className="meta-val">{hoveredItem.item.columnTitle}</span>
            </div>
            <div className="tooltip-meta-item">
              <span className="meta-lbl">Idade no Fluxo:</span>
              <strong className="meta-val highlight-age">{hoveredItem.item.ageDays} dias</strong>
            </div>
            <div className="tooltip-meta-item">
              <span className="meta-lbl">Tempo nesta etapa:</span>
              <span className="meta-val">{hoveredItem.item.timeInStageDays} dias</span>
            </div>
            <div className="tooltip-meta-item">
              <span className="meta-lbl">Zona de Risco:</span>
              <span className={`meta-val risk-tag zone-${hoveredItem.item.riskZone}`}>
                {hoveredItem.item.riskZone.toUpperCase()}
              </span>
            </div>
          </div>
          {hoveredItem.item.blockedReason && (
            <div className="tooltip-blocked-reason">
              <strong>Motivo do bloqueio:</strong> {hoveredItem.item.blockedReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

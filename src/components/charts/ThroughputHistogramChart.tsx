import React, { useState } from 'react';
import { ThroughputHistogramBin, ThroughputPercentiles } from '../../utils/throughputMetrics';

export interface ThroughputHistogramChartProps {
  bins: ThroughputHistogramBin[];
  maxFrequency: number;
  percentiles: ThroughputPercentiles;
  height?: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  bin?: ThroughputHistogramBin;
}

export const ThroughputHistogramChart: React.FC<ThroughputHistogramChartProps> = ({
  bins,
  maxFrequency,
  percentiles,
  height = 280,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0 });

  if (!bins || bins.length === 0) {
    return (
      <div className="throughput-chart-empty" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="empty-text">Sem dados suficientes para construir o histograma de vazão.</p>
      </div>
    );
  }

  // Geometria do SVG
  const width = 800;
  const padding = { top: 35, right: 30, bottom: 45, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Escala Y (frequência em dias)
  const yMax = Math.max(5, Math.ceil(maxFrequency * 1.15));
  const getY = (val: number) => padding.top + chartHeight - (val / yMax) * chartHeight;

  // Escala X (quantidade de itens: 0, 1, 2, ... N)
  const binCount = bins.length;
  const binWidth = chartWidth / Math.max(1, binCount);
  const barGap = Math.max(2, Math.min(8, binWidth * 0.08));

  // Função para converter valor de vazão em coordenada X contínua
  const getX = (throughputVal: number) => {
    // Alinha no centro de cada bin correspondente
    return padding.left + throughputVal * binWidth + binWidth / 2;
  };

  // Linhas de percentil a exibir no topo
  const percentileLines = [
    { label: '50%', value: percentiles.p50, color: '#3b82f6' },
    { label: '70%', value: percentiles.p70, color: '#06b6d4' },
    { label: '85%', value: percentiles.p85, color: '#eab308' },
    { label: '95%', value: percentiles.p95, color: '#ef4444' },
  ];

  // Grid horizontal Y
  const yTicks = [0, Math.round(yMax / 4), Math.round(yMax / 2), Math.round((yMax * 3) / 4), yMax];

  return (
    <div className="throughput-histogram-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>
          Throughput Histogram
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          Distribuição de frequência de conclusões diárias
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        data-testid="throughput-histogram-svg"
      >
        {/* Linhas de grade horizontais e rótulos do eixo Y */}
        {yTicks.map((tickVal) => {
          const y = getY(tickVal);
          return (
            <g key={`y-grid-${tickVal}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="3,3"
                strokeOpacity={0.6}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-secondary)"
              >
                {tickVal}
              </text>
            </g>
          );
        })}

        {/* Título do Eixo Y */}
        <text
          x={-(padding.top + chartHeight / 2)}
          y={12}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="10"
          fill="var(--color-text-secondary)"
          fontWeight={500}
        >
          Frequency (# of Days)
        </text>

        {/* Barras do Histograma */}
        {bins.map((bin) => {
          const barX = padding.left + bin.throughputValue * binWidth + barGap / 2;
          const barW = Math.max(2, binWidth - barGap);
          const barY = getY(bin.frequencyDays);
          const barH = chartHeight - (barY - padding.top);

          return (
            <g
              key={`bin-${bin.throughputValue}`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  bin,
                });
              }}
              onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0 })}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={Math.max(0, barH)}
                fill="#0284c7"
                rx={2}
                opacity={0.88}
                className="histogram-bar"
              />
              {/* Rótulo do Eixo X */}
              <text
                x={barX + barW / 2}
                y={padding.top + chartHeight + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight={500}
                fill="var(--color-text)"
              >
                {bin.throughputValue}
              </text>
            </g>
          );
        })}

        {/* Título do Eixo X */}
        <text
          x={padding.left + chartWidth / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize="10.5"
          fill="var(--color-text-secondary)"
          fontWeight={500}
        >
          Throughput (# of Work Items Completed on a Day)
        </text>

        {/* Linhas Verticais de Percentil NIST */}
        {percentileLines.map((p) => {
          if (p.value < 0 || p.value > binCount - 1) return null;
          const x = getX(p.value);

          return (
            <g key={`percentile-${p.label}`}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + chartHeight}
                stroke={p.color}
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              {/* Rótulo superior do percentil */}
              <text
                x={x}
                y={padding.top - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight={700}
                fill={p.color}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip flutuante */}
      {tooltip.visible && tooltip.bin && (
        <div
          className="chart-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'var(--color-surface-elevated, #1e293b)',
            color: 'var(--color-text, #f8fafc)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            border: '1px solid var(--color-border, #334155)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltip.bin.throughputValue} itens concluídos/dia</div>
          <div style={{ color: '#94a3b8' }}>
            {tooltip.bin.frequencyDays} dias ({tooltip.bin.percentage}%)
          </div>
        </div>
      )}
    </div>
  );
};

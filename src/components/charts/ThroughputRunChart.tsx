import React, { useState } from 'react';
import { ThroughputDailyPoint } from '../../utils/throughputMetrics';

export interface ThroughputRunChartProps {
  data: ThroughputDailyPoint[];
  maxDailyThroughput: number;
  height?: number;
}

interface RunTooltipState {
  visible: boolean;
  x: number;
  y: number;
  point?: ThroughputDailyPoint;
}

export const ThroughputRunChart: React.FC<ThroughputRunChartProps> = ({
  data,
  maxDailyThroughput,
  height = 140,
}) => {
  const [tooltip, setTooltip] = useState<RunTooltipState>({ visible: false, x: 0, y: 0 });

  if (!data || data.length === 0) {
    return null;
  }

  const width = 800;
  const padding = { top: 15, right: 30, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Escala Y
  const yMax = Math.max(3, maxDailyThroughput);
  const getY = (val: number) => padding.top + chartHeight - (val / yMax) * chartHeight;

  // Escala X
  const n = data.length;
  const getX = (idx: number) => {
    if (n <= 1) return padding.left + chartWidth / 2;
    return padding.left + (idx / (n - 1)) * chartWidth;
  };

  // Construir caminho SVG da linha conectada
  const pathData = data.reduce((acc, point, i) => {
    const x = getX(i);
    const y = getY(point.count);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, '');

  // Ticks do eixo Y (0, meio, max)
  const yTicks = [0, Math.ceil(yMax / 2), yMax];

  // Rótulos inteligentes do eixo X para evitar sobreposição
  // Mostrar cerca de 5 a 7 rótulos no máximo
  const labelStep = Math.max(1, Math.floor(n / 6));

  return (
    <div className="throughput-run-chart-wrapper" style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        data-testid="throughput-run-chart-svg"
      >
        {/* Linhas horizontais de grade e rótulos Y */}
        {yTicks.map((val) => {
          const y = getY(val);
          return (
            <g key={`run-y-${val}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="2,2"
                strokeOpacity={0.5}
              />
              <text
                x={padding.left - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9"
                fill="var(--color-text-secondary)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Rótulo vertical do eixo Y */}
        <text
          x={-(padding.top + chartHeight / 2)}
          y={12}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="9.5"
          fill="var(--color-text-secondary)"
          fontWeight={500}
        >
          Daily Throughput
        </text>

        {/* Linha contínua conectando os pontos */}
        <path
          d={pathData}
          fill="none"
          stroke="#475569"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Marcadores pontuais de cada dia (dots) */}
        {data.map((point, idx) => {
          const cx = getX(idx);
          const cy = getY(point.count);

          return (
            <circle
              key={`dot-${point.date}-${idx}`}
              cx={cx}
              cy={cy}
              r={3}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth={1}
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  point,
                });
              }}
              onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0 })}
            />
          );
        })}

        {/* Rótulos do eixo X (datas) */}
        {data.map((point, idx) => {
          const isLabelVisible = idx === 0 || idx === n - 1 || idx % labelStep === 0;
          if (!isLabelVisible) return null;

          const cx = getX(idx);
          // Formata como DD/MM ou YYYY-MM
          const parts = point.date.split('-');
          const label = `${parts[2]}/${parts[1]}`;

          return (
            <text
              key={`x-label-${point.date}`}
              x={cx}
              y={padding.top + chartHeight + 14}
              textAnchor="middle"
              fontSize="9"
              fill="var(--color-text-secondary)"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip do ponto diário */}
      {tooltip.visible && tooltip.point && (
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
          <div style={{ fontWeight: 600 }}>{tooltip.point.date}</div>
          <div style={{ color: '#38bdf8' }}>
            {tooltip.point.count} {tooltip.point.count === 1 ? 'tarefa concluída' : 'tarefas concluídas'}
          </div>
        </div>
      )}
    </div>
  );
};

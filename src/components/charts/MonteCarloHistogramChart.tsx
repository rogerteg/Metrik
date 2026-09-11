import React, { useState } from 'react';
import { MonteCarloHistogramBin } from '../../utils/monteCarlo';

export interface MonteCarloHistogramChartProps {
  bins: MonteCarloHistogramBin[];
  p50Value: number;
  p85Value: number;
  p95Value: number;
  unitLabel: string; // ex: 'itens' ou 'dias'
  title?: string;
  isAscending?: boolean; // true para prazos (menor é melhor), false para capacidade (maior é melhor)
}

export const MonteCarloHistogramChart: React.FC<MonteCarloHistogramChartProps> = ({
  bins,
  p50Value,
  p85Value,
  p95Value,
  unitLabel,
  title = 'Distribuição de Frequência & Probabilidade (Monte Carlo)',
  isAscending = false,
}) => {
  const [hoveredBin, setHoveredBin] = useState<MonteCarloHistogramBin | null>(null);

  if (!bins || bins.length === 0) {
    return (
      <div className="monte-carlo-chart-empty">
        <p>Dados insuficientes para renderizar o histograma.</p>
      </div>
    );
  }

  // Dimensões do SVG
  const width = 800;
  const height = 320;
  const paddingLeft = 55;
  const paddingRight = 45;
  const paddingTop = 40;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minVal = bins[0].value;
  const maxVal = bins[bins.length - 1].value;
  const maxFreq = Math.max(...bins.map((b) => b.frequency), 1);

  // Mapeadores de coordenadas
  const valRange = Math.max(maxVal - minVal, 1);
  const getX = (val: number) => {
    return paddingLeft + ((val - minVal) / valRange) * chartWidth;
  };

  const getY = (freq: number) => {
    return paddingTop + chartHeight - (freq / maxFreq) * chartHeight;
  };

  const barWidth = Math.max(chartWidth / (bins.length * 1.3), 6);

  // Gerar curva acumulada de probabilidade (CDF)
  const cdfPoints = bins
    .map((b) => {
      const x = getX(b.value);
      const y = paddingTop + chartHeight - b.cumulativeProbability * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="monte-carlo-histogram-container" data-testid="monte-carlo-histogram">
      <div className="monte-carlo-chart-header">
        <h4 className="monte-carlo-chart-title">{title}</h4>
        <div className="monte-carlo-legend">
          <span className="legend-item legend-p50">
            <span className="legend-badge-color p50-color"></span>
            <strong>P50 (50%)</strong>: {p50Value} {unitLabel}
          </span>
          <span className="legend-item legend-p85">
            <span className="legend-badge-color p85-color"></span>
            <strong>P85 (85%)</strong>: {p85Value} {unitLabel}
          </span>
          <span className="legend-item legend-p95">
            <span className="legend-badge-color p95-color"></span>
            <strong>P95 (95%)</strong>: {p95Value} {unitLabel}
          </span>
          <span className="legend-item legend-cdf">
            <span className="legend-badge-line cdf-line"></span>
            Curva Acumulada (CDF)
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="monte-carlo-svg"
        aria-label="Gráfico de Histograma de Monte Carlo"
        role="img"
      >
        <defs>
          <linearGradient id="mcBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="mcHoverGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Linhas de Grade Horizontal (Frequência) */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const freqLabel = Math.round(maxFreq * ratio);
          return (
            <g key={ratio} className="chart-grid-line">
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
                {freqLabel}
              </text>
            </g>
          );
        })}

        {/* Eixo X - Linha base */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255, 255, 255, 0.2)"
        />

        {/* Barras do Histograma */}
        {bins.map((bin) => {
          const x = getX(bin.value) - barWidth / 2;
          const y = getY(bin.frequency);
          const barHeight = Math.max(chartHeight - (y - paddingTop), 2);
          const isHovered = hoveredBin?.value === bin.value;

          return (
            <rect
              key={bin.value}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={3}
              fill={isHovered ? 'url(#mcHoverGradient)' : 'url(#mcBarGradient)'}
              className="histogram-bar"
              onMouseEnter={() => setHoveredBin(bin)}
              onMouseLeave={() => setHoveredBin(null)}
              data-testid={`bar-${bin.value}`}
            />
          );
        })}

        {/* Curva de Probabilidade Acumulada (CDF) */}
        {bins.length > 1 && (
          <polyline
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeDasharray="3 3"
            points={cdfPoints}
            className="cdf-polyline"
          />
        )}

        {/* Marcador Vertical: P50 (Mediana) */}
        {p50Value >= minVal && p50Value <= maxVal && (
          <g className="percentile-marker p50-marker">
            <line
              x1={getX(p50Value)}
              y1={paddingTop}
              x2={getX(p50Value)}
              y2={paddingTop + chartHeight}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={getX(p50Value)}
              y={paddingTop - 12}
              textAnchor="middle"
              fill="#10b981"
              fontSize="11"
              fontWeight="600"
            >
              P50: {p50Value}
            </text>
          </g>
        )}

        {/* Marcador Vertical: P85 (SLE / Risco Equilibrado) */}
        {p85Value >= minVal && p85Value <= maxVal && (
          <g className="percentile-marker p85-marker">
            <line
              x1={getX(p85Value)}
              y1={paddingTop}
              x2={getX(p85Value)}
              y2={paddingTop + chartHeight}
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="5 3"
            />
            <text
              x={getX(p85Value)}
              y={paddingTop - 12}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="11"
              fontWeight="bold"
            >
              P85: {p85Value}
            </text>
          </g>
        )}

        {/* Marcador Vertical: P95 (Alta Certeza / Cauda) */}
        {p95Value >= minVal && p95Value <= maxVal && (
          <g className="percentile-marker p95-marker">
            <line
              x1={getX(p95Value)}
              y1={paddingTop}
              x2={getX(p95Value)}
              y2={paddingTop + chartHeight}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={getX(p95Value)}
              y={paddingTop - 12}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="11"
              fontWeight="600"
            >
              P95: {p95Value}
            </text>
          </g>
        )}

        {/* Rótulos do Eixo X */}
        {bins
          .filter((_, idx) => idx % Math.max(Math.floor(bins.length / 8), 1) === 0)
          .map((bin) => (
            <text
              key={bin.value}
              x={getX(bin.value)}
              y={paddingTop + chartHeight + 18}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.55)"
              fontSize="11"
            >
              {bin.value} {unitLabel}
            </text>
          ))}
      </svg>

      {/* Tooltip Dinâmico ao passar o mouse sobre as barras */}
      {hoveredBin && (
        <div
          className="monte-carlo-tooltip"
          style={{
            left: `${(getX(hoveredBin.value) / width) * 100}%`,
            top: `${(getY(hoveredBin.frequency) / height) * 100}%`,
          }}
        >
          <div className="tooltip-title">
            {hoveredBin.value} {unitLabel}
          </div>
          <div className="tooltip-row">
            <span>Ocorrências:</span>
            <strong>{hoveredBin.frequency.toLocaleString()} ensaios</strong>
          </div>
          <div className="tooltip-row">
            <span>Frequência:</span>
            <strong>{(hoveredBin.relativeFrequency * 100).toFixed(1)}%</strong>
          </div>
          <div className="tooltip-row">
            <span>{isAscending ? 'Probabilidade de Concluir até este valor' : 'Probabilidade de Entregar pelo menos este valor'}:</span>
            <strong className="tooltip-prob">{(hoveredBin.cumulativeProbability * 100).toFixed(1)}%</strong>
          </div>
        </div>
      )}
    </div>
  );
};

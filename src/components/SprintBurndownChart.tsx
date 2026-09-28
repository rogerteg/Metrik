import React from 'react';
import { SprintBurndown, SprintBurnup, BurndownPoint, BurnupPoint } from '../utils/sprintBurndown';

export interface SprintBurndownChartProps {
  burndown?: SprintBurndown;
  burnup?: SprintBurnup;
  mode?: 'burndown' | 'burnup';
  width?: number;
  height?: number;
}

const PAD = 10;

/**
 * Gráfico de progresso da sprint (Features 039/042) em SVG inline.
 * - `burndown` (padrão): ideal (tracejada) × restante (sólida).
 * - `burnup`: escopo acumulado (tracejada) × concluído acumulado (sólida).
 * Sem dependências externas; acessível por rótulo textual.
 */
export const SprintBurndownChart: React.FC<SprintBurndownChartProps> = ({
  burndown,
  burnup,
  mode = 'burndown',
  width = 320,
  height = 140,
}) => {
  const isBurnup = mode === 'burnup';
  const active = isBurnup ? burnup : burndown;

  if (!active || !active.available || active.points.length === 0) {
    return (
      <p className="sprint-burndown__unavailable" data-testid="burndown-unavailable">
        Defina início e fim da sprint para ver {isBurnup ? 'o burnup' : 'o burndown'}.
      </p>
    );
  }

  const normalized = active.points.map((point) => {
    if (isBurnup) {
      const p = point as BurnupPoint;
      return { day: p.day, a: p.scope, b: p.completed };
    }
    const p = point as BurndownPoint;
    return { day: p.day, a: p.ideal, b: p.remaining };
  });

  const maxY = Math.max(1, active.committed, ...normalized.map((p) => Math.max(p.a, p.b)));
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;
  const stepX = normalized.length > 1 ? innerW / (normalized.length - 1) : 0;

  const line = (value: (p: (typeof normalized)[number]) => number): string =>
    normalized
      .map((p, i) => {
        const x = PAD + i * stepX;
        const y = PAD + innerH * (1 - value(p) / maxY);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const seriesA = line((p) => p.a);
  const seriesB = line((p) => p.b);
  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  const labelA = isBurnup ? 'Escopo' : 'Ideal';
  const labelB = isBurnup ? 'Concluído' : 'Restante';

  return (
    <figure className="sprint-burndown" data-testid={isBurnup ? 'burnup-chart' : 'burndown-chart'}>
      <figcaption className="sprint-burndown__caption">
        {isBurnup ? 'Burnup' : 'Burndown'} — {first.day} a {last.day}
      </figcaption>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${isBurnup ? 'Burnup' : 'Burndown'} da sprint: ${labelA} inicial ${first.a}, ${labelB} final ${last.b}`}
      >
        <line x1={PAD} y1={PAD} x2={PAD} y2={height - PAD} className="sprint-burndown__axis" />
        <line
          x1={PAD}
          y1={height - PAD}
          x2={width - PAD}
          y2={height - PAD}
          className="sprint-burndown__axis"
        />
        <polyline
          points={seriesA}
          className="sprint-burndown__ideal"
          data-testid={isBurnup ? 'burnup-scope' : 'burndown-ideal'}
          fill="none"
        />
        <polyline
          points={seriesB}
          className="sprint-burndown__real"
          data-testid={isBurnup ? 'burnup-completed' : 'burndown-real'}
          fill="none"
        />
      </svg>
      <div className="sprint-burndown__legend">
        <span className="sprint-burndown__legend-ideal">{labelA}</span>
        <span className="sprint-burndown__legend-real">{labelB}</span>
        <span className="sprint-burndown__legend-total" data-testid="burndown-committed">
          Escopo: {active.committed}
        </span>
      </div>
    </figure>
  );
};

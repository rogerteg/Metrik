import React from 'react';
import { SprintBurndown } from '../utils/sprintBurndown';

export interface SprintBurndownChartProps {
  burndown: SprintBurndown;
  width?: number;
  height?: number;
}

const PAD = 10;

/**
 * Burndown da sprint (Feature 039) em SVG inline: linha ideal (tracejada) e
 * linha real (sólida). Sem dependências externas; acessível por rótulo textual.
 */
export const SprintBurndownChart: React.FC<SprintBurndownChartProps> = ({
  burndown,
  width = 320,
  height = 140,
}) => {
  if (!burndown.available || burndown.points.length === 0) {
    return (
      <p className="sprint-burndown__unavailable" data-testid="burndown-unavailable">
        Defina início e fim da sprint para ver o burndown.
      </p>
    );
  }

  const points = burndown.points;
  const maxY = Math.max(
    1,
    burndown.committed,
    ...points.map((p) => Math.max(p.ideal, p.remaining)),
  );
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const toXY = (index: number, value: number): [number, number] => [
    PAD + index * stepX,
    PAD + innerH * (1 - value / maxY),
  ];

  const line = (value: (p: (typeof points)[number]) => number): string =>
    points
      .map((p, i) => {
        const [x, y] = toXY(i, value(p));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const realPath = line((p) => p.remaining);
  const idealPath = line((p) => p.ideal);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="sprint-burndown" data-testid="burndown-chart">
      <figcaption className="sprint-burndown__caption">
        Burndown — {first.day} a {last.day}
      </figcaption>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Burndown da sprint: restante inicial ${first.remaining}, ideal final ${last.ideal}, restante final ${last.remaining}`}
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
          points={idealPath}
          className="sprint-burndown__ideal"
          data-testid="burndown-ideal"
          fill="none"
        />
        <polyline
          points={realPath}
          className="sprint-burndown__real"
          data-testid="burndown-real"
          fill="none"
        />
      </svg>
      <div className="sprint-burndown__legend">
        <span className="sprint-burndown__legend-ideal">Ideal</span>
        <span className="sprint-burndown__legend-real">Restante</span>
        <span className="sprint-burndown__legend-total" data-testid="burndown-committed">
          Escopo: {burndown.committed}
        </span>
      </div>
    </figure>
  );
};

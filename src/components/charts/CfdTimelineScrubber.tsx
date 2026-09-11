import React from 'react';
import { CfdDataPoint } from '../../types/analytics';

export interface CfdTimelineScrubberProps {
  data: CfdDataPoint[];
  maxTotal: number;
  startIndex: number;
  endIndex: number;
  onChangeRange: (startIndex: number, endIndex: number) => void;
}

export const CfdTimelineScrubber: React.FC<CfdTimelineScrubberProps> = ({
  data,
  maxTotal,
  startIndex,
  endIndex,
  onChangeRange,
}) => {
  const pointCount = data.length;
  if (pointCount < 4) {
    return null;
  }

  const scrubberWidth = 500;
  const scrubberHeight = 50;
  const safeMax = Math.max(1, maxTotal);

  // Mapear pontos para uma miniatura de área cumulativa
  const pointsString = data
    .map((d, i) => {
      const x = (i / (pointCount - 1)) * scrubberWidth;
      const y = scrubberHeight - (d.total / safeMax) * (scrubberHeight - 8);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPolygon = `0,${scrubberHeight} ${pointsString} ${scrubberWidth},${scrubberHeight}`;

  // Posições da janela ativa
  const startX = (startIndex / (pointCount - 1)) * scrubberWidth;
  const endX = (endIndex / (pointCount - 1)) * scrubberWidth;
  const windowWidth = Math.max(16, endX - startX);

  return (
    <div className="cfd-timeline-scrubber" data-testid="cfd-timeline-scrubber">
      <div className="scrubber-labels">
        <span className="scrubber-date-start">{data[startIndex]?.date || data[0]?.date}</span>
        <span className="scrubber-title">Navegador de Período (Timeline Zoom)</span>
        <span className="scrubber-date-end">
          {data[endIndex]?.date || data[pointCount - 1]?.date}
        </span>
      </div>

      <div className="scrubber-track-wrapper">
        <svg
          viewBox={`0 0 ${scrubberWidth} ${scrubberHeight}`}
          className="scrubber-svg"
          preserveAspectRatio="none"
        >
          {/* Miniatura do CFD */}
          <polygon points={areaPolygon} fill="rgba(56, 189, 248, 0.25)" />
          <polyline
            points={pointsString}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />

          {/* Janela de Seleção / Overlay */}
          <rect
            x={startX}
            y="2"
            width={windowWidth}
            height={scrubberHeight - 4}
            className="scrubber-selection-window"
            rx="4"
          />
        </svg>

        {/* Sliders HTML para ajuste suave de início e fim */}
        <input
          type="range"
          min={0}
          max={endIndex - 2}
          value={startIndex}
          onChange={(e) => {
            const newStart = Number(e.target.value);
            if (newStart < endIndex) {
              onChangeRange(newStart, endIndex);
            }
          }}
          className="scrubber-range-slider start-slider"
          aria-label="Início do período da timeline"
          data-testid="scrubber-slider-start"
        />
        <input
          type="range"
          min={startIndex + 2}
          max={pointCount - 1}
          value={endIndex}
          onChange={(e) => {
            const newEnd = Number(e.target.value);
            if (newEnd > startIndex) {
              onChangeRange(startIndex, newEnd);
            }
          }}
          className="scrubber-range-slider end-slider"
          aria-label="Fim do período da timeline"
          data-testid="scrubber-slider-end"
        />
      </div>
    </div>
  );
};

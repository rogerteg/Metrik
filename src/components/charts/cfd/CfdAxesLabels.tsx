import React from 'react';
import { CfdDataPoint } from '../../../types/analytics';

export interface CfdAxesLabelsProps {
  maxTotal: number;
  plotHeight: number;
  viewBoxHeight: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  viewBoxWidth: number;
  displayedData: CfdDataPoint[];
}

export const CfdAxesLabels: React.FC<CfdAxesLabelsProps> = ({
  maxTotal,
  plotHeight,
  viewBoxHeight,
  paddingBottom,
  paddingLeft,
  paddingRight,
  viewBoxWidth,
  displayedData,
}) => {
  return (
    <>
      {/* Y-Axis HTML Labels */}
      <div className="chart-grid-lines" style={{ pointerEvents: 'none' }}>
        <div className="grid-line" style={{ bottom: `${(plotHeight / viewBoxHeight) * 100}%` }}>
          <span className="grid-line-label">{maxTotal}</span>
        </div>
        <div className="grid-line" style={{ bottom: `${(plotHeight / 2 / viewBoxHeight) * 100}%` }}>
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
            color: 'var(--text-secondary)',
          }}
        >
          <span>{displayedData[0].date}</span>
          <span>{displayedData[Math.floor(displayedData.length / 2)].date}</span>
          <span>{displayedData[displayedData.length - 1].date}</span>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { ScatterDataPoint } from '../../hooks/useAnalyticsData';

export interface LeadTimeScatterProps {
  data: ScatterDataPoint[];
  maxLeadTime: number;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const LeadTimeScatter: React.FC<LeadTimeScatterProps> = ({
  data,
  maxLeadTime,
  onToggleExpand,
  isExpanded = false,
}) => {
  // Define coordinate space
  const chartWidth = 100;
  const chartHeight = 100;

  // We need to map dates (X axis) evenly. Since it's a scatter plot of the last 14 days,
  // we can just map the 14 days window to X coordinates.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = today.getTime();
  
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - 13);
  const startMs = windowStart.getTime();

  return (
    <div className={`chart-container ${isExpanded ? 'is-chart-expanded' : ''}`}>
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Lead Time (Dias)</h3>
        {onToggleExpand && (
          <button
            type="button"
            className="btn-chart-expand"
            onClick={onToggleExpand}
            title={isExpanded ? 'Restaurar tamanho' : 'Expandir gráfico'}
            aria-label={isExpanded ? 'Restaurar gráfico Lead Time' : 'Expandir gráfico Lead Time'}
          >
            {isExpanded ? '✕ Fechar' : '⛶ Expandir'}
          </button>
        )}
      </div>
      <div className="chart-y-axis-label">Tempo (Dias)</div>

      <div className="scatter-chart-area">
        {/* SVG requires specific aspect ratio handling */}
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          preserveAspectRatio="none" 
          className="scatter-svg"
        >
          {/* Background grid */}
          <line x1="0" y1="0" x2="100" y2="0" className="svg-grid-line" />
          <line x1="0" y1="50" x2="100" y2="50" className="svg-grid-line" />
          <line x1="0" y1="100" x2="100" y2="100" className="svg-grid-line" />

          {/* Plot points */}
          {data.map(point => {
            const ptDate = new Date(point.completedAt).getTime();
            // X position: percentage of time passed between start and end of 14-day window
            // Protect against division by zero if window is 0 somehow (it's 13 days)
            let xPercent = ((ptDate - startMs) / (windowEnd - startMs)) * 100;
            // Clamp between 5 and 95 so dots don't overflow the left/right edges
            xPercent = Math.max(5, Math.min(95, xPercent));

            // Y position: percentage of maxLeadTime
            // In SVG, Y=0 is top, Y=100 is bottom. So we invert it.
            let yPercent = 100 - ((point.leadTimeDays / maxLeadTime) * 100);
            // Clamp between 5 and 95 so dots don't overflow the top/bottom edges
            yPercent = Math.max(5, Math.min(95, yPercent));

            return (
              <circle
                key={point.id}
                cx={`${xPercent}`}
                cy={`${yPercent}`}
                r="3"
                className="scatter-point"
              >
                <title>{`${point.title}\nConcluído em: ${point.completedAt}\nLead Time: ${point.leadTimeDays} dias`}</title>
              </circle>
            );
          })}
        </svg>

        {/* CSS based Y-Axis labels (overlaying the SVG) */}
        <div className="chart-grid-lines">
          <div className="grid-line" style={{ bottom: '100%' }}>
            <span className="grid-line-label">{maxLeadTime}d</span>
          </div>
          <div className="grid-line" style={{ bottom: '50%' }}>
            <span className="grid-line-label">{(maxLeadTime / 2).toFixed(1)}d</span>
          </div>
          <div className="grid-line" style={{ bottom: '0%' }}>
            <span className="grid-line-label">0d</span>
          </div>
        </div>

        {/* X-Axis labels */}
        <div className="scatter-x-axis">
          <span>{windowStart.toISOString().split('T')[0]}</span>
          <span>{today.toISOString().split('T')[0]}</span>
        </div>
      </div>
    </div>
  );
};

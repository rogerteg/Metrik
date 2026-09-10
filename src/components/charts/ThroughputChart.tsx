import React from 'react';
import { ThroughputDataPoint } from '../../hooks/useAnalyticsData';

export interface ThroughputChartProps {
  data: ThroughputDataPoint[];
  maxThroughput: number;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const ThroughputChart: React.FC<ThroughputChartProps> = ({
  data,
  maxThroughput,
  onToggleExpand,
  isExpanded = false,
}) => {
  return (
    <div className={`chart-container ${isExpanded ? 'is-chart-expanded' : ''}`}>
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Throughput (Últimos 14 dias)</h3>
        {onToggleExpand && (
          <button
            type="button"
            className="btn-chart-expand"
            onClick={onToggleExpand}
            title={isExpanded ? 'Restaurar tamanho' : 'Expandir gráfico'}
            aria-label={isExpanded ? 'Restaurar gráfico Throughput' : 'Expandir gráfico Throughput'}
          >
            {isExpanded ? '✕ Fechar' : '⛶ Expandir'}
          </button>
        )}
      </div>
      <div className="chart-y-axis-label">Tarefas Concluídas</div>
      
      <div className="bar-chart-area">
        {/* Y-Axis lines (optional visual guides) */}
        <div className="chart-grid-lines">
          <div className="grid-line" style={{ bottom: '100%' }}>
            <span className="grid-line-label">{maxThroughput}</span>
          </div>
          <div className="grid-line" style={{ bottom: '50%' }}>
            <span className="grid-line-label">{Math.ceil(maxThroughput / 2)}</span>
          </div>
          <div className="grid-line" style={{ bottom: '0%' }}>
            <span className="grid-line-label">0</span>
          </div>
        </div>

        <div className="bar-chart-bars">
          {data.map((point) => {
            // Calculate height percentage, handle maxThroughput = 0 case gracefully just in case
            const heightPercent = maxThroughput > 0 ? (point.count / maxThroughput) * 100 : 0;
            const dateObj = new Date(point.date);
            // Format as DD/MM for short label
            const dateLabel = `${dateObj.getUTCDate().toString().padStart(2, '0')}/${(dateObj.getUTCMonth() + 1).toString().padStart(2, '0')}`;

            return (
              <div 
                key={point.date} 
                className="bar-wrapper"
                title={`${dateLabel}: ${point.count} tarefas`}
              >
                <div 
                  className="bar" 
                  style={{ height: `${heightPercent}%` }}
                >
                  {point.count > 0 && <span className="bar-value">{point.count}</span>}
                </div>
                <div className="bar-label">{dateLabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

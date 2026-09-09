import React from 'react';
import { FlowMetricsSummary } from '../types/kanban';

export interface MetricsBarProps {
  metrics: FlowMetricsSummary;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  return (
    <section className="metrics-bar" aria-label="Métricas de Fluxo">
      <div className="metric-item">
        <span className="metric-label">Throughput</span>
        <span className="metric-value metric-value-highlight" aria-label={`${metrics.throughput} tarefas concluídas`}>
          {metrics.throughput}
        </span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Lead Time Médio</span>
        <span className="metric-value" aria-label={`Lead Time Médio: ${metrics.formattedAvgLeadTime}`}>
          {metrics.formattedAvgLeadTime}
        </span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Cycle Time Médio</span>
        <span className="metric-value" aria-label={`Cycle Time Médio: ${metrics.formattedAvgCycleTime}`}>
          {metrics.formattedAvgCycleTime}
        </span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Eficiência de Fluxo</span>
        <span
          className={`metric-value ${metrics.flowEfficiency !== null && metrics.flowEfficiency >= 70 ? 'metric-value-highlight' : ''}`}
          aria-label={`Eficiência de Fluxo: ${metrics.formattedFlowEfficiency}`}
        >
          {metrics.formattedFlowEfficiency}
        </span>
      </div>

      <div className="metric-item">
        <span className="metric-label">Bloqueios Ativos</span>
        <span
          className={`metric-value ${metrics.blockedCount > 0 ? 'metric-value-danger' : ''}`}
          style={metrics.blockedCount > 0 ? { color: '#ef4444' } : undefined}
          aria-label={`Bloqueios Ativos: ${metrics.blockedCount}`}
        >
          {metrics.blockedCount}
        </span>
      </div>
    </section>
  );
};

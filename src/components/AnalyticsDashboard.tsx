import React, { useState } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import { useCfdData } from '../hooks/useCfdData';
import { MetricsBar } from './MetricsBar';
import { ThroughputChart } from './charts/ThroughputChart';
import { LeadTimeScatter } from './charts/LeadTimeScatter';
import { CumulativeFlowChart } from './charts/CumulativeFlowChart';
import './Analytics.css';

export type ChartType = 'cfd' | 'throughput' | 'leadTime';

export interface AnalyticsDashboardProps {
  tasks: TaskModel[];
  board?: BoardState;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, board }) => {
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);

  // Determinar tarefas concluídas com base na categoria 'done' das colunas do board (ou fallback column === 'done')
  const completedTasks = React.useMemo(() => {
    if (board && board.columns.length > 0) {
      const doneColIds = new Set(board.columns.filter((c) => c.category === 'done').map((c) => c.id));
      return tasks.filter((t) => doneColIds.has(t.column) || Boolean(t.completedAt));
    }
    return tasks.filter((t) => t.column === 'done' || Boolean(t.completedAt));
  }, [tasks, board]);

  // Métricas do resumo (calculadas sobre todas as tarefas do board)
  const metrics = useFlowMetrics(completedTasks, tasks);

  // Dados para os gráficos de Throughput e Lead Time
  const { throughput, scatter, maxThroughput, maxLeadTime } = useAnalyticsData(completedTasks);

  // CFD calculando o fluxo completo com base em todas as colunas do board
  const cfd = useCfdData(tasks, 14, board?.columns);

  const toggleExpand = (chart: ChartType) => {
    setExpandedChart((prev) => (prev === chart ? null : chart));
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-metrics-row">
        {/* Reuse the existing MetricsBar for a high-level summary */}
        <MetricsBar metrics={metrics} />
      </div>

      <div className="dashboard-cfd-row">
        <CumulativeFlowChart
          data={cfd.points}
          maxTotal={cfd.maxTotal}
          isEmpty={cfd.isEmpty}
          columns={board?.columns}
          onToggleExpand={() => toggleExpand('cfd')}
          isExpanded={false}
        />
      </div>

      <div className="dashboard-charts-row">
        <ThroughputChart
          data={throughput}
          maxThroughput={maxThroughput}
          onToggleExpand={() => toggleExpand('throughput')}
          isExpanded={false}
        />
        <LeadTimeScatter
          data={scatter}
          maxLeadTime={maxLeadTime}
          onToggleExpand={() => toggleExpand('leadTime')}
          isExpanded={false}
        />
      </div>

      {/* Modal / Overlay de Gráfico Expandido */}
      {expandedChart && (
        <div
          className="chart-modal-backdrop"
          onClick={() => setExpandedChart(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada do gráfico"
        >
          <div
            className="chart-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {expandedChart === 'cfd' && (
              <CumulativeFlowChart
                data={cfd.points}
                maxTotal={cfd.maxTotal}
                isEmpty={cfd.isEmpty}
                columns={board?.columns}
                onToggleExpand={() => setExpandedChart(null)}
                isExpanded={true}
              />
            )}

            {expandedChart === 'throughput' && (
              <ThroughputChart
                data={throughput}
                maxThroughput={maxThroughput}
                onToggleExpand={() => setExpandedChart(null)}
                isExpanded={true}
              />
            )}

            {expandedChart === 'leadTime' && (
              <LeadTimeScatter
                data={scatter}
                maxLeadTime={maxLeadTime}
                onToggleExpand={() => setExpandedChart(null)}
                isExpanded={true}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};


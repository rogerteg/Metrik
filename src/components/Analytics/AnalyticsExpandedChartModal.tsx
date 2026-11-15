import React from 'react';
import { TaskModel, ColumnModel } from '../../types/kanban';
import { CumulativeFlowChart } from '../charts/CumulativeFlowChart';
import { ThroughputChart } from '../charts/ThroughputChart';
import { LeadTimeScatter } from '../charts/LeadTimeScatter';
import { CycleTimeScatterPlot } from '../charts/CycleTimeScatterPlot';
import { CfdData } from '../../types/analytics';
import { ThroughputDataPoint, ScatterDataPoint } from '../../hooks/useAnalyticsData';

export type ExpandedChartType = 'cfd' | 'throughput' | 'leadTime' | 'cycleTime';

export interface AnalyticsExpandedChartModalProps {
  expandedChart: ExpandedChartType | null;
  onClose: () => void;
  cfd: CfdData;
  columns?: ColumnModel[];
  throughput: ThroughputDataPoint[];
  maxThroughput: number;
  scatter: ScatterDataPoint[];
  maxLeadTime: number;
  completedTasks: TaskModel[];
}

export const AnalyticsExpandedChartModal: React.FC<AnalyticsExpandedChartModalProps> = ({
  expandedChart,
  onClose,
  cfd,
  columns,
  throughput,
  maxThroughput,
  scatter,
  maxLeadTime,
  completedTasks,
}) => {
  if (!expandedChart) return null;

  return (
    <div
      className="chart-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visualização ampliada do gráfico"
    >
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        {expandedChart === 'cfd' && (
          <CumulativeFlowChart
            data={cfd.points}
            maxTotal={cfd.maxTotal}
            isEmpty={cfd.isEmpty}
            columns={columns}
            onToggleExpand={onClose}
            isExpanded={true}
          />
        )}
        {expandedChart === 'throughput' && (
          <ThroughputChart
            data={throughput}
            maxThroughput={maxThroughput}
            onToggleExpand={onClose}
            isExpanded={true}
          />
        )}
        {expandedChart === 'leadTime' && (
          <LeadTimeScatter
            data={scatter}
            maxLeadTime={maxLeadTime}
            onToggleExpand={onClose}
            isExpanded={true}
          />
        )}
        {expandedChart === 'cycleTime' && (
          <CycleTimeScatterPlot tasks={completedTasks} onToggleExpand={onClose} isExpanded={true} />
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { TaskModel } from '../types/kanban';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import { useCfdData } from '../hooks/useCfdData';
import { MetricsBar } from './MetricsBar';
import { ThroughputChart } from './charts/ThroughputChart';
import { LeadTimeScatter } from './charts/LeadTimeScatter';
import { CumulativeFlowChart } from './charts/CumulativeFlowChart';
import './Analytics.css';

interface AnalyticsDashboardProps {
  tasks: TaskModel[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.column === 'done');
  
  // We can reuse the metrics calculations for the summary row
  const metrics = useFlowMetrics(tasks);
  
  // Data for charts
  const { throughput, scatter, maxThroughput, maxLeadTime } = useAnalyticsData(completedTasks);
  const cfd = useCfdData(tasks);

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
        />
      </div>

      <div className="dashboard-charts-row">
        <ThroughputChart data={throughput} maxThroughput={maxThroughput} />
        <LeadTimeScatter data={scatter} maxLeadTime={maxLeadTime} />
      </div>
    </div>
  );
};


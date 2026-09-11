import React, { useState } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import { useCfdData } from '../hooks/useCfdData';
import { MetricsBar } from './MetricsBar';
import { ThroughputChart } from './charts/ThroughputChart';
import { LeadTimeScatter } from './charts/LeadTimeScatter';
import { CumulativeFlowChart } from './charts/CumulativeFlowChart';
import { CycleTimeScatterPlot } from './charts/CycleTimeScatterPlot';
import { AnalyticsNavHeader, AnalyticsTab, CycleTimeViewMode } from './AnalyticsNavHeader';
import './Analytics.css';

export type ChartType = 'cfd' | 'throughput' | 'leadTime' | 'cycleTime';

export interface AnalyticsDashboardProps {
  tasks: TaskModel[];
  board?: BoardState;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, board }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('dashboard');
  const [cycleTimeMode, setCycleTimeMode] = useState<CycleTimeViewMode>('scatter');
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

  // Estado de intervalo customizado do CFD (Requested after / Finished before)
  const [cfdCustomDates, setCfdCustomDates] = useState<{ startDate?: string; endDate?: string } | undefined>(undefined);

  // CFD calculando o fluxo completo com base em todas as colunas do board e filtro customizado
  const cfd = useCfdData(tasks, 14, board?.columns, cfdCustomDates);

  const toggleExpand = (chart: ChartType) => {
    setExpandedChart((prev) => (prev === chart ? null : chart));
  };

  return (
    <div className="analytics-dashboard">
      {/* Barra de Navegação Analítica no Topo */}
      <AnalyticsNavHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cycleTimeMode={cycleTimeMode}
        onSelectCycleTimeMode={setCycleTimeMode}
      />

      {/* Visão 1: Cycle Time focado */}
      {activeTab === 'cycle-time' && (
        <div className="dashboard-focused-view" data-testid="focused-cycle-time-view">
          <CycleTimeScatterPlot
            tasks={completedTasks}
            isExpanded={false}
          />
        </div>
      )}

      {/* Visão 2: Throughput focado */}
      {activeTab === 'throughput' && (
        <div className="dashboard-focused-view" data-testid="focused-throughput-view">
          <ThroughputChart
            data={throughput}
            maxThroughput={maxThroughput}
            isExpanded={false}
          />
        </div>
      )}

      {/* Visão 3: CFD focado */}
      {activeTab === 'cfd' && (
        <div className="dashboard-focused-view" data-testid="focused-cfd-view">
          <CumulativeFlowChart
            data={cfd.points}
            maxTotal={cfd.maxTotal}
            isEmpty={cfd.isEmpty}
            columns={board?.columns}
            onFilterDateRange={(startDate, endDate) => setCfdCustomDates({ startDate, endDate })}
            onResetDateFilter={() => setCfdCustomDates(undefined)}
            isExpanded={false}
          />
        </div>
      )}

      {/* Visão 4: Bloqueios */}
      {activeTab === 'blockers' && (
        <div className="dashboard-focused-view" data-testid="focused-blockers-view">
          <CycleTimeScatterPlot
            tasks={completedTasks}
            initialTimeWindowDays={0}
          />
        </div>
      )}

      {/* Visão 0: Dashboard Geral Consolidado */}
      {activeTab === 'dashboard' && (
        <>
          <div className="dashboard-metrics-row">
            {/* Resumo executivo de métricas de fluxo */}
            <MetricsBar metrics={metrics} />
          </div>

          <div className="dashboard-cfd-row">
            <CumulativeFlowChart
              data={cfd.points}
              maxTotal={cfd.maxTotal}
              isEmpty={cfd.isEmpty}
              columns={board?.columns}
              onFilterDateRange={(startDate, endDate) => setCfdCustomDates({ startDate, endDate })}
              onResetDateFilter={() => setCfdCustomDates(undefined)}
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
            <CycleTimeScatterPlot
              tasks={completedTasks}
              title="Cycle Time (Percentis)"
              subtitle="Tempo de ciclo com linhas de percentil 50%, 85% e 95%"
              onToggleExpand={() => toggleExpand('cycleTime')}
              isExpanded={false}
            />
          </div>
        </>
      )}

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

            {expandedChart === 'cycleTime' && (
              <CycleTimeScatterPlot
                tasks={completedTasks}
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



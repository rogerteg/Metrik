import React, { useState, useMemo } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import {
  AnalyticsCategory,
  CycleTimeViewMode,
  BlockerViewMode,
  DatasetFilterConfig,
} from '../types/analytics';
import { filterTasksByDatasetConfig } from '../utils/datasetFilter';
import { calculateSleMetrics } from '../utils/sleCalculator';
import { calculateBlockerClusters } from '../utils/blockerAnalytics';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import { useCfdData } from '../hooks/useCfdData';
import { MetricsBar } from './MetricsBar';
import { ThroughputChart } from './charts/ThroughputChart';
import { ThroughputAnalyticsView } from './ThroughputAnalyticsView';
import { LeadTimeScatter } from './charts/LeadTimeScatter';
import { CumulativeFlowChart } from './charts/CumulativeFlowChart';
import { CycleTimeScatterPlot } from './charts/CycleTimeScatterPlot';
import { MonteCarloSimulationView } from './MonteCarloSimulationView';
import { WipAgingView } from './WipAgingView';
import { AnalyticsNavHeader } from './AnalyticsNavHeader';
import { DashboardSummaryCards } from './DashboardSummaryCards';
import { SleAnalyticsView } from './SleAnalyticsView';
import { BlockerAnalyticsView } from './BlockerAnalyticsView';
import { DatasetConfigurationDrawer } from './DatasetConfigurationDrawer';
import './Analytics.css';

export type ChartType = 'cfd' | 'throughput' | 'leadTime' | 'cycleTime';

export interface AnalyticsDashboardProps {
  tasks: TaskModel[];
  board?: BoardState;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, board }) => {
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>('dashboard');
  const [cycleTimeMode, setCycleTimeMode] = useState<CycleTimeViewMode>('scatter');
  const [blockerMode, setBlockerMode] = useState<BlockerViewMode>('clustering');
  const [datasetDrawerOpen, setDatasetDrawerOpen] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);

  // Configuração ativa de filtragem do conjunto de dados (Feature 030)
  const [datasetConfig, setDatasetConfig] = useState<DatasetFilterConfig>({
    timeWindow: 'all',
  });

  // Filtragem de tarefas por escopo de amostragem
  const filteredTasks = useMemo(() => {
    return filterTasksByDatasetConfig(tasks, datasetConfig);
  }, [tasks, datasetConfig]);

  const hasActiveDatasetFilters = useMemo(() => {
    return (
      datasetConfig.timeWindow !== 'all' ||
      (datasetConfig.selectedTypes && datasetConfig.selectedTypes.length > 0)
    );
  }, [datasetConfig]);

  // Determinar tarefas concluídas com base na categoria 'done' das colunas do board (ou fallback column === 'done')
  const completedTasks = useMemo(() => {
    if (board && board.columns.length > 0) {
      const doneColIds = new Set(board.columns.filter((c) => c.category === 'done').map((c) => c.id));
      return filteredTasks.filter((t) => doneColIds.has(t.column) || Boolean(t.completedAt));
    }
    return filteredTasks.filter((t) => t.column === 'done' || Boolean(t.completedAt));
  }, [filteredTasks, board]);

  // Métricas do resumo (calculadas sobre as tarefas filtradas)
  const metrics = useFlowMetrics(completedTasks, filteredTasks);

  // Expectativa de Nível de Serviço (SLE) no percentil 85%
  const sleMetrics = useMemo(() => {
    return calculateSleMetrics(completedTasks, 85);
  }, [completedTasks]);

  // Agrupamento de bloqueios e dinâmica temporal
  const blockerSummary = useMemo(() => {
    return calculateBlockerClusters(filteredTasks);
  }, [filteredTasks]);

  // Dados para os gráficos de Throughput e Lead Time
  const { throughput, scatter, maxThroughput, maxLeadTime } = useAnalyticsData(completedTasks);

  // Estado de intervalo customizado do CFD (Requested after / Finished before)
  const [cfdCustomDates, setCfdCustomDates] = useState<{ startDate?: string; endDate?: string } | undefined>(undefined);

  // CFD calculando o fluxo completo com base em todas as colunas do board e filtro customizado
  const cfd = useCfdData(filteredTasks, 14, board?.columns, cfdCustomDates);

  const toggleExpand = (chart: ChartType) => {
    setExpandedChart((prev) => (prev === chart ? null : chart));
  };

  return (
    <div className="analytics-dashboard">
      {/* Barra de Navegação Analítica no Topo com as 8 Categorias e Disparo de Dados */}
      <AnalyticsNavHeader
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        cycleTimeMode={cycleTimeMode}
        onSelectCycleTimeMode={setCycleTimeMode}
        blockerMode={blockerMode}
        onSelectBlockerMode={setBlockerMode}
        onToggleDatasetDrawer={() => setDatasetDrawerOpen((prev) => !prev)}
        hasActiveDatasetFilters={hasActiveDatasetFilters}
      />

      {/* Visão 1: Cycle Time focado */}
      {activeCategory === 'cycle-time' && (
        <div className="dashboard-focused-view" data-testid="focused-cycle-time-view">
          <CycleTimeScatterPlot
            tasks={completedTasks}
            isExpanded={false}
          />
        </div>
      )}

      {/* Visão 2: Throughput focado */}
      {activeCategory === 'throughput' && (
        <div className="dashboard-focused-view" data-testid="focused-throughput-view">
          <ThroughputAnalyticsView tasks={filteredTasks} />
        </div>
      )}

      {/* Visão 3: Envelhecimento do WIP (Aging WIP) */}
      {activeCategory === 'wip' && (
        <div className="dashboard-focused-view" data-testid="focused-wip-view">
          <WipAgingView tasks={filteredTasks} columns={board?.columns} />
        </div>
      )}

      {/* Visão 4: CFD / Fluxo focado */}
      {(activeCategory === 'flow' || activeCategory === 'cfd') && (
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

      {/* Visão 5: Impedimentos / Bloqueios */}
      {activeCategory === 'blockers' && (
        <div className="dashboard-focused-view">
          <BlockerAnalyticsView
            tasks={filteredTasks}
            summary={blockerSummary}
            mode={blockerMode}
            onSelectMode={setBlockerMode}
          />
        </div>
      )}

      {/* Visão 6: SLEs (Expectativas de Nível de Serviço) */}
      {activeCategory === 'sles' && (
        <div className="dashboard-focused-view">
          <SleAnalyticsView tasks={filteredTasks} sle={sleMetrics} />
        </div>
      )}

      {/* Visão 7: Previsões com Simulação Monte Carlo */}
      {activeCategory === 'forecasting' && (
        <div className="dashboard-focused-view" data-testid="focused-forecasting-view">
          <MonteCarloSimulationView tasks={filteredTasks} />
        </div>
      )}

      {/* Visão 0: Dashboard Geral Consolidado */}
      {activeCategory === 'dashboard' && (
        <>
          <div className="dashboard-metrics-row">
            {/* Cartões de síntese executiva */}
            <DashboardSummaryCards
              sle={sleMetrics}
              totalWip={
                filteredTasks.filter(
                  (t) =>
                    t.column === 'in_progress' ||
                    board?.columns.find((c) => c.id === t.column)?.category === 'in_progress'
                ).length
              }
              recentThroughput={metrics.throughput}
              blockedRatePercentage={
                filteredTasks.length > 0
                  ? Math.round((blockerSummary.totalBlockedTasks / filteredTasks.length) * 100)
                  : 0
              }
              onNavigateToSle={() => setActiveCategory('sles')}
              onNavigateToWip={() => setActiveCategory('wip')}
              onNavigateToThroughput={() => setActiveCategory('throughput')}
              onNavigateToBlockers={() => setActiveCategory('blockers')}
            />
          </div>

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

      {/* Gaveta Retrátil de Configuração do Conjunto de Dados */}
      <DatasetConfigurationDrawer
        isOpen={datasetDrawerOpen}
        onClose={() => setDatasetDrawerOpen(false)}
        config={datasetConfig}
        onUpdateConfig={(patch) => setDatasetConfig((prev) => ({ ...prev, ...patch }))}
        onResetToDefaults={() => setDatasetConfig({ timeWindow: 'all' })}
      />
    </div>
  );
};

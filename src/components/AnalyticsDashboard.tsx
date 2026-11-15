import React, { useState, useMemo, useEffect } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import { CardSlePrediction } from '../types/sle';
import { BacklogScopeType } from '../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
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
import { rankTopLeverages } from '../utils/flowLeverageEngine';
import { MetricsBar } from './MetricsBar';
import { ThroughputChart } from './charts/ThroughputChart';
import { ThroughputAnalyticsView } from './ThroughputAnalyticsView';
import { CumulativeFlowChart } from './charts/CumulativeFlowChart';
import { CycleTimeScatterPlot } from './charts/CycleTimeScatterPlot';
import { MonteCarloSimulationView, MonteCarloMode } from './MonteCarloSimulationView';
import { TopLeveragesCard } from './MonteCarlo/TopLeveragesCard';
import { WipAgingView } from './WipAgingView';
import { AnalyticsNavHeader } from './AnalyticsNavHeader';
import { DashboardSummaryCards } from './DashboardSummaryCards';
import { AnalyticsExpandedChartModal } from './Analytics/AnalyticsExpandedChartModal';
import { SleAnalyticsView } from './SleAnalyticsView';
import { BlockerAnalyticsView } from './BlockerAnalyticsView';
import { DatasetConfigurationDrawer } from './DatasetConfigurationDrawer';
import { MikaInsightCard } from './Mika/MikaInsightCard';
import { useDashboardMikaInsights } from '../hooks/useDashboardMikaInsights';
import { ExportReportModal } from './ExportReportModal';
import { ExecutiveReportPrintView } from './ExecutiveReportPrintView';
import { FlowReportSnapshot } from '../types/reports';
import { ReportBoardLike } from '../utils/flowReportExporter';
import './Analytics.css';

export type ChartType = 'cfd' | 'throughput' | 'leadTime' | 'cycleTime';

export interface AnalyticsDashboardProps {
  tasks: TaskModel[];
  board?: BoardState & { id?: string };
  initialCategory?: AnalyticsCategory;
  initialScopeType?: BacklogScopeType;
  initialScopeId?: string;
  slePredictions?: Record<string, CardSlePrediction>;
  initialForecastMode?: MonteCarloMode;
  onSelectTask?: (taskId: string) => void;
  onApplyWipLimit?: (columnId: string, newLimit: number) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = (props) => {
  const {
    tasks,
    board,
    initialCategory,
    initialScopeType,
    initialScopeId,
    slePredictions,
    initialForecastMode,
    onSelectTask,
    onApplyWipLimit,
  } = props;
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>(
    initialCategory || 'dashboard',
  );

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);
  const [cycleTimeMode, setCycleTimeMode] = useState<CycleTimeViewMode>('scatter');
  const [blockerMode, setBlockerMode] = useState<BlockerViewMode>('clustering');
  const [datasetDrawerOpen, setDatasetDrawerOpen] = useState(false);
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [printSnapshot, setPrintSnapshot] = useState<FlowReportSnapshot | null>(null);

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

  const boardId = board?.id || 'default-board';
  const columns = useMemo(() => board?.columns || [], [board?.columns]);
  const { mikaInsights, mikaLoading, handleRefreshMika } = useDashboardMikaInsights(
    boardId,
    columns,
    filteredTasks,
  );

  // Determinar tarefas concluídas com base na categoria 'done' das colunas do board (ou fallback column === 'done')
  const completedTasks = useMemo(() => {
    if (board && board.columns.length > 0) {
      const doneColIds = new Set(
        board.columns.filter((c) => c.category === 'done').map((c) => c.id),
      );
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

  // Alavancas de fluxo prescritivas (Feature 058)
  const topLeverages = useMemo(() => {
    return rankTopLeverages({
      boardId,
      tasks: filteredTasks,
      columns: board?.columns || [],
      slePredictions,
      deliveryDaysCount: completedTasks.length,
    });
  }, [boardId, board?.columns, filteredTasks, slePredictions, completedTasks.length]);

  // Dados para os gráficos de Throughput e Lead Time
  const { throughput, scatter, maxThroughput, maxLeadTime } = useAnalyticsData(completedTasks);

  // Estado de intervalo customizado do CFD (Requested after / Finished before)
  const [cfdCustomDates, setCfdCustomDates] = useState<
    { startDate?: string; endDate?: string } | undefined
  >(undefined);

  // CFD calculando o fluxo completo com base em todas as colunas do board e filtro customizado
  const cfd = useCfdData(filteredTasks, 14, board?.columns, cfdCustomDates);

  const toggleExpand = (chart: ChartType) => {
    setExpandedChart((prev) => (prev === chart ? null : chart));
  };

  const totalWip = useMemo(
    () =>
      filteredTasks.filter(
        (t) =>
          t.column === 'in_progress' ||
          board?.columns.find((c) => c.id === t.column)?.category === 'in_progress',
      ).length,
    [filteredTasks, board?.columns],
  );

  const blockedRatePercentage = useMemo(
    () =>
      filteredTasks.length > 0
        ? Math.round((blockerSummary.totalBlockedTasks / filteredTasks.length) * 100)
        : 0,
    [filteredTasks.length, blockerSummary.totalBlockedTasks],
  );

  const dateFilterLabel =
    datasetConfig.timeWindow === 'all'
      ? 'Todos os dados do quadro'
      : datasetConfig.timeWindow === 'custom'
        ? `Customizado: ${datasetConfig.customStartDate || ''} até ${datasetConfig.customEndDate || ''}`
        : `Últimos ${datasetConfig.timeWindow} dias`;

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
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      {/* Diagnósticos Preditivos e Insights da Mika AI Flow Copilot (Feature 048) */}
      <MikaInsightCard
        insights={mikaInsights}
        onRefresh={handleRefreshMika}
        isLoading={mikaLoading}
      />

      {/* Visão 1: Cycle Time focado */}
      {activeCategory === 'cycle-time' && (
        <div className="dashboard-focused-view" data-testid="focused-cycle-time-view">
          <CycleTimeScatterPlot tasks={completedTasks} isExpanded={false} />
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
          <MonteCarloSimulationView
            tasks={filteredTasks}
            columns={board?.columns}
            initialMode={initialForecastMode}
            initialScopeType={initialScopeType}
            initialScopeId={initialScopeId}
            slePredictions={slePredictions}
            onSelectTask={onSelectTask}
            onApplyWipLimit={onApplyWipLimit}
          />
        </div>
      )}

      {/* Visão 0: Dashboard Geral Consolidado */}
      {activeCategory === 'dashboard' && (
        <>
          <div className="dashboard-metrics-row mb-3">
            <TopLeveragesCard
              summary={topLeverages}
              onSelectTask={onSelectTask}
              onNavigateToSimulator={() => setActiveCategory('forecasting')}
            />
          </div>
          <div className="dashboard-metrics-row">
            {/* Cartões de síntese executiva */}
            <DashboardSummaryCards
              sle={sleMetrics}
              totalWip={totalWip}
              recentThroughput={metrics.throughput}
              blockedRatePercentage={blockedRatePercentage}
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
      <AnalyticsExpandedChartModal
        expandedChart={expandedChart}
        onClose={() => setExpandedChart(null)}
        cfd={cfd}
        columns={board?.columns}
        throughput={throughput}
        maxThroughput={maxThroughput}
        scatter={scatter}
        maxLeadTime={maxLeadTime}
        completedTasks={completedTasks}
      />

      {/* Gaveta Retrátil de Configuração do Conjunto de Dados */}
      <DatasetConfigurationDrawer
        isOpen={datasetDrawerOpen}
        onClose={() => setDatasetDrawerOpen(false)}
        config={datasetConfig}
        onUpdateConfig={(patch) => setDatasetConfig((prev) => ({ ...prev, ...patch }))}
        onResetToDefaults={() => setDatasetConfig({ timeWindow: 'all' })}
      />

      {/* Modal de Configuração de Escopo e Exportação de Relatórios (Feature 051) */}
      {board && (
        <ExportReportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          board={board as unknown as ReportBoardLike}
          tasks={tasks}
          filteredTasks={filteredTasks}
          mikaInsights={mikaInsights}
          activeDateFilterLabel={dateFilterLabel}
          hasActiveFilters={hasActiveDatasetFilters}
          onGeneratePdf={(snapshot) => setPrintSnapshot(snapshot)}
        />
      )}

      {/* Visualização de Impressão Executiva A4 (@media print) */}
      {printSnapshot && (
        <ExecutiveReportPrintView
          snapshot={printSnapshot}
          onClose={() => setPrintSnapshot(null)}
          autoPrint={true}
        />
      )}
    </div>
  );
};

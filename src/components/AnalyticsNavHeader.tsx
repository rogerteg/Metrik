import React, { useState, useRef, useEffect } from 'react';
import { AnalyticsCategory, CycleTimeViewMode, BlockerViewMode } from '../types/analytics';

export type AnalyticsTab = AnalyticsCategory;

export interface AnalyticsNavHeaderProps {
  /** Categoria atualmente ativa (Feature 030) */
  activeCategory?: AnalyticsCategory;
  /** Callback ao selecionar categoria (Feature 030) */
  onSelectCategory?: (category: AnalyticsCategory) => void;

  /** Retrocompatibilidade com implementações prévias */
  activeTab?: AnalyticsCategory;
  onSelectTab?: (category: AnalyticsCategory) => void;

  /** Modo de visualização de Cycle Time ('scatter' | 'histogram') */
  cycleTimeMode?: CycleTimeViewMode;
  onSelectCycleTimeMode?: (mode: CycleTimeViewMode) => void;

  /** Modo de visualização de Blockers ('clustering' | 'dynamics') */
  blockerMode?: BlockerViewMode;
  onSelectBlockerMode?: (mode: BlockerViewMode) => void;

  /** Callback para alternar gaveta de configuração de dados */
  onToggleDatasetDrawer?: () => void;
  /** Indicador visual se há filtros ativos */
  hasActiveDatasetFilters?: boolean;
}

export const AnalyticsNavHeader: React.FC<AnalyticsNavHeaderProps> = ({
  activeCategory,
  onSelectCategory,
  activeTab,
  onSelectTab,
  cycleTimeMode = 'scatter',
  onSelectCycleTimeMode,
  blockerMode = 'clustering',
  onSelectBlockerMode,
  onToggleDatasetDrawer,
  hasActiveDatasetFilters = false,
}) => {
  const currentCategory = activeCategory || activeTab || 'dashboard';

  const selectCategory = (cat: AnalyticsCategory) => {
    if (onSelectCategory) onSelectCategory(cat);
    if (onSelectTab) onSelectTab(cat);
  };

  const [cycleDropdownOpen, setCycleDropdownOpen] = useState(false);
  const [blockerDropdownOpen, setBlockerDropdownOpen] = useState(false);

  const cycleDropdownRef = useRef<HTMLDivElement>(null);
  const blockerDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(target)) {
        setCycleDropdownOpen(false);
      }
      if (blockerDropdownRef.current && !blockerDropdownRef.current.contains(target)) {
        setBlockerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCycleTimeModeSelect = (mode: CycleTimeViewMode) => {
    selectCategory('cycle-time');
    if (onSelectCycleTimeMode) {
      onSelectCycleTimeMode(mode);
    }
    setCycleDropdownOpen(false);
  };

  const handleBlockerModeSelect = (mode: BlockerViewMode) => {
    selectCategory('blockers');
    if (onSelectBlockerMode) {
      onSelectBlockerMode(mode);
    }
    setBlockerDropdownOpen(false);
  };

  const isFlowActive = currentCategory === 'flow' || currentCategory === 'cfd';

  return (
    <nav className="analytics-nav-header" aria-label="Navegação Analítica">
      <div className="analytics-nav-tabs">
        {/* 1. Dashboard Geral */}
        <button
          type="button"
          className={`analytics-nav-tab ${currentCategory === 'dashboard' ? 'is-active' : ''}`}
          onClick={() => selectCategory('dashboard')}
          data-testid="tab-dashboard"
        >
          <span className="analytics-tab-icon">📊</span>
          <span>Dashboard</span>
        </button>

        {/* 2. Cycle Time (com dropdown Scatter vs Histograma) */}
        <div className="analytics-nav-dropdown-wrapper" ref={cycleDropdownRef}>
          <div className="analytics-nav-tab-group">
            <button
              type="button"
              className={`analytics-nav-tab ${currentCategory === 'cycle-time' ? 'is-active' : ''}`}
              onClick={() => selectCategory('cycle-time')}
              data-testid="tab-cycle-time"
            >
              <span className="analytics-tab-icon">⏱️</span>
              <span>Cycle Time</span>
              {currentCategory === 'cycle-time' && (
                <span className="cycle-time-mode-badge">
                  {cycleTimeMode === 'scatter' ? 'Scatter' : 'Histogram'}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`analytics-nav-dropdown-trigger ${cycleDropdownOpen ? 'is-open' : ''} ${currentCategory === 'cycle-time' ? 'is-active' : ''}`}
              onClick={() => setCycleDropdownOpen((prev) => !prev)}
              aria-label="Opções de visualização de Cycle Time"
              aria-haspopup="true"
              aria-expanded={cycleDropdownOpen}
              data-testid="cycle-time-dropdown-trigger"
            >
              ▾
            </button>
          </div>

          {cycleDropdownOpen && (
            <div className="analytics-nav-dropdown-menu" role="menu">
              <button
                type="button"
                className={`analytics-dropdown-item ${cycleTimeMode === 'scatter' ? 'is-selected' : ''}`}
                onClick={() => handleCycleTimeModeSelect('scatter')}
                role="menuitem"
                data-testid="mode-scatter-plot"
              >
                <span className="dropdown-item-title">Scatter Plot (Dispersão)</span>
                <span className="dropdown-item-desc">Percentis P50, P85, P95 e itens concluídos</span>
              </button>
              <button
                type="button"
                className={`analytics-dropdown-item ${cycleTimeMode === 'histogram' ? 'is-selected' : ''}`}
                onClick={() => handleCycleTimeModeSelect('histogram')}
                role="menuitem"
                data-testid="mode-histogram"
              >
                <span className="dropdown-item-title">Histograma de Frequência</span>
                <span className="dropdown-item-desc">Distribuição de tempos e cauda de variabilidade</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Throughput */}
        <button
          type="button"
          className={`analytics-nav-tab ${currentCategory === 'throughput' ? 'is-active' : ''}`}
          onClick={() => selectCategory('throughput')}
          data-testid="tab-throughput"
        >
          <span className="analytics-tab-icon">📈</span>
          <span>Throughput</span>
        </button>

        {/* 4. WIP / WIP Aging */}
        <button
          type="button"
          className={`analytics-nav-tab ${currentCategory === 'wip' ? 'is-active' : ''}`}
          onClick={() => selectCategory('wip')}
          data-testid="tab-wip"
        >
          <span className="analytics-tab-icon">⏳</span>
          <span>WIP Aging</span>
        </button>

        {/* 5. Flow / CFD */}
        <button
          type="button"
          className={`analytics-nav-tab ${isFlowActive ? 'is-active' : ''}`}
          onClick={() => selectCategory('flow')}
          data-testid="tab-flow"
        >
          <span className="analytics-tab-icon">🌊</span>
          <span>CFD / Fluxo</span>
        </button>

        {/* 6. Blockers / Impedimentos (com dropdown Clustering vs Dynamics) */}
        <div className="analytics-nav-dropdown-wrapper" ref={blockerDropdownRef}>
          <div className="analytics-nav-tab-group">
            <button
              type="button"
              className={`analytics-nav-tab ${currentCategory === 'blockers' ? 'is-active' : ''}`}
              onClick={() => selectCategory('blockers')}
              data-testid="tab-blockers"
            >
              <span className="analytics-tab-icon">🚫</span>
              <span>Impedimentos</span>
              {currentCategory === 'blockers' && (
                <span className="cycle-time-mode-badge">
                  {blockerMode === 'clustering' ? 'Clustering' : 'Dynamics'}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`analytics-nav-dropdown-trigger ${blockerDropdownOpen ? 'is-open' : ''} ${currentCategory === 'blockers' ? 'is-active' : ''}`}
              onClick={() => setBlockerDropdownOpen((prev) => !prev)}
              aria-label="Opções de visualização de Impedimentos"
              aria-haspopup="true"
              aria-expanded={blockerDropdownOpen}
              data-testid="blockers-dropdown-trigger"
            >
              ▾
            </button>
          </div>

          {blockerDropdownOpen && (
            <div className="analytics-nav-dropdown-menu" role="menu">
              <button
                type="button"
                className={`analytics-dropdown-item ${blockerMode === 'clustering' ? 'is-selected' : ''}`}
                onClick={() => handleBlockerModeSelect('clustering')}
                role="menuitem"
                data-testid="mode-clustering"
              >
                <span className="dropdown-item-title">Blocker Clustering</span>
                <span className="dropdown-item-desc">Agrupamento e frequência por motivo de bloqueio</span>
              </button>
              <button
                type="button"
                className={`analytics-dropdown-item ${blockerMode === 'dynamics' ? 'is-selected' : ''}`}
                onClick={() => handleBlockerModeSelect('dynamics')}
                role="menuitem"
                data-testid="mode-dynamics"
              >
                <span className="dropdown-item-title">Blocker Dynamics</span>
                <span className="dropdown-item-desc">Retenção temporal acumulada e impacto no Lead Time</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. SLEs */}
        <button
          type="button"
          className={`analytics-nav-tab ${currentCategory === 'sles' ? 'is-active' : ''}`}
          onClick={() => selectCategory('sles')}
          data-testid="tab-sles"
        >
          <span className="analytics-tab-icon">🎯</span>
          <span>SLEs</span>
        </button>

        {/* 8. Previsões / Simulação Monte Carlo */}
        <button
          type="button"
          className={`analytics-nav-tab ${currentCategory === 'forecasting' ? 'is-active' : ''}`}
          onClick={() => selectCategory('forecasting')}
          data-testid="tab-forecasting"
        >
          <span className="analytics-tab-icon">🎲</span>
          <span>Monte Carlo</span>
        </button>
      </div>

      {/* Botão de disparo da Gaveta de Configuração do Conjunto de Dados */}
      {onToggleDatasetDrawer && (
        <div className="analytics-nav-actions">
          <button
            type="button"
            className={`analytics-dataset-drawer-trigger ${hasActiveDatasetFilters ? 'has-filters' : ''}`}
            onClick={onToggleDatasetDrawer}
            aria-label="Configurar conjunto de dados"
            data-testid="dataset-drawer-trigger"
            title="Configurar amostragem de dados e filtros temporais"
          >
            <span className="analytics-action-icon">🎛️</span>
            <span className="analytics-action-text">Dados</span>
            {hasActiveDatasetFilters && (
              <span className="dataset-filter-indicator" data-testid="dataset-filter-indicator" title="Filtros ativos" />
            )}
          </button>
        </div>
      )}
    </nav>
  );
};

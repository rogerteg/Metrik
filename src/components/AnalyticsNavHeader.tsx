import React, { useState, useRef, useEffect } from 'react';

export type AnalyticsTab = 'dashboard' | 'cycle-time' | 'throughput' | 'cfd' | 'blockers' | 'forecasting';
export type CycleTimeViewMode = 'scatter' | 'histogram';

export interface AnalyticsNavHeaderProps {
  activeTab: AnalyticsTab;
  onSelectTab: (tab: AnalyticsTab) => void;
  cycleTimeMode?: CycleTimeViewMode;
  onSelectCycleTimeMode?: (mode: CycleTimeViewMode) => void;
}

export const AnalyticsNavHeader: React.FC<AnalyticsNavHeaderProps> = ({
  activeTab,
  onSelectTab,
  cycleTimeMode = 'scatter',
  onSelectCycleTimeMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleCycleTimeTabClick = () => {
    onSelectTab('cycle-time');
  };

  const handleDropdownItemClick = (mode: CycleTimeViewMode) => {
    onSelectTab('cycle-time');
    if (onSelectCycleTimeMode) {
      onSelectCycleTimeMode(mode);
    }
    setDropdownOpen(false);
  };

  return (
    <nav className="analytics-nav-header" aria-label="Navegação Analítica">
      <div className="analytics-nav-tabs">
        {/* Tab 1: Dashboard Geral */}
        <button
          type="button"
          className={`analytics-nav-tab ${activeTab === 'dashboard' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
          data-testid="tab-dashboard"
        >
          <span className="analytics-tab-icon">📊</span>
          <span>Dashboard</span>
        </button>

        {/* Tab 2: Cycle Time (com dropdown de modos) */}
        <div className="analytics-nav-dropdown-wrapper" ref={dropdownRef}>
          <div className="analytics-nav-tab-group">
            <button
              type="button"
              className={`analytics-nav-tab ${activeTab === 'cycle-time' ? 'is-active' : ''}`}
              onClick={handleCycleTimeTabClick}
              data-testid="tab-cycle-time"
            >
              <span className="analytics-tab-icon">⏱️</span>
              <span>Cycle Time</span>
              {activeTab === 'cycle-time' && (
                <span className="cycle-time-mode-badge">
                  {cycleTimeMode === 'scatter' ? 'Scatter' : 'Histogram'}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`analytics-nav-dropdown-trigger ${dropdownOpen ? 'is-open' : ''} ${activeTab === 'cycle-time' ? 'is-active' : ''}`}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Opções de visualização de Cycle Time"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              data-testid="cycle-time-dropdown-trigger"
            >
              ▾
            </button>
          </div>

          {dropdownOpen && (
            <div className="analytics-nav-dropdown-menu" role="menu">
              <button
                type="button"
                className={`analytics-dropdown-item ${cycleTimeMode === 'scatter' ? 'is-selected' : ''}`}
                onClick={() => handleDropdownItemClick('scatter')}
                role="menuitem"
                data-testid="mode-scatter-plot"
              >
                <span className="dropdown-item-title">Scatter Plot (Dispersão)</span>
                <span className="dropdown-item-desc">Percentis P50, P85, P95 e itens concluídos</span>
              </button>
              <button
                type="button"
                className={`analytics-dropdown-item ${cycleTimeMode === 'histogram' ? 'is-selected' : ''}`}
                onClick={() => handleDropdownItemClick('histogram')}
                role="menuitem"
                data-testid="mode-histogram"
              >
                <span className="dropdown-item-title">Histograma de Frequência</span>
                <span className="dropdown-item-desc">Distribuição de tempos e cauda de variabilidade</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 3: Throughput */}
        <button
          type="button"
          className={`analytics-nav-tab ${activeTab === 'throughput' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('throughput')}
          data-testid="tab-throughput"
        >
          <span className="analytics-tab-icon">📈</span>
          <span>Throughput</span>
        </button>

        {/* Tab 4: CFD / Fluxo */}
        <button
          type="button"
          className={`analytics-nav-tab ${activeTab === 'cfd' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('cfd')}
          data-testid="tab-cfd"
        >
          <span className="analytics-tab-icon">🌊</span>
          <span>CFD / Fluxo</span>
        </button>

        {/* Tab 5: Bloqueios */}
        <button
          type="button"
          className={`analytics-nav-tab ${activeTab === 'blockers' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('blockers')}
          data-testid="tab-blockers"
        >
          <span className="analytics-tab-icon">🚫</span>
          <span>Bloqueios</span>
        </button>

        {/* Tab 6: Previsões / Simulação Monte Carlo */}
        <button
          type="button"
          className={`analytics-nav-tab ${activeTab === 'forecasting' ? 'is-active' : ''}`}
          onClick={() => onSelectTab('forecasting')}
          data-testid="tab-forecasting"
        >
          <span className="analytics-tab-icon">🎲</span>
          <span>Monte Carlo</span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { FlowPercentiles } from '../../utils/statistics';

export interface ChartControlsPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  percentilesVisibility: {
    p50: boolean;
    p85: boolean;
    p95: boolean;
  };
  onTogglePercentile: (percentileKey: 'p50' | 'p85' | 'p95') => void;
  highlightBlocked: boolean;
  onToggleHighlightBlocked: () => void;
  percentiles: FlowPercentiles;
  timeWindowDays: number;
  onChangeTimeWindowDays: (days: number) => void;
}

export const ChartControlsPanel: React.FC<ChartControlsPanelProps> = ({
  isOpen,
  onToggleOpen,
  percentilesVisibility,
  onTogglePercentile,
  highlightBlocked,
  onToggleHighlightBlocked,
  percentiles,
  timeWindowDays,
  onChangeTimeWindowDays,
}) => {
  return (
    <>
      {/* Botão de alternância retrátil na borda do gráfico */}
      <button
        type="button"
        className={`chart-controls-toggle-btn ${isOpen ? 'is-active' : ''}`}
        onClick={onToggleOpen}
        title={isOpen ? 'Recolher controles do gráfico' : 'Abrir controles do gráfico'}
        aria-label={isOpen ? 'Recolher controles do gráfico' : 'Abrir controles do gráfico'}
        aria-expanded={isOpen}
        data-testid="controls-panel-toggle"
      >
        <span className="controls-toggle-icon">⚙️</span>
        <span className="controls-toggle-label">{isOpen ? 'Ocultar Controles' : 'Controles'}</span>
      </button>

      {/* Painel lateral retrátil */}
      <aside
        className={`chart-controls-drawer ${isOpen ? 'is-open' : ''}`}
        aria-label="Controles do Gráfico de Dispersão"
        data-testid="chart-controls-drawer"
      >
        <div className="chart-controls-header">
          <div className="controls-header-title">
            <span className="controls-icon">🎛️</span>
            <h4>Controles do Gráfico</h4>
          </div>
          <button
            type="button"
            className="btn-close-controls"
            onClick={onToggleOpen}
            title="Fechar controles"
            aria-label="Fechar controles"
          >
            ✕
          </button>
        </div>

        <div className="chart-controls-content">
          {/* Seção 1: Janela Temporal */}
          <div className="controls-section">
            <h5 className="controls-section-title">Janela Temporal</h5>
            <div className="time-window-selector">
              {[
                { label: '14 dias', value: 14 },
                { label: '30 dias', value: 30 },
                { label: '60 dias', value: 60 },
                { label: 'Tudo', value: 0 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`time-window-chip ${timeWindowDays === option.value ? 'is-selected' : ''}`}
                  onClick={() => onChangeTimeWindowDays(option.value)}
                  data-testid={`time-window-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seção 2: Linhas de Percentis */}
          <div className="controls-section">
            <h5 className="controls-section-title">Linhas de Percentis</h5>
            <div className="percentile-toggles-list">
              {/* P50 - Mediana */}
              <label className="toggle-switch-row" data-testid="toggle-row-p50">
                <input
                  type="checkbox"
                  checked={percentilesVisibility.p50}
                  onChange={() => onTogglePercentile('p50')}
                  data-testid="switch-p50"
                />
                <span className="toggle-switch-slider"></span>
                <div className="toggle-switch-info">
                  <div className="toggle-label-with-color">
                    <span className="percentile-color-indicator p50"></span>
                    <span className="percentile-label-name">50% (Mediana)</span>
                  </div>
                  <span className="percentile-value-badge p50">{percentiles.p50} dias</span>
                </div>
              </label>

              {/* P85 - SLE */}
              <label className="toggle-switch-row" data-testid="toggle-row-p85">
                <input
                  type="checkbox"
                  checked={percentilesVisibility.p85}
                  onChange={() => onTogglePercentile('p85')}
                  data-testid="switch-p85"
                />
                <span className="toggle-switch-slider"></span>
                <div className="toggle-switch-info">
                  <div className="toggle-label-with-color">
                    <span className="percentile-color-indicator p85"></span>
                    <span className="percentile-label-name">85% (SLE Típico)</span>
                  </div>
                  <span className="percentile-value-badge p85">{percentiles.p85} dias</span>
                </div>
              </label>

              {/* P95 - Cauda / Certeza */}
              <label className="toggle-switch-row" data-testid="toggle-row-p95">
                <input
                  type="checkbox"
                  checked={percentilesVisibility.p95}
                  onChange={() => onTogglePercentile('p95')}
                  data-testid="switch-p95"
                />
                <span className="toggle-switch-slider"></span>
                <div className="toggle-switch-info">
                  <div className="toggle-label-with-color">
                    <span className="percentile-color-indicator p95"></span>
                    <span className="percentile-label-name">95% (Variabilidade)</span>
                  </div>
                  <span className="percentile-value-badge p95">{percentiles.p95} dias</span>
                </div>
              </label>
            </div>
          </div>

          {/* Seção 3: Destaque de Itens Bloqueados */}
          <div className="controls-section">
            <h5 className="controls-section-title">Análise de Bloqueios</h5>
            <label className="toggle-switch-row" data-testid="toggle-row-blocked">
              <input
                type="checkbox"
                checked={highlightBlocked}
                onChange={onToggleHighlightBlocked}
                data-testid="switch-highlight-blocked"
              />
              <span className="toggle-switch-slider alert-slider"></span>
              <div className="toggle-switch-info">
                <div className="toggle-label-with-color">
                  <span className="percentile-color-indicator blocked"></span>
                  <span className="percentile-label-name">Destacar Bloqueados</span>
                </div>
                <span className="controls-hint-text">Colorir itens com impedimentos</span>
              </div>
            </label>
          </div>

          {/* Seção 4: Resumo Estatístico */}
          <div className="controls-section summary-stats-box">
            <h5 className="controls-section-title">Resumo Estatístico</h5>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Amostra:</span>
                <span className="stat-value">{percentiles.count} itens</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mínimo:</span>
                <span className="stat-value">{percentiles.min} d</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Máximo:</span>
                <span className="stat-value">{percentiles.max} d</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SLE (85%):</span>
                <span className="stat-value highlight-p85">{percentiles.p85} d</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

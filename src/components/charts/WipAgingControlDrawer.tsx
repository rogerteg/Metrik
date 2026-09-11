import React from 'react';

export interface WipAgingControlDrawerProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  showP50: boolean;
  onToggleP50: () => void;
  showP70: boolean;
  onToggleP70: () => void;
  showP85: boolean;
  onToggleP85: () => void;
  showP95: boolean;
  onToggleP95: () => void;
  highlightBlockedOnly: boolean;
  onToggleHighlightBlockedOnly: () => void;
  onSelectAllPercentiles: () => void;
  onClearAllPercentiles: () => void;
}

export const WipAgingControlDrawer: React.FC<WipAgingControlDrawerProps> = ({
  isOpen,
  onToggleOpen,
  showP50,
  onToggleP50,
  showP70,
  onToggleP70,
  showP85,
  onToggleP85,
  showP95,
  onToggleP95,
  highlightBlockedOnly,
  onToggleHighlightBlockedOnly,
  onSelectAllPercentiles,
  onClearAllPercentiles,
}) => {
  return (
    <>
      {/* Botão de Toggle da Gaveta Direita */}
      <button
        type="button"
        className={`wip-drawer-toggle-btn right-toggle ${isOpen ? 'is-active' : ''}`}
        onClick={onToggleOpen}
        title={isOpen ? 'Ocultar controles do gráfico' : 'Controles do Gráfico (Percentis & Alertas)'}
        aria-expanded={isOpen}
        data-testid="wip-controls-toggle"
      >
        <span className="toggle-icon">📊</span>
        <span className="toggle-text">{isOpen ? 'Ocultar Controles' : 'Controles'}</span>
      </button>

      {/* Gaveta Retrátil Direita */}
      <aside
        className={`wip-aging-drawer right-drawer ${isOpen ? 'is-open' : ''}`}
        aria-label="Controles do Gráfico de Aging WIP"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-icon">📈</span>
            <h4 className="drawer-title">Controls for this Chart</h4>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onToggleOpen}
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </div>

        {/* Seção 1: Percentis de Ritmo (Pace Percentiles) */}
        <div className="drawer-section">
          <div className="section-title">
            <span>% Pace Percentiles</span>
          </div>

          <div className="percentile-checkbox-grid">
            <label className="checkbox-item-label">
              <input
                type="checkbox"
                checked={showP50}
                onChange={onToggleP50}
                data-testid="toggle-p50"
              />
              <span className="perc-tag tag-p50">50% (Mediana)</span>
            </label>

            <label className="checkbox-item-label">
              <input
                type="checkbox"
                checked={showP70}
                onChange={onToggleP70}
                data-testid="toggle-p70"
              />
              <span className="perc-tag tag-p70">70%</span>
            </label>

            <label className="checkbox-item-label">
              <input
                type="checkbox"
                checked={showP85}
                onChange={onToggleP85}
                data-testid="toggle-p85"
              />
              <span className="perc-tag tag-p85">85% (SLE)</span>
            </label>

            <label className="checkbox-item-label">
              <input
                type="checkbox"
                checked={showP95}
                onChange={onToggleP95}
                data-testid="toggle-p95"
              />
              <span className="perc-tag tag-p95">95% (Cauda)</span>
            </label>
          </div>

          <div className="percentile-bulk-actions">
            <button
              type="button"
              className="bulk-btn"
              onClick={onSelectAllPercentiles}
              data-testid="select-all-percentiles"
            >
              Select All
            </button>
            <button
              type="button"
              className="bulk-btn"
              onClick={onClearAllPercentiles}
              data-testid="clear-all-percentiles"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Seção 2: Alertas e Destaque de Bloqueios */}
        <div className="drawer-section">
          <div className="section-title">
            <span>⚠️ Alertas & Impedimentos</span>
          </div>

          <label className="checkbox-item-label full-width">
            <input
              type="checkbox"
              checked={highlightBlockedOnly}
              onChange={onToggleHighlightBlockedOnly}
              data-testid="toggle-blocked-only"
            />
            <span className="blocked-alert-text">
              Destacar somente itens bloqueados (Impediments)
            </span>
          </label>
        </div>
      </aside>
    </>
  );
};

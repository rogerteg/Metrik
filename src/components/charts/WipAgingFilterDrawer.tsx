import React, { useState } from 'react';
import { ColumnModel } from '../../types/kanban';

export interface WipAgingFilterDrawerProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  columns?: ColumnModel[];
  visibleColumnIds: Set<string>;
  onToggleColumnVisibility: (colId: string) => void;
  startDateAfter: string;
  onApplyFilters: (startDate: string) => void;
  onResetFilters: () => void;
}

export const WipAgingFilterDrawer: React.FC<WipAgingFilterDrawerProps> = ({
  isOpen,
  onToggleOpen,
  columns = [],
  visibleColumnIds,
  onToggleColumnVisibility,
  startDateAfter,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDateAfter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localStartDate);
  };

  const activeColumns = columns.filter((c) => c.category !== 'done' && c.id !== 'done');

  return (
    <>
      {/* Botão de Toggle da Gaveta Esquerda */}
      <button
        type="button"
        className={`wip-drawer-toggle-btn left-toggle ${isOpen ? 'is-active' : ''}`}
        onClick={onToggleOpen}
        title={isOpen ? 'Ocultar configuração do dataset' : 'Configuração do Dataset (Workflow & Datas)'}
        aria-expanded={isOpen}
        data-testid="wip-dataset-toggle"
      >
        <span className="toggle-icon">⚙️</span>
        <span className="toggle-text">{isOpen ? 'Ocultar Filtros' : 'Dataset'}</span>
      </button>

      {/* Gaveta Retrátil Esquerda */}
      <aside
        className={`wip-aging-drawer left-drawer ${isOpen ? 'is-open' : ''}`}
        aria-label="Configuração do Dataset"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-icon">🎛️</span>
            <h4 className="drawer-title">Dataset Configuration</h4>
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

        <div className="drawer-notice-box">
          <p>
            Tarefas em andamento têm a idade calculada a partir de sua data de início. Use os filtros para restringir a janela de análise.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          <div className="drawer-field">
            <label htmlFor="wip-start-date" className="drawer-field-label">
              Start Date after:
            </label>
            <input
              id="wip-start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="drawer-input-date"
              data-testid="wip-start-date-input"
            />
          </div>

          <div className="drawer-field">
            <span className="drawer-field-label">Workflow Stages:</span>
            <div className="drawer-stages-list">
              {activeColumns.map((col) => {
                const isChecked = visibleColumnIds.has(col.id);
                return (
                  <label key={col.id} className="stage-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleColumnVisibility(col.id)}
                    />
                    <span className="stage-name">{col.title}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="drawer-actions">
            <button
              type="submit"
              className="drawer-submit-btn"
              data-testid="wip-apply-filters-btn"
            >
              LOAD / Aplicar
            </button>
            <button
              type="button"
              className="drawer-reset-btn"
              onClick={() => {
                setLocalStartDate('');
                onResetFilters();
              }}
            >
              Resetar
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

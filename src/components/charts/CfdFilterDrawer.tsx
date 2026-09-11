import React, { useState } from 'react';
import { ColumnModel } from '../../types/kanban';

export interface CfdFilterDrawerProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  startDate: string;
  endDate: string;
  onApplyDateFilter: (startDate: string, endDate: string) => void;
  columns?: ColumnModel[];
  visibleColumnIds: Set<string>;
  onToggleColumnVisibility: (columnId: string) => void;
  onResetFilters: () => void;
}

export const CfdFilterDrawer: React.FC<CfdFilterDrawerProps> = ({
  isOpen,
  onToggleOpen,
  startDate,
  endDate,
  onApplyDateFilter,
  columns,
  visibleColumnIds,
  onToggleColumnVisibility,
  onResetFilters,
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (localStartDate && localEndDate && localStartDate > localEndDate) {
      setErrorMessage('A data inicial não pode ser posterior à data final.');
      return;
    }
    setErrorMessage(null);
    onApplyDateFilter(localStartDate, localEndDate);
  };

  return (
    <>
      {/* Botão de Alternância Retrátil no Canto Esquerdo do CFD */}
      <button
        type="button"
        className={`cfd-filters-toggle-btn ${isOpen ? 'is-active' : ''}`}
        onClick={onToggleOpen}
        title={isOpen ? 'Ocultar filtros de fluxo' : 'Filtros de fluxo (Datas & Workflow)'}
        aria-label={isOpen ? 'Ocultar filtros de fluxo' : 'Abrir filtros de fluxo'}
        aria-expanded={isOpen}
        data-testid="cfd-filters-toggle"
      >
        <span className="cfd-toggle-icon">🔍</span>
        <span className="cfd-toggle-label">{isOpen ? 'Ocultar Filtros' : 'Filtros de Fluxo'}</span>
      </button>

      {/* Drawer Retrátil à Esquerda */}
      <aside
        className={`cfd-filters-drawer ${isOpen ? 'is-open' : ''}`}
        aria-label="Filtros de Fluxo Cumulativo"
        data-testid="cfd-filters-drawer"
      >
        <div className="cfd-filters-header">
          <div className="cfd-filters-title">
            <span className="filter-icon">⚙️</span>
            <h4>Filtros do CFD</h4>
          </div>
          <button
            type="button"
            className="btn-close-cfd-filters"
            onClick={onToggleOpen}
            title="Fechar filtros"
            aria-label="Fechar filtros"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} className="cfd-filters-content">
          {/* Seção 1: Intervalo de Datas (Requested after / Finished before) */}
          <div className="cfd-filter-section">
            <h5 className="cfd-filter-heading">Intervalo de Datas</h5>
            <div className="cfd-date-fields">
              <div className="cfd-date-field">
                <label htmlFor="cfd-start-date" className="cfd-field-label">
                  Requested after:
                </label>
                <input
                  id="cfd-start-date"
                  type="date"
                  className="cfd-date-input"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                  data-testid="cfd-input-start-date"
                />
              </div>

              <div className="cfd-date-field">
                <label htmlFor="cfd-end-date" className="cfd-field-label">
                  Finished before:
                </label>
                <input
                  id="cfd-end-date"
                  type="date"
                  className="cfd-date-input"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                  data-testid="cfd-input-end-date"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="cfd-filter-error" role="alert" data-testid="cfd-filter-error">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Seção 2: Seleção de Workflow / Etapas */}
          {columns && columns.length > 0 && (
            <div className="cfd-filter-section">
              <h5 className="cfd-filter-heading">Workflow & Etapas Ativas</h5>
              <div className="cfd-columns-list">
                {columns.map((col) => {
                  const isVisible = visibleColumnIds.has(col.id);
                  return (
                    <label key={col.id} className="cfd-column-checkbox-row">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => onToggleColumnVisibility(col.id)}
                        data-testid={`cfd-col-toggle-${col.id}`}
                      />
                      <span
                        className="cfd-col-color-dot"
                        style={{ background: col.color || '#38bdf8' }}
                      />
                      <span className="cfd-col-title">{col.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="cfd-filter-actions">
            <button
              type="submit"
              className="btn-cfd-load"
              data-testid="btn-cfd-load"
            >
              LOAD / Aplicar
            </button>
            <button
              type="button"
              className="btn-cfd-reset"
              onClick={() => {
                onResetFilters();
                setLocalStartDate('');
                setLocalEndDate('');
                setErrorMessage(null);
              }}
              data-testid="btn-cfd-reset"
            >
              Restaurar Padrão
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

import React from 'react';
import { FilterState } from '../types/filter';
import { PriorityLevel } from '../types/kanban';
import { PRIORITY_CONFIG } from '../utils/priorityConfig';
import { getTagTheme } from '../utils/tagColors';

export interface FilterBarProps {
  filters: FilterState;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: PriorityLevel | 'all') => void;
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  availableTags: string[];
  visibleCount: number;
  totalCount: number;
}

const PRIORITY_OPTIONS: { level: PriorityLevel | 'all'; label: string; color?: string }[] = [
  { level: 'all', label: 'Todas' },
  { level: 'urgent', label: PRIORITY_CONFIG.urgent.label, color: PRIORITY_CONFIG.urgent.color },
  { level: 'high', label: PRIORITY_CONFIG.high.label, color: PRIORITY_CONFIG.high.color },
  { level: 'medium', label: PRIORITY_CONFIG.medium.label, color: PRIORITY_CONFIG.medium.color },
  { level: 'low', label: PRIORITY_CONFIG.low.label, color: PRIORITY_CONFIG.low.color },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onSearchChange,
  onPriorityChange,
  onToggleTag,
  onClearFilters,
  hasActiveFilters,
  availableTags,
  visibleCount,
  totalCount,
}) => {
  return (
    <section className="filter-bar" aria-label="Barra de filtros e busca">
      <div className="filter-bar__top">
        {/* Campo de Busca Textual */}
        <div className="filter-search-box">
          <span className="filter-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="filter-search-input"
            placeholder="Buscar tarefas por título..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar tarefas"
          />
          {filters.searchQuery && (
            <button
              type="button"
              className="filter-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Limpar busca"
              title="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        {/* Resumo e Botão de Limpar */}
        <div className="filter-bar__summary">
          <span className="filter-counter" aria-live="polite">
            Exibindo {visibleCount} de {totalCount} tarefas
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-clear-filters"
              onClick={onClearFilters}
              aria-label="Limpar filtros"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar__controls">
        {/* Seletor de Prioridade */}
        <div className="filter-group filter-group--priority" role="group" aria-label="Filtrar por prioridade">
          <span className="filter-group__label">Prioridade:</span>
          <div className="filter-pills">
            {PRIORITY_OPTIONS.map((opt) => {
              const isSelected = filters.priorityFilter === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  className={`filter-pill ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onPriorityChange(opt.level)}
                  aria-pressed={isSelected}
                  style={
                    opt.color && isSelected
                      ? { borderColor: opt.color, color: opt.color }
                      : undefined
                  }
                >
                  {opt.color && (
                    <span
                      className="filter-pill__dot"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pílulas de Tags Disponíveis */}
        {availableTags.length > 0 && (
          <div className="filter-group filter-group--tags" role="group" aria-label="Filtrar por etiqueta">
            <span className="filter-group__label">Tags:</span>
            <div className="filter-pills">
              {availableTags.map((tag) => {
                const isSelected = filters.selectedTags.includes(tag);
                const theme = getTagTheme(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-pill filter-pill--tag ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => onToggleTag(tag)}
                    aria-pressed={isSelected}
                    style={
                      isSelected
                        ? {
                            color: theme.color,
                            backgroundColor: theme.bg,
                            borderColor: theme.border,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="filter-pill__dot"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

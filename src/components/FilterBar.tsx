import React from 'react';
import { FilterState } from '../types/filter';
import { PriorityLevel, SprintModel } from '../types/kanban';
import { PRIORITY_CONFIG } from '../utils/priorityConfig';
import { getTagTheme } from '../utils/tagColors';
import { orderSprints } from '../utils/sprintMetrics';

export interface FilterBarProps {
  filters: FilterState;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: PriorityLevel | 'all') => void;
  onToggleTag: (tag: string) => void;
  onToggleOnlyBlocked?: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  availableTags: string[];
  visibleCount: number;
  totalCount: number;
  blockedCount?: number;
  /** Sprints do quadro (Feature 038) */
  sprints?: SprintModel[];
  activeSprintId?: string | null;
  onSprintChange?: (sprintFilter: string) => void;
  /** Layout das colunas (Feature 026): comprimir à janela / redefinir larguras. */
  onFitColumns?: () => void;
  onResetColumns?: () => void;
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
  onToggleOnlyBlocked,
  onClearFilters,
  hasActiveFilters,
  availableTags,
  visibleCount,
  totalCount,
  blockedCount,
  sprints,
  activeSprintId,
  onSprintChange,
  onFitColumns,
  onResetColumns,
}) => {
  const sprintOptions = React.useMemo(() => orderSprints(sprints), [sprints]);

  return (
    <section className="filter-bar" aria-label="Barra de filtros e busca">
      <div className="filter-bar__top">
        {/* Campo de Busca Textual */}
        <div className="filter-search-box">
          <span className="filter-search-icon" aria-hidden="true">
            🔍
          </span>
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
        {/* Filtro por Sprint (Feature 038) */}
        {onSprintChange && (
          <div className="filter-group filter-group--sprint" aria-label="Filtrar por sprint">
            <label className="filter-group__label" htmlFor="filter-sprint">
              Sprint:
            </label>
            <select
              id="filter-sprint"
              className="filter-select"
              value={filters.sprintFilter}
              onChange={(e) => onSprintChange(e.target.value)}
              data-testid="filter-sprint-select"
            >
              <option value="all">Todas as sprints</option>
              <option value="active">Sprint ativa</option>
              <option value="none">Sem sprint</option>
              {sprintOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.id === activeSprintId ? ' (ativa)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seletor de Prioridade */}
        <div
          className="filter-group filter-group--priority"
          role="group"
          aria-label="Filtrar por prioridade"
        >
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
                    <span className="filter-pill__dot" style={{ backgroundColor: opt.color }} />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pílulas de Tags Disponíveis */}
        {availableTags.length > 0 && (
          <div
            className="filter-group filter-group--tags"
            role="group"
            aria-label="Filtrar por etiqueta"
          >
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
                    <span className="filter-pill__dot" style={{ backgroundColor: theme.color }} />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtro de Bloqueados (Feature 013) */}
        {onToggleOnlyBlocked && (
          <div
            className="filter-group filter-group--blocked"
            role="group"
            aria-label="Filtrar por impedimento"
          >
            <span className="filter-group__label">Status:</span>
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill filter-pill--blocked ${filters.onlyBlocked ? 'is-selected' : ''}`}
                onClick={onToggleOnlyBlocked}
                aria-pressed={filters.onlyBlocked}
                data-testid="filter-only-blocked"
                style={
                  filters.onlyBlocked
                    ? {
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      }
                    : undefined
                }
              >
                <span>⛔ Apenas Bloqueados</span>
                {typeof blockedCount === 'number' && blockedCount > 0 && (
                  <span
                    style={{
                      marginLeft: '6px',
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {blockedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Layout das colunas (Feature 026) */}
        {(onFitColumns || onResetColumns) && (
          <div
            className="filter-group filter-group--layout"
            role="group"
            aria-label="Layout das colunas"
          >
            <span className="filter-group__label">Layout:</span>
            <div className="filter-pills">
              {onFitColumns && (
                <button
                  type="button"
                  className="filter-pill"
                  onClick={onFitColumns}
                  data-testid="fit-columns"
                  title="Comprimir as colunas para caberem na janela"
                >
                  Ajustar à janela
                </button>
              )}
              {onResetColumns && (
                <button
                  type="button"
                  className="filter-pill"
                  onClick={onResetColumns}
                  data-testid="reset-columns"
                  title="Voltar todas as colunas à largura padrão"
                >
                  Redefinir larguras
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

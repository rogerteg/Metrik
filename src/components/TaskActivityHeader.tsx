import React, { useState } from 'react';
import { ActivityCategoryFilter } from '../types/taskActivity';

export interface TaskActivityHeaderProps {
  unreadCount?: number;
  isSearchOpen: boolean;
  searchQuery: string;
  selectedCategory: ActivityCategoryFilter;
  onToggleSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  onToggleUnreadFilter: () => void;
  onSelectCategoryFilter: (category: ActivityCategoryFilter) => void;
}

const SearchIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const FilterIcon: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TaskActivityHeader: React.FC<TaskActivityHeaderProps> = ({
  unreadCount = 0,
  isSearchOpen,
  searchQuery,
  selectedCategory,
  onToggleSearch,
  onSearchQueryChange,
  onToggleUnreadFilter,
  onSelectCategoryFilter,
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const categories: { key: ActivityCategoryFilter; label: string }[] = [
    { key: 'all', label: 'Todas as atividades' },
    { key: 'comments', label: 'Comentários' },
    { key: 'mutations', label: 'Alterações de campos' },
    { key: 'assignments', label: 'Atribuições de responsáveis' },
    { key: 'creations', label: 'Criação de tarefa' },
  ];

  return (
    <div className="task-activity-header-bar">
      <div className="task-activity-title-row">
        <h3 className="task-activity-heading">Activity</h3>

        <div className="task-activity-actions">
          {/* Search Toggle */}
          <button
            type="button"
            aria-label="Buscar atividade"
            onClick={onToggleSearch}
            className={`task-activity-btn-icon ${isSearchOpen ? 'active' : ''}`}
          >
            <SearchIcon />
          </button>

          {/* Notification Bell with Badge Counter */}
          <button
            type="button"
            aria-label="Notificações de atividade"
            onClick={onToggleUnreadFilter}
            className="task-activity-btn-icon"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="task-activity-unread-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Filter Dropdown Menu */}
          <button
            type="button"
            aria-label="Filtrar atividade"
            onClick={() => setIsFilterMenuOpen((prev) => !prev)}
            className={`task-activity-btn-icon ${selectedCategory !== 'all' ? 'active' : ''}`}
          >
            <FilterIcon />
          </button>

          {/* Filter Dropdown */}
          {isFilterMenuOpen && (
            <div className="task-activity-filter-dropdown">
              <div style={{ padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)' }}>
                Filtrar por tipo
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    onSelectCategoryFilter(cat.key);
                    setIsFilterMenuOpen(false);
                  }}
                  className="task-activity-filter-item"
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.key && <CheckIcon />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline Search Input */}
      {isSearchOpen && (
        <div style={{ marginTop: 4 }}>
          <input
            type="text"
            placeholder="Buscar no histórico..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            autoFocus
            className="td-input"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          />
        </div>
      )}
    </div>
  );
};

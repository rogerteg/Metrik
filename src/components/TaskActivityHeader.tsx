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

const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const FilterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="flex flex-col gap-2 p-3 border-b border-slate-700/60 bg-slate-900/60">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-200 tracking-wide">Activity</h3>

        <div className="flex items-center gap-1.5 relative">
          {/* Search Toggle */}
          <button
            type="button"
            aria-label="Buscar atividade"
            onClick={onToggleSearch}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors ${
              isSearchOpen ? 'bg-slate-800 text-indigo-400' : ''
            }`}
          >
            <SearchIcon className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge Counter */}
          <button
            type="button"
            aria-label="Notificações de atividade"
            onClick={onToggleUnreadFilter}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 relative transition-colors"
          >
            <BellIcon className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Filter Dropdown Menu */}
          <button
            type="button"
            aria-label="Filtrar atividade"
            onClick={() => setIsFilterMenuOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors ${
              selectedCategory !== 'all' ? 'text-indigo-400 bg-slate-800' : ''
            }`}
          >
            <FilterIcon className="w-4 h-4" />
          </button>

          {/* Filter Dropdown */}
          {isFilterMenuOpen && (
            <div className="absolute right-0 top-9 z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1 text-xs text-slate-300">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
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
                  className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.key && <CheckIcon className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline Search Input */}
      {isSearchOpen && (
        <div className="mt-1">
          <input
            type="text"
            placeholder="Buscar no histórico..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            autoFocus
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
};

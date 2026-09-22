import React from 'react';
import { TimelineFilter, DensityMode } from '../types/taskActivity';

export interface TimelineFilterBarProps {
  activeFilter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  densityMode?: DensityMode;
  onToggleDensity?: () => void;
  counts?: {
    all: number;
    decisions: number;
    comments: number;
    activity: number;
  };
}

const LayersIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const AwardIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SlidersIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const TimelineFilterBar: React.FC<TimelineFilterBarProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  densityMode = 'detailed',
  onToggleDensity,
  counts = { all: 0, decisions: 0, comments: 0, activity: 0 },
}) => {
  return (
    <div className="flex flex-col gap-2.5 border-b border-slate-800 pb-3 mb-2">
      {/* Upper bar: Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            data-testid="timeline-filter-all"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <LayersIcon />
            Todos
            <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300 font-bold">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('decisions')}
            data-testid="timeline-filter-decisions"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeFilter === 'decisions'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow-sm'
                : 'text-amber-400/90 hover:bg-amber-950/40 hover:text-amber-200'
            }`}
          >
            <AwardIcon />
            Decisões
            <span className="ml-0.5 rounded-full bg-amber-900/80 px-1.5 py-0.2 text-[10px] text-amber-200 font-bold">
              {counts.decisions}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('comments')}
            data-testid="timeline-filter-comments"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              activeFilter === 'comments'
                ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <MessageSquareIcon />
            Comentários
            <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-cyan-300 font-bold">
              {counts.comments}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('activity')}
            data-testid="timeline-filter-activity"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              activeFilter === 'activity'
                ? 'bg-purple-900/80 text-purple-200 border border-purple-700/60 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <HistoryIcon />
            Auditoria
            <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-purple-300 font-bold">
              {counts.activity}
            </span>
          </button>
        </div>

        {/* Density toggle button */}
        {onToggleDensity && (
          <button
            type="button"
            onClick={onToggleDensity}
            data-testid="timeline-density-toggle"
            title={`Densidade atual: ${densityMode === 'compact' ? 'Compacto' : 'Detalhado'}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200"
          >
            <SlidersIcon />
            <span className="hidden sm:inline">{densityMode === 'compact' ? 'Modo Compacto' : 'Modo Detalhado'}</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {onSearchChange && (
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por palavra-chave no histórico..."
            data-testid="timeline-search-input"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      )}
    </div>
  );
};

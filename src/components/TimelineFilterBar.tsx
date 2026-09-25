import React from 'react';
import { TimelineFilter, DensityMode } from '../types/taskActivity';
import './TaskActivityFeed.css';

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
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const AwardIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SlidersIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <div className="mrf-filters">
      {/* Upper bar: Tabs & Controls */}
      <div className="mrf-filters__row">
        <div className="mrf-filters__tabs">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            data-testid="timeline-filter-all"
            className={`mrf-filter-tab ${activeFilter === 'all' ? 'is-active' : ''}`}
          >
            <LayersIcon />
            Todos
            <span className="mrf-filter-tab__count">{counts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('decisions')}
            data-testid="timeline-filter-decisions"
            className={`mrf-filter-tab mrf-filter-tab--decisions ${activeFilter === 'decisions' ? 'is-active' : ''}`}
          >
            <AwardIcon />
            Decisões
            <span className="mrf-filter-tab__count">{counts.decisions}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('comments')}
            data-testid="timeline-filter-comments"
            className={`mrf-filter-tab ${activeFilter === 'comments' ? 'is-active' : ''}`}
          >
            <MessageSquareIcon />
            Comentários
            <span className="mrf-filter-tab__count">{counts.comments}</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('activity')}
            data-testid="timeline-filter-activity"
            className={`mrf-filter-tab ${activeFilter === 'activity' ? 'is-active' : ''}`}
          >
            <HistoryIcon />
            Auditoria
            <span className="mrf-filter-tab__count">{counts.activity}</span>
          </button>
        </div>

        {/* Density toggle button */}
        {onToggleDensity && (
          <button
            type="button"
            onClick={onToggleDensity}
            data-testid="timeline-density-toggle"
            title={`Densidade atual: ${densityMode === 'compact' ? 'Compacto' : 'Detalhado'}`}
            className="mrf-filters__density"
          >
            <SlidersIcon />
            <span>{densityMode === 'compact' ? 'Modo Compacto' : 'Modo Detalhado'}</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {onSearchChange && (
        <div className="mrf-search">
          <span className="mrf-search__icon"><SearchIcon /></span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por palavra-chave no histórico..."
            data-testid="timeline-search-input"
            className="mrf-search__input"
          />
        </div>
      )}
    </div>
  );
};

import React from 'react';

export type TimelineFilter = 'all' | 'comments' | 'activity';

export interface TimelineFilterBarProps {
  activeFilter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  commentsCount?: number;
  activityCount?: number;
}

const LayersIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg className="h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="h-3.5 w-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const TimelineFilterBar: React.FC<TimelineFilterBarProps> = ({
  activeFilter,
  onFilterChange,
  commentsCount = 0,
  activityCount = 0,
}) => {
  const totalCount = commentsCount + activityCount;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2.5 mb-3">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        data-testid="timeline-filter-all"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          activeFilter === 'all'
            ? 'bg-slate-700 text-white shadow-sm'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
      >
        <LayersIcon />
        Todos
        <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
          {totalCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('comments')}
        data-testid="timeline-filter-comments"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          activeFilter === 'comments'
            ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 shadow-sm'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
      >
        <MessageSquareIcon />
        Apenas Comentários
        <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-cyan-300">
          {commentsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('activity')}
        data-testid="timeline-filter-activity"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          activeFilter === 'activity'
            ? 'bg-purple-900/80 text-purple-200 border border-purple-700/60 shadow-sm'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
      >
        <HistoryIcon />
        Apenas Auditoria
        <span className="ml-0.5 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-purple-300">
          {activityCount}
        </span>
      </button>
    </div>
  );
};

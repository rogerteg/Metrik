import React from 'react';
import { ActivityLogEntry } from '../types/taskActivity';
import { TaskActivityLogItem } from './TaskActivityLogItem';

export interface TaskActivityLogListProps {
  entries: ActivityLogEntry[];
  isExpanded: boolean;
  collapseThreshold?: number; // Default: 5
  onToggleExpand: () => void;
  emptyStateMessage?: string;
}

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const TaskActivityLogList: React.FC<TaskActivityLogListProps> = ({
  entries,
  isExpanded,
  collapseThreshold = 5,
  onToggleExpand,
  emptyStateMessage = 'Nenhuma atividade registrada ainda',
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 italic">
        {emptyStateMessage}
      </div>
    );
  }

  const hasMore = entries.length > collapseThreshold;
  const displayed = isExpanded ? entries : entries.slice(0, collapseThreshold);

  return (
    <div className="flex flex-col gap-2 p-2">
      <ul className="flex flex-col gap-0.5">
        {displayed.map((entry) => (
          <TaskActivityLogItem key={entry.id} entry={entry} />
        ))}
      </ul>

      {hasMore && (
        <div className="pt-1 border-t border-slate-800/60 flex justify-start">
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Mostrar menos</span>
              </>
            ) : (
              <>
                <ChevronRightIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Mostrar mais</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

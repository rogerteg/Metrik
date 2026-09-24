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

const ChevronRightIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div style={{ padding: 16, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        {emptyStateMessage}
      </div>
    );
  }

  const hasMore = entries.length > collapseThreshold;
  const displayed = isExpanded ? entries : entries.slice(0, collapseThreshold);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {displayed.map((entry) => (
          <TaskActivityLogItem key={entry.id} entry={entry} />
        ))}
      </ul>

      {hasMore && (
        <div style={{ paddingTop: 6, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={onToggleExpand}
            className="td-type-btn"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {isExpanded ? (
              <>
                <ChevronDownIcon />
                <span>Mostrar menos</span>
              </>
            ) : (
              <>
                <ChevronRightIcon />
                <span>Mostrar mais</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

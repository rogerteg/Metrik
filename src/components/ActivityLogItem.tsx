import React from 'react';
import { TaskActivityLog } from '../types/taskActivity';
import { formatDate } from './CommentItem';

export interface ActivityLogItemProps {
  activity: TaskActivityLog;
}

const MoveIcon = () => (
  <svg className="h-3.5 w-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
);

const BlockedIcon = () => (
  <svg className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const UnblockedIcon = () => (
  <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const PriorityIcon = () => (
  <svg className="h-3.5 w-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const TagIcon = () => (
  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CommentIcon = () => (
  <svg className="h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SystemIcon = () => (
  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ activity }) => {
  const renderBadge = () => {
    switch (activity.eventType) {
      case 'moved':
        return {
          icon: <MoveIcon />,
          bg: 'bg-sky-950/60 border-sky-800/60',
          label: 'Movimentação',
        };
      case 'blocked':
        return {
          icon: <BlockedIcon />,
          bg: 'bg-amber-950/60 border-amber-800/60',
          label: 'Impedimento',
        };
      case 'unblocked':
        return {
          icon: <UnblockedIcon />,
          bg: 'bg-emerald-950/60 border-emerald-800/60',
          label: 'Desbloqueio',
        };
      case 'priority_changed':
        return {
          icon: <PriorityIcon />,
          bg: 'bg-purple-950/60 border-purple-800/60',
          label: 'Prioridade',
        };
      case 'tags_changed':
        return {
          icon: <TagIcon />,
          bg: 'bg-slate-800/60 border-slate-700/60',
          label: 'Etiqueta',
        };
      case 'dates_changed':
        return {
          icon: <CalendarIcon />,
          bg: 'bg-indigo-950/60 border-indigo-800/60',
          label: 'Data',
        };
      case 'comment_added':
      case 'comment_deleted':
        return {
          icon: <CommentIcon />,
          bg: 'bg-cyan-950/60 border-cyan-800/60',
          label: 'Comentário',
        };
      default:
        return {
          icon: <SystemIcon />,
          bg: 'bg-slate-800/60 border-slate-700/60',
          label: 'Sistema',
        };
    }
  };

  const badge = renderBadge();

  return (
    <div
      data-testid={`activity-log-item-${activity.id}`}
      className="flex items-start gap-3 rounded-md border border-slate-800/70 bg-slate-900/40 p-2.5 text-xs text-slate-300"
    >
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${badge.bg}`}>
        {badge.icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-200">{activity.description}</span>
          <span className="text-[11px] text-slate-500 shrink-0">{formatDate(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

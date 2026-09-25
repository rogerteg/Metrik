import React from 'react';
import { TaskActivityLog } from '../types/taskActivity';
import { formatDate } from './CommentItem';
import './TaskActivityFeed.css';

export interface ActivityLogItemProps {
  activity: TaskActivityLog;
  compact?: boolean;
}

interface BadgeConfig {
  icon: React.ReactNode;
  color: string;
  background: string;
  border: string;
  label: string;
}

const MoveIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
);

const BlockedIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const UnblockedIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const PriorityIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const TagIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const CalendarIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CommentIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SystemIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const AssignIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const UnassignIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const BADGE_STYLES: Record<string, { color: string; background: string; border: string }> = {
  moved: { color: '#7dd3fc', background: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  blocked: { color: '#fcd34d', background: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.35)' },
  unblocked: { color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)' },
  priority_changed: { color: '#c084fc', background: 'rgba(168, 85, 247, 0.14)', border: 'rgba(168, 85, 247, 0.35)' },
  tags_changed: { color: '#cbd5e1', background: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' },
  dates_changed: { color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.14)', border: 'rgba(99, 102, 241, 0.35)' },
  comment_added: { color: '#7dd3fc', background: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  comment_deleted: { color: '#7dd3fc', background: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  assignment: { color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)' },
  unassignment: { color: '#fcd34d', background: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.35)' },
  system: { color: '#cbd5e1', background: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' },
};

export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ activity, compact = false }) => {
  const renderBadge = (): BadgeConfig => {
    switch (activity.eventType) {
      case 'moved':
        return { icon: <MoveIcon />, label: 'Movimentação', ...BADGE_STYLES.moved };
      case 'blocked':
        return { icon: <BlockedIcon />, label: 'Impedimento', ...BADGE_STYLES.blocked };
      case 'unblocked':
        return { icon: <UnblockedIcon />, label: 'Desbloqueio', ...BADGE_STYLES.unblocked };
      case 'priority_changed':
        return { icon: <PriorityIcon />, label: 'Prioridade', ...BADGE_STYLES.priority_changed };
      case 'tags_changed':
        return { icon: <TagIcon />, label: 'Etiqueta', ...BADGE_STYLES.tags_changed };
      case 'dates_changed':
        return { icon: <CalendarIcon />, label: 'Data', ...BADGE_STYLES.dates_changed };
      case 'comment_added':
      case 'comment_deleted':
        return { icon: <CommentIcon />, label: 'Comentário', ...BADGE_STYLES.comment_added };
      case 'assignment':
        return { icon: <AssignIcon />, label: 'Responsável', ...BADGE_STYLES.assignment };
      case 'unassignment':
        return { icon: <UnassignIcon />, label: 'Responsável', ...BADGE_STYLES.unassignment };
      default:
        return { icon: <SystemIcon />, label: 'Sistema', ...BADGE_STYLES.system };
    }
  };

  const badge = renderBadge();

  return (
    <div
      data-testid={`activity-log-item-${activity.id}`}
      className={`mrf-log ${compact ? 'mrf-log--compact' : ''}`}
    >
      <div
        className="mrf-log__icon"
        style={{ color: badge.color, background: badge.background, borderColor: badge.border }}
      >
        {badge.icon}
      </div>

      <div className="mrf-log__body">
        <div className="mrf-log__head">
          <div className="mrf-log__actor">
            <span>{activity.userName}</span>
            <span className="mrf-log__type">{badge.label}</span>
          </div>
          <span
            className="mrf-log__time"
            title={new Date(activity.timestamp).toLocaleString('pt-BR')}
          >
            {formatDate(activity.timestamp)}
          </span>
        </div>

        <p className="mrf-log__desc">{activity.description}</p>

        {(activity.fromValue || activity.toValue) && (
          <div data-testid="activity-diff-card" className="mrf-log__diff">
            {activity.fromValue && (
              <span className="mrf-log__diff-from">{activity.fromValue}</span>
            )}
            <span className="mrf-log__diff-arrow">➔</span>
            {activity.toValue && (
              <span className="mrf-log__diff-to">{activity.toValue}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

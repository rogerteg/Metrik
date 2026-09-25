import React from 'react';
import { formatDuration } from '../utils/timeFormatters';
import './TaskActivityFeed.css';

export interface TimelineStatsHeaderProps {
  totalComments: number;
  totalDecisions: number;
  totalMoves: number;
  totalBlockedMs?: number;
}

const MessageSquareIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const MoveIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
);

const ShieldAlertIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const TimelineStatsHeader: React.FC<TimelineStatsHeaderProps> = ({
  totalComments,
  totalDecisions,
  totalMoves,
  totalBlockedMs = 0,
}) => {
  return (
    <div className="mrf-stats">
      <div className="mrf-stat mrf-stat--comments">
        <span className="mrf-stat__icon"><MessageSquareIcon /></span>
        <div className="mrf-stat__body">
          <span className="mrf-stat__label">Comentários</span>
          <span className="mrf-stat__value">{totalComments}</span>
        </div>
      </div>

      <div className="mrf-stat mrf-stat--decisions">
        <span className="mrf-stat__icon"><AwardIcon /></span>
        <div className="mrf-stat__body">
          <span className="mrf-stat__label">Decisões</span>
          <span className="mrf-stat__value">{totalDecisions}</span>
        </div>
      </div>

      <div className="mrf-stat mrf-stat--moves">
        <span className="mrf-stat__icon"><MoveIcon /></span>
        <div className="mrf-stat__body">
          <span className="mrf-stat__label">Movimentações</span>
          <span className="mrf-stat__value">{totalMoves}</span>
        </div>
      </div>

      <div className="mrf-stat mrf-stat--blocked">
        <span className="mrf-stat__icon"><ShieldAlertIcon /></span>
        <div className="mrf-stat__body">
          <span className="mrf-stat__label">Tempo Bloqueado</span>
          <span className="mrf-stat__value">
            {totalBlockedMs > 0 ? formatDuration(totalBlockedMs) : '0 min'}
          </span>
        </div>
      </div>
    </div>
  );
};

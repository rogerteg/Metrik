import React from 'react';
import { formatDuration } from '../utils/timeFormatters';

export interface TimelineStatsHeaderProps {
  totalComments: number;
  totalDecisions: number;
  totalMoves: number;
  totalBlockedMs?: number;
}

const MessageSquareIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const MoveIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" />
  </svg>
);

const ShieldAlertIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
      <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-2 border border-slate-800/80">
        <MessageSquareIcon />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Comentários</span>
          <span className="text-sm font-bold text-slate-100">{totalComments}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-2 border border-amber-900/40">
        <AwardIcon />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-amber-400/90">Decisões</span>
          <span className="text-sm font-bold text-amber-300">{totalDecisions}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-2 border border-slate-800/80">
        <MoveIcon />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Movimentações</span>
          <span className="text-sm font-bold text-slate-100">{totalMoves}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-2 border border-slate-800/80">
        <ShieldAlertIcon />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Tempo Bloqueado</span>
          <span className="text-xs font-bold text-rose-300 truncate">
            {totalBlockedMs > 0 ? formatDuration(totalBlockedMs) : '0 min'}
          </span>
        </div>
      </div>
    </div>
  );
};

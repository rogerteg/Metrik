import React, { useState } from 'react';
import { TaskComment } from '../types/taskActivity';
import { renderFormattedText } from '../utils/simpleMarkdown';

export interface CommentItemProps {
  comment: TaskComment;
  onDelete?: (commentId: string) => void;
  canDelete?: boolean;
  compact?: boolean;
}

const MessageSquareIcon = () => (
  <svg width={12} height={12} style={{ width: 12, height: 12, flexShrink: 0 }} className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg width={14} height={14} style={{ width: 14, height: 14, flexShrink: 0 }} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const Trash2Icon = () => (
  <svg width={16} height={16} style={{ width: 16, height: 16, flexShrink: 0 }} className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const formatDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateStr = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} às ${timeStr}`;
  } catch {
    return isoString;
  }
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  canDelete = true,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = comment.text.length > 400;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  const isDecision = Boolean(comment.isDecision);

  return (
    <div
      data-testid={isDecision ? "comment-decision-item" : `comment-item-${comment.id}`}
      className={`group relative flex gap-3 rounded-lg border text-sm text-slate-200 transition-all ${
        compact ? 'p-2.5' : 'p-3'
      } ${
        isDecision
          ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700/80'
      }`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border ${
        isDecision
          ? 'bg-amber-950 text-amber-300 border-amber-600/70'
          : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
      }`}>
        {getInitials(comment.userName || 'US')}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">{comment.userName}</span>
            
            {isDecision ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-600/60 shadow-sm">
                <AwardIcon /> Decisão de Projeto
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-800/40">
                <MessageSquareIcon /> Comentário
              </span>
            )}
          </div>
          <span
            className="text-xs text-slate-500 cursor-help"
            title={new Date(comment.createdAt).toLocaleString('pt-BR')}
          >
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <div className={`text-slate-300 text-sm whitespace-pre-wrap break-words leading-relaxed ${
          isLongText && !expanded ? 'max-h-[120px] overflow-hidden relative' : ''
        }`}>
          {renderFormattedText(isLongText && !expanded ? `${comment.text.slice(0, 400)}...` : comment.text)}
        </div>

        {isLongText && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 self-start text-xs text-cyan-400 hover:text-cyan-300 font-medium focus:outline-none"
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}
      </div>

      {onDelete && canDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          data-testid={`comment-delete-button-${comment.id}`}
          title="Excluir comentário"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-rose-400 rounded focus:outline-none"
        >
          <Trash2Icon />
        </button>
      )}
    </div>
  );
};

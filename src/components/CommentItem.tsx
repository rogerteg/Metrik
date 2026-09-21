import React from 'react';
import { TaskComment } from '../types/taskActivity';

export interface CommentItemProps {
  comment: TaskComment;
  onDelete?: (commentId: string) => void;
  canDelete?: boolean;
}

const MessageSquareIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Trash2Icon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  return (
    <div
      data-testid={`comment-item-${comment.id}`}
      className="group relative flex gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200 transition-colors hover:border-slate-700/80"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-xs font-semibold text-cyan-400 border border-cyan-800/60">
        {getInitials(comment.userName || 'US')}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{comment.userName}</span>
            <span className="inline-flex items-center gap-1 rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-800/40">
              <MessageSquareIcon /> Comentário
            </span>
          </div>
          <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
        </div>
        <div
          className="text-slate-300 text-sm whitespace-pre-wrap break-words leading-relaxed"
        >
          {comment.text}
        </div>
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

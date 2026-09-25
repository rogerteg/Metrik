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
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const Trash2Icon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      data-testid={isDecision ? 'comment-decision-item' : `comment-item-${comment.id}`}
      className={`mrf-comment ${compact ? 'mrf-comment--compact' : ''} ${isDecision ? 'mrf-comment--decision' : ''}`}
    >
      <div className="mrf-comment__avatar">{getInitials(comment.userName || 'US')}</div>

      <div className="mrf-comment__body">
        <div className="mrf-comment__head">
          <div className="mrf-comment__meta">
            <span className="mrf-comment__author">{comment.userName}</span>

            {isDecision ? (
              <span className="mrf-comment__badge mrf-comment__badge--decision">
                <AwardIcon /> Decisão de Projeto
              </span>
            ) : (
              <span className="mrf-comment__badge mrf-comment__badge--comment">
                <MessageSquareIcon /> Comentário
              </span>
            )}
          </div>
          <span
            className="mrf-comment__time"
            title={new Date(comment.createdAt).toLocaleString('pt-BR')}
          >
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <div className={`mrf-comment__text ${isLongText && !expanded ? 'is-clamped' : ''}`}>
          {renderFormattedText(isLongText && !expanded ? `${comment.text.slice(0, 400)}...` : comment.text)}
        </div>

        {isLongText && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mrf-comment__toggle"
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}
      </div>

      {onDelete && canDelete && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          data-testid={`comment-delete-button-${comment.id}`}
          title="Excluir comentário"
          aria-label="Excluir comentário"
          className="mrf-comment__delete"
        >
          <Trash2Icon />
        </button>
      )}
    </div>
  );
};

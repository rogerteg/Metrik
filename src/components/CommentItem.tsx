import React, { useState } from 'react';
import { TaskComment } from '../types/taskActivity';
import { renderFormattedText } from '../utils/simpleMarkdown';

export interface CommentItemProps {
  comment: TaskComment;
  onDelete?: (commentId: string) => void;
  canDelete?: boolean;
  onEdit?: (commentId: string, text: string) => void;
  canEdit?: boolean;
  compact?: boolean;
  /** Prefixo dos `data-testid` (padrão: `comment`, usado pelo feed de atividade). */
  testIdPrefix?: string;
}

const MessageSquareIcon = () => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const AwardIcon = () => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const Trash2Icon = () => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
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
  onEdit,
  canEdit = false,
  compact = false,
  testIdPrefix = 'comment',
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const isLongText = comment.text.length > 400;

  const saveEdit = () => {
    if (!onEdit || !draft.trim()) return;
    onEdit(comment.id, draft);
    setIsEditing(false);
  };

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
      data-testid={
        isDecision ? `${testIdPrefix}-decision-item` : `${testIdPrefix}-item-${comment.id}`
      }
      className={`mrf-comment ${compact ? 'mrf-comment--compact' : ''} ${isDecision ? 'mrf-comment--decision' : ''}`}
    >
      <div className="mrf-comment__avatar">{getInitials(comment.userName || 'US')}</div>

      <div className="mrf-comment__body">
        <div className="mrf-comment__head">
          <div className="mrf-comment__meta">
            <span className="mrf-comment__author" data-testid={`${testIdPrefix}-author`}>
              {comment.userName}
            </span>

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

        {isEditing ? (
          <div className="mrf-comment__edit">
            <textarea
              className="mrf-comment__edit-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Editar comentário"
              data-testid={`${testIdPrefix}-edit-input-${comment.id}`}
            />
            <div className="mrf-comment__edit-actions">
              <button
                type="button"
                onClick={saveEdit}
                disabled={!draft.trim()}
                data-testid={`${testIdPrefix}-edit-save-${comment.id}`}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDraft(comment.text);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`mrf-comment__text ${isLongText && !expanded ? 'is-clamped' : ''}`}
              data-testid={`${testIdPrefix}-text`}
            >
              {renderFormattedText(
                isLongText && !expanded ? `${comment.text.slice(0, 400)}...` : comment.text,
              )}
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
          </>
        )}
      </div>

      {!isEditing && onEdit && canEdit && (
        <button
          type="button"
          onClick={() => {
            setDraft(comment.text);
            setIsEditing(true);
          }}
          data-testid={`${testIdPrefix}-edit-button-${comment.id}`}
          title="Editar comentário"
          aria-label="Editar comentário"
          className="mrf-comment__edit-btn"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      )}

      {onDelete && canDelete && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          data-testid={`${testIdPrefix}-delete-button-${comment.id}`}
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

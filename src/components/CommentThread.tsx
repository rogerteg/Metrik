import React from 'react';
import { TaskComment } from '../types/taskActivity';
import { sortComments, canEditComment, canDeleteComment } from '../utils/cardComments';
import { CommentItem } from './CommentItem';

export interface CommentThreadProps {
  comments?: TaskComment[];
  currentUser: { id: string; name: string };
  isReadOnly?: boolean;
  isAdmin?: boolean;
  onAdd: (text: string) => void;
  onEdit: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
  label?: string;
  emptyLabel?: string;
  testIdPrefix?: string;
}

/**
 * Trilha de comentários reutilizável (Feature 027 delta) para cartão pai e subtarefa.
 * Compõe `CommentItem` (mesmo renderizador do feed de atividade) — uma única
 * apresentação de comentário em todo o produto. As permissões vêm de `cardComments`
 * e o isolamento pai × filho é garantido por quem fornece a lista (`comments`).
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  currentUser,
  isReadOnly = false,
  isAdmin = false,
  onAdd,
  onEdit,
  onDelete,
  label = 'Comentários',
  emptyLabel = 'Nenhum comentário ainda.',
  testIdPrefix = 'comment',
}) => {
  const [draft, setDraft] = React.useState('');

  const ordered = React.useMemo(() => sortComments(comments), [comments]);

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  const requestDelete = (commentId: string) => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (!window.confirm('Excluir este comentário?')) return;
    }
    onDelete(commentId);
  };

  return (
    <div className="metrik-comment-thread" data-testid={`${testIdPrefix}-thread`}>
      <div className="metrik-comment-header">
        <span className="metrik-comment-label">{label}</span>
        <span className="metrik-comment-count" data-testid={`${testIdPrefix}-count`}>
          {ordered.length}
        </span>
      </div>

      {ordered.length === 0 ? (
        <p className="metrik-comment-empty">{emptyLabel}</p>
      ) : (
        <div className="metrik-comment-list">
          {ordered.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              testIdPrefix={testIdPrefix}
              onEdit={onEdit}
              canEdit={!isReadOnly && canEditComment(comment, currentUser.id)}
              onDelete={requestDelete}
              canDelete={!isReadOnly && canDeleteComment(comment, currentUser.id, isAdmin)}
            />
          ))}
        </div>
      )}

      {!isReadOnly && (
        <form className="metrik-comment-composer" onSubmit={submitDraft}>
          <input
            type="text"
            className="metrik-comment-input"
            placeholder="Escreva um comentário..."
            aria-label="Escreva um comentário"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            data-testid={`${testIdPrefix}-input`}
          />
          <button
            type="submit"
            className="metrik-comment-submit"
            disabled={!draft.trim()}
            data-testid={`${testIdPrefix}-submit`}
          >
            Comentar
          </button>
        </form>
      )}
    </div>
  );
};

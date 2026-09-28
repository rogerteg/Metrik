import React from 'react';
import { TaskComment } from '../types/taskActivity';
import { sortComments, canEditComment, canDeleteComment } from '../utils/cardComments';

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

const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Trilha de comentários reutilizável (Feature 027 delta) para cartão pai e subtarefa.
 * Apresentação pura: toda a regra de permissão vem dos helpers de `cardComments`.
 * O isolamento pai × filho é garantido por quem fornece a lista (`comments`).
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
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState('');

  const ordered = React.useMemo(() => sortComments(comments), [comments]);

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };

  const startEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };

  const saveEdit = () => {
    if (!editingId || !editingText.trim()) return;
    onEdit(editingId, editingText);
    setEditingId(null);
    setEditingText('');
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
        <ul className="metrik-comment-list">
          {ordered.map((comment) => {
            const editable = !isReadOnly && canEditComment(comment, currentUser.id);
            const deletable = !isReadOnly && canDeleteComment(comment, currentUser.id, isAdmin);
            const isEditing = editingId === comment.id;

            return (
              <li
                key={comment.id}
                className="metrik-comment-item"
                data-testid={`${testIdPrefix}-item`}
              >
                <div className="metrik-comment-meta">
                  <span className="metrik-comment-author" data-testid={`${testIdPrefix}-author`}>
                    {comment.userName}
                  </span>
                  <time className="metrik-comment-time" dateTime={comment.createdAt}>
                    {formatMoment(comment.createdAt)}
                    {comment.updatedAt ? ' · editado' : ''}
                  </time>
                </div>

                {isEditing ? (
                  <div className="metrik-comment-edit">
                    <textarea
                      className="metrik-comment-edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      aria-label="Editar comentário"
                      data-testid={`${testIdPrefix}-edit-input`}
                    />
                    <div className="metrik-comment-actions">
                      <button
                        type="button"
                        className="metrik-comment-save"
                        onClick={saveEdit}
                        disabled={!editingText.trim()}
                        data-testid={`${testIdPrefix}-edit-save`}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="metrik-comment-cancel"
                        onClick={() => {
                          setEditingId(null);
                          setEditingText('');
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="metrik-comment-text" data-testid={`${testIdPrefix}-text`}>
                    {comment.text}
                  </p>
                )}

                {!isEditing && (editable || deletable) && (
                  <div className="metrik-comment-actions">
                    {editable && (
                      <button
                        type="button"
                        className="metrik-comment-edit-btn"
                        onClick={() => startEdit(comment)}
                        aria-label={`Editar comentário de ${comment.userName}`}
                        data-testid={`${testIdPrefix}-edit`}
                      >
                        Editar
                      </button>
                    )}
                    {deletable && (
                      <button
                        type="button"
                        className="metrik-comment-delete"
                        onClick={() => requestDelete(comment.id)}
                        aria-label={`Excluir comentário de ${comment.userName}`}
                        data-testid={`${testIdPrefix}-delete`}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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

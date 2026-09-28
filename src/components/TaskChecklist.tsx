import React from 'react';
import { SubtaskModel } from '../types/kanban';
import { CommentThread } from './CommentThread';
import { subtaskHasComments } from '../utils/cardComments';

export interface TaskChecklistProps {
  taskId: string;
  subtasks: SubtaskModel[];
  /** Permite criar/concluir/remover subtarefas (falso em somente-leitura ou bloqueado). */
  canEdit: boolean;
  currentUser: { id: string; name: string };
  isAdmin?: boolean;
  onToggle: (subtaskId: string) => void;
  onDelete: (subtaskId: string) => void;
  onAdd: (title: string) => void;
  onAddComment?: (taskId: string, subtaskId: string, text: string) => void;
  onEditComment?: (taskId: string, subtaskId: string, commentId: string, text: string) => void;
  onDeleteComment?: (taskId: string, subtaskId: string, commentId: string) => void;
}

const ChecklistIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

/**
 * Checklist de subtarefas do cartão (extraído de Task.tsx — P3/SRP).
 * Inclui criação, conclusão, remoção com aviso de cascata e comentários por subtarefa.
 */
export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  taskId,
  subtasks,
  canEdit,
  currentUser,
  isAdmin = false,
  onToggle,
  onDelete,
  onAdd,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [openSubtaskComments, setOpenSubtaskComments] = React.useState<Record<string, boolean>>({});

  const completed = subtasks.filter((st) => st.completed).length;
  const hasSubtasks = subtasks.length > 0;
  const progress = hasSubtasks ? Math.round((completed / subtasks.length) * 100) : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitle.trim();
    if (!title || !canEdit) return;
    onAdd(title);
    setNewSubtaskTitle('');
  };

  const handleDelete = (subtaskId: string) => {
    const target = subtasks.find((st) => st.id === subtaskId);
    if (subtaskHasComments(target)) {
      const confirmed =
        typeof window === 'undefined' || typeof window.confirm !== 'function'
          ? true
          : window.confirm('Excluir esta subtarefa? Os comentários dela serão removidos.');
      if (!confirmed) return;
    }
    onDelete(subtaskId);
  };

  if (!hasSubtasks && !canEdit) return null;

  return (
    <div className="task-field-box task-detail-checklist">
      <div className="task-field-header">
        <span className="task-field-label">
          <ChecklistIcon />
          Checklist
        </span>
        {hasSubtasks && (
          <span className="task-detail-checklist-count">
            {completed}/{subtasks.length} · {progress}%
          </span>
        )}
      </div>

      {hasSubtasks && (
        <div
          className="task-detail-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Progresso do checklist"
        >
          <div className="task-detail-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {hasSubtasks && (
        <ul className="task-detail-checklist-items">
          {subtasks.map((st) => (
            <li
              key={st.id}
              className={`task-detail-checklist-item ${st.completed ? 'is-done' : ''}`}
            >
              <div className="task-detail-checklist-row">
                <label className="task-detail-checklist-label">
                  <input
                    type="checkbox"
                    className="task-detail-checkbox"
                    checked={st.completed}
                    onChange={() => onToggle(st.id)}
                    disabled={!canEdit}
                    aria-label={`Alternar subtarefa: ${st.title}`}
                  />
                  <span className="task-detail-checklist-text">{st.title}</span>
                </label>
                <button
                  type="button"
                  className="task-detail-checklist-comments-toggle"
                  onClick={() =>
                    setOpenSubtaskComments((prev) => ({ ...prev, [st.id]: !prev[st.id] }))
                  }
                  aria-expanded={!!openSubtaskComments[st.id]}
                  aria-label={`Comentários da subtarefa: ${st.title}`}
                  title="Comentários da subtarefa"
                  data-testid={`subtask-comments-toggle-${st.id}`}
                >
                  💬 {(st.comments ?? []).length}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="task-detail-checklist-delete"
                    onClick={() => handleDelete(st.id)}
                    aria-label={`Excluir subtarefa: ${st.title}`}
                    title="Excluir subtarefa"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {openSubtaskComments[st.id] && (
                <CommentThread
                  comments={st.comments}
                  currentUser={currentUser}
                  isReadOnly={!onAddComment}
                  isAdmin={isAdmin}
                  label="Comentários da subtarefa"
                  emptyLabel="Sem comentários nesta subtarefa."
                  testIdPrefix={`subtask-comment-${st.id}`}
                  onAdd={(text) => onAddComment?.(taskId, st.id, text)}
                  onEdit={(commentId, text) => onEditComment?.(taskId, st.id, commentId, text)}
                  onDelete={(commentId) => onDeleteComment?.(taskId, st.id, commentId)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form className="task-detail-checklist-form" onSubmit={handleAdd}>
          <input
            type="text"
            className="task-detail-checklist-input"
            placeholder="Adicionar item..."
            aria-label="Nova subtarefa"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
          />
          <button
            type="submit"
            className="task-detail-checklist-add"
            disabled={!newSubtaskTitle.trim()}
            aria-label="Adicionar subtarefa"
            title="Adicionar subtarefa"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
};

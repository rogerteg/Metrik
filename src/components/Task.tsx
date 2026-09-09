import React from 'react';
import { PriorityLevel, TaskModel } from '../types/kanban';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { PriorityBadge } from './PriorityBadge';
import { TagList } from './TagList';
import { ReorderOptions } from '../types/dnd';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
} from '../utils/timeFormatters';

export interface TaskProps {
  task: TaskModel;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDiscardIfEmpty: (id: string) => void;
  onUpdatePriority?: (id: string, priority?: PriorityLevel) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onDropTask?: (options: ReorderOptions) => void;
  isCompleted?: boolean;
  onClick?: () => void;
}

export const Task: React.FC<TaskProps> = ({
  task,
  onUpdateTitle,
  onDelete,
  onDiscardIfEmpty,
  onUpdatePriority,
  onAddTag,
  onRemoveTag,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  onDropTask,
  isCompleted = false,
  onClick,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [dropIndicator, setDropIndicator] = React.useState<'before' | 'after' | null>(null);

  const handleBlur = () => {
    setIsEditing(false);
    if (!task.title || task.title.trim() === '') {
      onDiscardIfEmpty(task.id);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const clientY = typeof e.clientY === 'number' ? e.clientY : midY - 1;
    const pos = clientY < midY ? 'before' : 'after';
    setDropIndicator(pos);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dropIndicator || 'before';
    setDropIndicator(null);

    const activeTaskId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (activeTaskId && onDropTask) {
      onDropTask({
        activeTaskId,
        targetColumn: task.column,
        targetTaskId: task.id,
        position,
      });
    }
  };

  const hasCompletedAt = isCompleted && !!task.completedAt;
  const leadTimeMs = hasCompletedAt ? calculateLeadTimeMs(task) : null;
  const cycleTimeMs = hasCompletedAt ? calculateCycleTimeMs(task) : null;
  const leadTimeStr = formatDuration(leadTimeMs);
  const cycleTimeStr = formatDuration(cycleTimeMs);

  const dropClass = dropIndicator === 'before'
    ? 'task-card-drop-before'
    : dropIndicator === 'after'
    ? 'task-card-drop-after'
    : '';

  const hasDescription = !!(task.description && task.description.trim().length > 0);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const hasSubtasks = subtasks.length > 0;

  return (
    <article
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${dropClass}`}
      id={`task-${task.id}`}
      aria-label={`Cartão de tarefa: ${task.title || 'Sem título'}`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        // Only trigger modal click if we're not dragging, not editing, and click didn't originate from a button/input
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, input, textarea');
        if (!isDragging && !isEditing && !isInteractive && onClick) {
          onClick();
        }
      }}
    >
      <div
        className="task-card-header"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <PriorityBadge
          priority={task.priority}
          onChange={(newPriority) => onUpdatePriority?.(task.id, newPriority)}
        />
      </div>

      <div
        className="task-card-content"
        onPointerDown={(e) => {
          // Isola seleção de texto do drag
          if (isEditing) {
            e.stopPropagation();
          }
        }}
      >
        <AutoResizeTextarea
          value={task.title}
          onChange={(val) => onUpdateTitle(task.id, val)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          placeholder="Nova tarefa..."
          aria-label="Título da tarefa"
        />

        <TagList
          tags={task.tags}
          onAddTag={(tag) => onAddTag?.(task.id, tag)}
          onRemoveTag={(tag) => onRemoveTag?.(task.id, tag)}
        />

        {(hasDescription || hasSubtasks) && (
          <div className="task-indicators" aria-label="Indicadores da tarefa">
            {hasDescription && (
              <span className="task-indicator-badge" title="Esta tarefa possui uma descrição">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
              </span>
            )}
            {hasSubtasks && (
              <span className="task-indicator-badge" title={`${completedSubtasks} de ${subtasks.length} subtarefas concluídas`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                {completedSubtasks}/{subtasks.length}
              </span>
            )}
          </div>
        )}

        {hasCompletedAt && (
          <div className="task-metrics-badges" aria-label="Métricas de fluxo do cartão">
            <span
              className="badge-metric-time badge-lead-time"
              title="Lead Time: Tempo total decorrido da criação até a conclusão"
            >
              Lead: {leadTimeStr}
            </span>
            <span
              className="badge-metric-time badge-cycle-time"
              title="Cycle Time: Tempo de processamento efetivo do início até a conclusão"
            >
              Cycle: {cycleTimeStr}
            </span>
          </div>
        )}
      </div>

      <footer
        className="task-card-footer"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="task-nav-buttons">
          {canMoveLeft && onMoveLeft && (
            <button
              type="button"
              className="btn-nav-step"
              onClick={() => onMoveLeft(task.id)}
              aria-label="Mover para coluna anterior"
              title="Mover para coluna anterior"
            >
              ←
            </button>
          )}
          {canMoveRight && onMoveRight && (
            <button
              type="button"
              className="btn-nav-step"
              onClick={() => onMoveRight(task.id)}
              aria-label="Mover para próxima coluna"
              title="Mover para próxima coluna"
            >
              →
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-delete-task"
          onClick={() => onDelete(task.id)}
          aria-label="Excluir tarefa"
          title="Excluir tarefa"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </footer>
    </article>
  );
};

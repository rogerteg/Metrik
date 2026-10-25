import React, { useState } from 'react';
import { STAGNANT_BROWN_COLOR } from '../../types/kanban';
import { TaskCardContainerProps } from './types';

export const TaskCardContainer: React.FC<TaskCardContainerProps> = ({
  task,
  columnColor,
  isBlocked,
  isStagnant,
  readOnly,
  isAnyEditing,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onDropTask,
  onClick,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<'before' | 'after' | null>(null);

  const effectiveCardColor = isStagnant ? STAGNANT_BROWN_COLOR : columnColor;

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (readOnly) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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

  const dropClass =
    dropIndicator === 'before'
      ? 'task-card-drop-before'
      : dropIndicator === 'after'
        ? 'task-card-drop-after'
        : '';

  return (
    <article
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${isBlocked ? 'task-card-blocked task-card-blocked-locked' : ''} ${isStagnant ? 'task-card-stagnant' : ''} ${dropClass}`}
      id={`task-${task.id}`}
      aria-label={`Cartão de tarefa: ${task.title || 'Sem título'}`}
      aria-disabled={isBlocked ? 'true' : undefined}
      style={
        effectiveCardColor && !isBlocked
          ? {
              borderLeft: `4px solid ${effectiveCardColor}`,
            }
          : undefined
      }
      draggable={!isAnyEditing && !readOnly}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        if (
          isAnyEditing ||
          (e.target as HTMLElement).closest('.btn-nav-step') ||
          (e.target as HTMLElement).closest('.btn-delete-task') ||
          (e.target as HTMLElement).closest('.priority-badge-container') ||
          (e.target as HTMLElement).closest('.tag-item-remove') ||
          (e.target as HTMLElement).closest('.task-qa-toggle-bar') ||
          (e.target as HTMLElement).closest('.task-field-box') ||
          (e.target as HTMLElement).closest('.task-blocked-badge')
        ) {
          return;
        }
        if (onClick) {
          onClick();
        }
      }}
    >
      {children}

      <footer className="task-card-footer" onPointerDown={(e) => e.stopPropagation()}>
        <div className="task-nav-buttons">
          {!readOnly && canMoveLeft && onMoveLeft && (
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
          {!readOnly && canMoveRight && onMoveRight && (
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

        {!readOnly && (
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
        )}
      </footer>
    </article>
  );
};

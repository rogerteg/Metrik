import React, { useState, useRef } from 'react';
import { ColumnType } from '../types/kanban';
import { WipLimitBadge } from './WipLimitBadge';
import { ReorderOptions } from '../types/dnd';

export interface ColumnProps {
  type: ColumnType;
  title: string;
  count: number;
  onAddTask?: (column: ColumnType) => void;
  wipLimit?: number | null;
  onUpdateWipLimit?: (column: ColumnType, limit: number | null) => void;
  onDropTask?: (options: ReorderOptions) => void;
  children?: React.ReactNode;
}

const getBadgeClass = (type: ColumnType): string => {
  switch (type) {
    case ColumnType.TO_DO:
      return 'badge-todo';
    case ColumnType.IN_PROGRESS:
      return 'badge-progress';
    case ColumnType.BLOCKED:
      return 'badge-blocked';
    case ColumnType.COMPLETED:
      return 'badge-completed';
    default:
      return 'badge-todo';
  }
};

const getColumnModifierClass = (type: ColumnType): string => {
  switch (type) {
    case ColumnType.TO_DO:
      return 'kanban-column-todo';
    case ColumnType.IN_PROGRESS:
      return 'kanban-column-progress';
    case ColumnType.BLOCKED:
      return 'kanban-column-blocked';
    case ColumnType.COMPLETED:
      return 'kanban-column-completed';
    default:
      return '';
  }
};

export const Column: React.FC<ColumnProps> = ({
  type,
  title,
  count,
  onAddTask,
  wipLimit = null,
  onUpdateWipLimit,
  onDropTask,
  children,
}) => {
  const badgeClass = getBadgeClass(type);
  const modifierClass = getColumnModifierClass(type);
  const isOverloaded = wipLimit !== null && count > wipLimit;

  const [isDropTarget, setIsDropTarget] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    if (dragDepthRef.current === 1) {
      setIsDropTarget(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDropTarget(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDropTarget(false);

    const activeTaskId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (activeTaskId && onDropTask) {
      onDropTask({
        activeTaskId,
        targetColumn: type,
      });
    }
  };

  return (
    <section
      className={`kanban-column ${modifierClass} ${isOverloaded ? 'kanban-column-wip-exceeded' : ''} ${isDropTarget ? 'kanban-column-drop-target' : ''}`}
      aria-label={`Coluna ${title}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="column-header">
        <div className="column-header-left">
          <span className={`column-badge ${badgeClass}`}>{title}</span>
          {onUpdateWipLimit ? (
            <WipLimitBadge
              column={type}
              currentCount={count}
              limit={wipLimit}
              onUpdateLimit={onUpdateWipLimit}
            />
          ) : (
            <span className="column-count" aria-label={`${count} tarefas`}>
              {count}
            </span>
          )}
        </div>
        {onAddTask && (
          <button
            type="button"
            className="btn-add-task"
            onClick={() => onAddTask(type)}
            aria-label={`Adicionar tarefa em ${title}`}
            title={`Adicionar tarefa em ${title}`}
          >
            +
          </button>
        )}
      </header>

      <div className="tasks-list">
        {count === 0 ? (
          <div className="empty-column-drop-zone" aria-label="Coluna vazia. Arraste um cartão aqui.">
            Arraste um cartão aqui
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

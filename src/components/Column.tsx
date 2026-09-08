import React from 'react';
import { ColumnType } from '../types/kanban';

export interface ColumnProps {
  type: ColumnType;
  title: string;
  count: number;
  onAddTask?: (column: ColumnType) => void;
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
  children,
}) => {
  const badgeClass = getBadgeClass(type);
  const modifierClass = getColumnModifierClass(type);

  return (
    <section className={`kanban-column ${modifierClass}`} aria-label={`Coluna ${title}`}>
      <header className="column-header">
        <div className="column-header-left">
          <span className={`column-badge ${badgeClass}`}>{title}</span>
          <span className="column-count" aria-label={`${count} tarefas`}>{count}</span>
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
        {children}
      </div>
    </section>
  );
};

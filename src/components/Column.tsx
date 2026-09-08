import React from 'react';
import { ColumnType } from '../types/kanban';
import { WipLimitBadge } from './WipLimitBadge';

export interface ColumnProps {
  type: ColumnType;
  title: string;
  count: number;
  onAddTask?: (column: ColumnType) => void;
  wipLimit?: number | null;
  onUpdateWipLimit?: (column: ColumnType, limit: number | null) => void;
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
  children,
}) => {
  const badgeClass = getBadgeClass(type);
  const modifierClass = getColumnModifierClass(type);
  const isOverloaded = wipLimit !== null && count > wipLimit;

  return (
    <section
      className={`kanban-column ${modifierClass} ${isOverloaded ? 'kanban-column-wip-exceeded' : ''}`}
      aria-label={`Coluna ${title}`}
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

      <div className="tasks-list">{children}</div>
    </section>
  );
};

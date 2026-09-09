import React from 'react';
import { BoardState, ColumnType, TaskModel, WipLimitsState } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { Column } from './Column';

export interface BoardProps {
  board: BoardState;
  rawBoard?: BoardState;
  hasActiveFilters?: boolean;
  onAddTask: (column: ColumnType) => void;
  wipLimits?: WipLimitsState;
  onUpdateWipLimit?: (column: ColumnType, limit: number | null) => void;
  onDropTask?: (options: ReorderOptions) => void;
  renderTask?: (task: TaskModel, column: ColumnType) => React.ReactNode;
}

const COLUMNS_CONFIG: { type: ColumnType; title: string }[] = [
  { type: ColumnType.TO_DO, title: 'Todo' },
  { type: ColumnType.IN_PROGRESS, title: 'In Progress' },
  { type: ColumnType.BLOCKED, title: 'Blocked' },
  { type: ColumnType.COMPLETED, title: 'Completed' },
];

export const Board: React.FC<BoardProps> = ({
  board,
  rawBoard,
  hasActiveFilters = false,
  onAddTask,
  wipLimits,
  onUpdateWipLimit,
  onDropTask,
  renderTask,
}) => {
  return (
    <main className="kanban-board-grid" aria-label="Quadro Kanban Metrik">
      {COLUMNS_CONFIG.map(({ type, title }) => {
        const visibleTasks = board[type] || [];
        const rawTasks = rawBoard ? rawBoard[type] || [] : visibleTasks;
        const limit = wipLimits ? wipLimits[type] : null;
        const isFilteredEmpty = hasActiveFilters && rawTasks.length > 0 && visibleTasks.length === 0;

        return (
          <Column
            key={type}
            type={type}
            title={title}
            count={rawTasks.length}
            onAddTask={onAddTask}
            wipLimit={limit}
            onUpdateWipLimit={onUpdateWipLimit}
            onDropTask={onDropTask}
          >
            {isFilteredEmpty ? (
              <div
                className="empty-column-filter"
                aria-label="Nenhuma tarefa corresponde aos filtros aplicados"
              >
                Nenhuma tarefa corresponde aos filtros aplicados
              </div>
            ) : renderTask ? (
              visibleTasks.map((task) => renderTask(task, type))
            ) : null}
          </Column>
        );
      })}
    </main>
  );
};

import React from 'react';
import { BoardState, ColumnType, TaskModel, WipLimitsState } from '../types/kanban';
import { Column } from './Column';

export interface BoardProps {
  board: BoardState;
  onAddTask: (column: ColumnType) => void;
  wipLimits?: WipLimitsState;
  onUpdateWipLimit?: (column: ColumnType, limit: number | null) => void;
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
  onAddTask,
  wipLimits,
  onUpdateWipLimit,
  renderTask,
}) => {
  return (
    <main className="kanban-board-grid" aria-label="Quadro Kanban Metrik">
      {COLUMNS_CONFIG.map(({ type, title }) => {
        const tasks = board[type] || [];
        const limit = wipLimits ? wipLimits[type] : null;

        return (
          <Column
            key={type}
            type={type}
            title={title}
            count={tasks.length}
            onAddTask={onAddTask}
            wipLimit={limit}
            onUpdateWipLimit={onUpdateWipLimit}
          >
            {renderTask ? tasks.map((task) => renderTask(task, type)) : null}
          </Column>
        );
      })}
    </main>
  );
};

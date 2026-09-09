import React from 'react';
import { BoardState, ColumnModel, TaskModel } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { Column } from './Column';

export interface BoardProps {
  board: BoardState;
  rawBoard?: BoardState;
  hasActiveFilters?: boolean;
  onAddTask: (columnId: string) => void;
  onUpdateColumn?: (id: string, updates: Partial<ColumnModel>) => void;
  onDeleteColumn?: (id: string) => void;
  onDropTask?: (options: ReorderOptions) => void;
  renderTask?: (task: TaskModel, columnId: string) => React.ReactNode;
}

export const Board: React.FC<BoardProps> = ({
  board,
  rawBoard,
  hasActiveFilters = false,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onDropTask,
  renderTask,
}) => {
  const columns = board.columns || [];

  return (
    <main className="kanban-board-grid" aria-label="Quadro Kanban Metrik">
      {columns.map((col) => {
        const visibleTasks = board.tasks[col.id] || [];
        const rawTasks = rawBoard ? rawBoard.tasks[col.id] || [] : visibleTasks;
        const isFilteredEmpty = hasActiveFilters && rawTasks.length > 0 && visibleTasks.length === 0;

        return (
          <Column
            key={col.id}
            column={col}
            count={rawTasks.length}
            onAddTask={() => onAddTask(col.id)}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
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
              visibleTasks.map((task) => renderTask(task, col.id))
            ) : null}
          </Column>
        );
      })}
    </main>
  );
};

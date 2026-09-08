import { useCallback, useMemo } from 'react';
import { ColumnType, TaskModel } from '../types/kanban';

export const COLUMN_ORDER: ColumnType[] = [
  ColumnType.TO_DO,
  ColumnType.IN_PROGRESS,
  ColumnType.BLOCKED,
  ColumnType.COMPLETED,
];

export interface UseColumnTasksProps {
  column: ColumnType;
  tasks: TaskModel[];
  onAddTask: (column: ColumnType, title?: string) => TaskModel;
  onUpdateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column'>>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, targetColumn: ColumnType) => void;
  onDiscardIfEmpty: (id: string) => void;
}

export function useColumnTasks({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onDiscardIfEmpty,
}: UseColumnTasksProps) {
  const currentIndex = useMemo(() => COLUMN_ORDER.indexOf(column), [column]);

  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < COLUMN_ORDER.length - 1;

  const prevColumn = canMoveLeft ? COLUMN_ORDER[currentIndex - 1] : null;
  const nextColumn = canMoveRight ? COLUMN_ORDER[currentIndex + 1] : null;

  const addNewTask = useCallback(
    (title = '') => {
      return onAddTask(column, title);
    },
    [column, onAddTask]
  );

  const updateTaskTitle = useCallback(
    (id: string, title: string) => {
      onUpdateTask(id, { title });
    },
    [onUpdateTask]
  );

  const moveLeft = useCallback(
    (id: string) => {
      if (prevColumn) {
        onMoveTask(id, prevColumn);
      }
    },
    [prevColumn, onMoveTask]
  );

  const moveRight = useCallback(
    (id: string) => {
      if (nextColumn) {
        onMoveTask(id, nextColumn);
      }
    },
    [nextColumn, onMoveTask]
  );

  return {
    tasks,
    canMoveLeft,
    canMoveRight,
    addNewTask,
    updateTaskTitle,
    removeTask: onDeleteTask,
    moveLeft,
    moveRight,
    discardIfEmpty: onDiscardIfEmpty,
  };
}

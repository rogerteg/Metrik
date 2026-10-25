import { useState, useCallback } from 'react';
import { TaskModel, ColumnModel, BLOCKED_TASK_MOVE_WARNING_MESSAGE } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { CrossSquadTaskSummary } from '../types/taskTypes';
import { isTaskBlocked } from '../utils/taskReorder';
import { getPendingBlockers } from '../utils/taskRelations';

export interface UseGuardedTaskMoveProps {
  allBoardTasks: TaskModel[];
  columns: ColumnModel[];
  moveTask: (taskId: string, targetColumnId: string) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  onToast: (message: string) => void;
}

export interface SoftBlockState {
  task: TaskModel;
  blockingTasks: CrossSquadTaskSummary[];
  onConfirm: () => void;
}

export function useGuardedTaskMove({
  allBoardTasks,
  columns,
  moveTask,
  reorderOrMoveTask,
  onToast,
}: UseGuardedTaskMoveProps) {
  const [softBlockState, setSoftBlockState] = useState<SoftBlockState | null>(null);

  const handleGuardedMoveTask = useCallback(
    (taskId: string, targetColumnId: string) => {
      const task = allBoardTasks.find((t) => t.id === taskId);
      const targetCol = columns.find((c) => c.id === targetColumnId);

      if (task && isTaskBlocked(task) && task.column !== targetColumnId) {
        onToast(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
        return;
      }

      if (targetCol?.category === 'done' && task) {
        const pending = getPendingBlockers(task, allBoardTasks, columns);
        if (pending.length > 0) {
          setSoftBlockState({
            task,
            blockingTasks: pending,
            onConfirm: () => {
              moveTask(taskId, targetColumnId);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      moveTask(taskId, targetColumnId);
    },
    [allBoardTasks, columns, moveTask, onToast],
  );

  const handleGuardedDropTask = useCallback(
    (options: ReorderOptions) => {
      const task = allBoardTasks.find((t) => t.id === options.activeTaskId);
      const targetCol = columns.find((c) => c.id === options.targetColumn);

      if (task && isTaskBlocked(task) && task.column !== options.targetColumn) {
        onToast(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
        return;
      }

      if (targetCol?.category === 'done' && task) {
        const pending = getPendingBlockers(task, allBoardTasks, columns);
        if (pending.length > 0) {
          setSoftBlockState({
            task,
            blockingTasks: pending,
            onConfirm: () => {
              reorderOrMoveTask(options);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      reorderOrMoveTask(options);
    },
    [allBoardTasks, columns, reorderOrMoveTask, onToast],
  );

  const cancelSoftBlock = useCallback(() => {
    setSoftBlockState(null);
  }, []);

  return {
    softBlockState,
    cancelSoftBlock,
    handleGuardedMoveTask,
    handleGuardedDropTask,
  };
}

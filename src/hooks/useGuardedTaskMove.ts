import { useState, useCallback } from 'react';
import { TaskModel, ColumnModel, BLOCKED_TASK_MOVE_WARNING_MESSAGE } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { CrossSquadTaskSummary } from '../types/taskTypes';
import { isTaskBlocked } from '../utils/taskReorder';
import { getPendingBlockers } from '../utils/taskRelations';
import { FlowRule } from '../types/flowRules';
import { evaluateRulesForEvent } from '../utils/flowRulesEngine';

export interface UseGuardedTaskMoveProps {
  allBoardTasks: TaskModel[];
  columns: ColumnModel[];
  moveTask: (taskId: string, targetColumnId: string) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  onToast: (message: string) => void;
  flowRules?: FlowRule[];
  boardId?: string;
  updateTask?: (id: string, updates: Partial<TaskModel>) => void;
  recordRuleExecution?: (ruleId: string) => void;
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
  flowRules,
  boardId,
  updateTask,
  recordRuleExecution,
}: UseGuardedTaskMoveProps) {
  const [softBlockState, setSoftBlockState] = useState<SoftBlockState | null>(null);

  const applyAutomationsForMove = useCallback(
    (task: TaskModel, targetColumnId: string) => {
      if (!flowRules || flowRules.length === 0 || !updateTask) return;
      const targetCol = columns.find((c) => c.id === targetColumnId);
      const updatedTask = { ...task, column: targetColumnId };
      const results = evaluateRulesForEvent(
        flowRules,
        {
          boardId: boardId || '',
          event: 'card_moved',
          fromColumnId: task.column,
          toColumnId: targetColumnId,
          toCategory: targetCol?.category,
        },
        updatedTask,
        columns,
      );

      for (const res of results) {
        updateTask(task.id, res.taskUpdates);
        recordRuleExecution?.(res.ruleId);
        for (const msg of res.toastMessages) {
          onToast(msg);
        }
      }
    },
    [flowRules, updateTask, columns, boardId, recordRuleExecution, onToast],
  );

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
              applyAutomationsForMove(task, targetColumnId);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      moveTask(taskId, targetColumnId);
      if (task) {
        applyAutomationsForMove(task, targetColumnId);
      }
    },
    [allBoardTasks, columns, moveTask, onToast, applyAutomationsForMove],
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
              applyAutomationsForMove(task, options.targetColumn);
              setSoftBlockState(null);
            },
          });
          return;
        }
      }

      reorderOrMoveTask(options);
      if (task) {
        applyAutomationsForMove(task, options.targetColumn);
      }
    },
    [allBoardTasks, columns, reorderOrMoveTask, onToast, applyAutomationsForMove],
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

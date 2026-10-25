import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BoardState,
  ColumnCategory,
  ColumnModel,
  TaskModel,
  MAX_COLUMNS,
  FLOW_REGRESSION_WARNING_MESSAGE,
  BLOCKED_TASK_MOVE_WARNING_MESSAGE,
} from '../../types/kanban';
import { createTaskActivityEvent, AuditDescriptions } from '../../utils/taskActivityLogger';
import {
  reorderBoard,
  isBackwardColumnMove,
  reorderColumnList,
  isTaskBlocked,
} from '../../utils/taskReorder';
import { ReorderOptions } from '../../types/dnd';

export function useTaskReorderManager(
  setBoard: React.Dispatch<React.SetStateAction<BoardState>>,
  notify: (message: string) => void,
) {
  const addColumn = useCallback(
    (title: string, category: ColumnCategory, wipLimit: number | null = null, color?: string) => {
      setBoard((prev) => {
        if (prev.columns.length >= MAX_COLUMNS) {
          console.warn(`[Metrik] Limite máximo de ${MAX_COLUMNS} colunas atingido.`);
          return prev;
        }

        const newColId = uuidv4();

        let colorScheme: 'todo' | 'progress' | 'blocked' | 'completed' = 'todo';
        if (category === 'in_progress') colorScheme = 'progress';
        if (category === 'done') colorScheme = 'completed';

        const resolvedColor =
          color || (category === 'todo' ? '#6366f1' : category === 'done' ? '#10b981' : '#38bdf8');

        const newColumn: ColumnModel = {
          id: newColId,
          title,
          category,
          wipLimit,
          colorScheme,
          color: resolvedColor,
        };

        return {
          columns: [...prev.columns, newColumn],
          tasks: {
            ...prev.tasks,
            [newColId]: [],
          },
        };
      });
    },
    [setBoard],
  );

  const updateColumn = useCallback(
    (id: string, updates: Partial<ColumnModel>) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => (col.id === id ? { ...col, ...updates } : col)),
      }));
    },
    [setBoard],
  );

  const deleteColumn = useCallback(
    (id: string) => {
      setBoard((prev) => {
        if (prev.tasks[id] && prev.tasks[id].length > 0) {
          console.warn('Cannot delete a column that contains tasks.');
          return prev;
        }

        const nextTasks = { ...prev.tasks };
        delete nextTasks[id];

        return {
          columns: prev.columns.filter((col) => col.id !== id),
          tasks: nextTasks,
        };
      });
    },
    [setBoard],
  );

  const reorderColumn = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      setBoard((prev) => {
        const newColumns = reorderColumnList(prev.columns, sourceIndex, destinationIndex);
        if (newColumns === prev.columns) {
          return prev;
        }
        return {
          ...prev,
          columns: newColumns,
        };
      });
    },
    [setBoard],
  );

  const moveTask = useCallback(
    (id: string, targetColumnId: string) => {
      setBoard((prev) => {
        let targetTask: TaskModel | undefined;
        let sourceColumnId: string | undefined;
        const nextTasks: Record<string, TaskModel[]> = {};

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].filter((task) => {
            if (task.id === id) {
              targetTask = task;
              sourceColumnId = colId;
              return false;
            }
            return true;
          });
        }

        if (targetTask && sourceColumnId) {
          if (isTaskBlocked(targetTask) && sourceColumnId !== targetColumnId) {
            notify(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
            return prev;
          }

          const isBackward = isBackwardColumnMove(prev.columns, sourceColumnId, targetColumnId);
          if (isBackward) {
            if (typeof window !== 'undefined') {
              if (typeof window.alert === 'function') {
                try {
                  window.alert(FLOW_REGRESSION_WARNING_MESSAGE);
                } catch {
                  // Ignore alert errors
                }
              } else if (typeof window.confirm === 'function') {
                try {
                  window.confirm(FLOW_REGRESSION_WARNING_MESSAGE);
                } catch {
                  // Ignore confirm errors
                }
              }
            }
            return prev;
          }

          const targetCol = prev.columns.find((c) => c.id === targetColumnId);
          const now = new Date().toISOString();
          let startedAt = targetTask.startedAt;
          let completedAt = targetTask.completedAt;
          let totalBlockedMs = targetTask.totalBlockedMs;
          let blocked = targetTask.blocked;
          let blockedAt = targetTask.blockedAt;
          let blockedReason = targetTask.blockedReason;

          if (isBackward) {
            completedAt = undefined;
            totalBlockedMs = undefined;
            blocked = false;
            blockedAt = undefined;
            blockedReason = undefined;
            if (targetCol && targetCol.category === 'in_progress') {
              startedAt = targetTask.startedAt || now;
            } else {
              startedAt = undefined;
            }
          } else if (targetCol) {
            if (
              (targetCol.category === 'in_progress' || targetCol.category === 'done') &&
              !startedAt
            ) {
              startedAt = now;
            }

            if (targetCol.category === 'done') {
              completedAt = now;
              if (!startedAt) {
                startedAt = targetTask.createdAt || now;
              }
            } else {
              completedAt = undefined;
            }
          }

          const sourceCol = prev.columns.find((c) => c.id === sourceColumnId);
          const fromColName = sourceCol?.title || sourceColumnId;
          const toColName = targetCol?.title || targetColumnId;

          const auditEvent = createTaskActivityEvent({
            taskId: id,
            eventType: 'moved',
            description: AuditDescriptions.moved(fromColName, toColName, 'Rogerio Teixeira'),
            fromValue: fromColName,
            toValue: toColName,
            user: { id: 'usr_default', name: 'Rogerio Teixeira' },
          });

          const updatedTask: TaskModel = {
            ...targetTask,
            column: targetColumnId,
            startedAt,
            completedAt,
            totalBlockedMs,
            blocked,
            blockedAt,
            blockedReason,
            lastMovedAt: now,
            updatedAt: now,
            activityLog: [...(targetTask.activityLog || []), auditEvent],
          };

          if (!nextTasks[targetColumnId]) nextTasks[targetColumnId] = [];
          nextTasks[targetColumnId] = [updatedTask, ...nextTasks[targetColumnId]];
        }

        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard, notify],
  );

  const reorderOrMoveTask = useCallback(
    (options: ReorderOptions) => {
      setBoard((prev) => {
        let sourceColumnId: string | undefined;
        let activeTask: TaskModel | undefined;
        for (const colId of Object.keys(prev.tasks)) {
          const found = prev.tasks[colId].find((t) => t.id === options.activeTaskId);
          if (found) {
            sourceColumnId = colId;
            activeTask = found;
            break;
          }
        }

        if (
          activeTask &&
          sourceColumnId &&
          isTaskBlocked(activeTask) &&
          sourceColumnId !== options.targetColumn
        ) {
          notify(BLOCKED_TASK_MOVE_WARNING_MESSAGE);
          return prev;
        }

        if (
          sourceColumnId &&
          isBackwardColumnMove(prev.columns, sourceColumnId, options.targetColumn)
        ) {
          if (typeof window !== 'undefined') {
            if (typeof window.alert === 'function') {
              try {
                window.alert(FLOW_REGRESSION_WARNING_MESSAGE);
              } catch {
                // Ignore alert errors
              }
            } else if (typeof window.confirm === 'function') {
              try {
                window.confirm(FLOW_REGRESSION_WARNING_MESSAGE);
              } catch {
                // Ignore confirm errors
              }
            }
          }
          return prev;
        }

        return reorderBoard(prev, options);
      });
    },
    [setBoard, notify],
  );

  return {
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
    moveTask,
    reorderOrMoveTask,
  };
}

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, TaskModel } from '../../types/kanban';
import { createTaskActivityEvent, AuditDescriptions } from '../../utils/taskActivityLogger';
import { INITIAL_SEED_TASKS } from '../../utils/seedData';

export function useTaskMutations(setBoard: React.Dispatch<React.SetStateAction<BoardState>>) {
  const addTask = useCallback(
    (columnId: string, title: string = '') => {
      const newTask: TaskModel = {
        id: uuidv4(),
        title,
        column: columnId,
        createdAt: new Date().toISOString(),
      };

      setBoard((prev) => {
        const targetCol = prev.columns.find((c) => c.id === columnId);
        if (targetCol) {
          if (targetCol.category === 'in_progress') {
            newTask.startedAt = new Date().toISOString();
          } else if (targetCol.category === 'done') {
            newTask.startedAt = new Date().toISOString();
            newTask.completedAt = new Date().toISOString();
          }
        }

        return {
          ...prev,
          tasks: {
            ...prev.tasks,
            [columnId]: [newTask, ...(prev.tasks[columnId] || [])],
          },
        };
      });

      return newTask;
    },
    [setBoard],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<TaskModel>) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id !== id) return task;

            let activityLog = task.activityLog;
            const assigneeChanged =
              'assignee' in updates && (updates.assignee ?? '') !== (task.assignee ?? '');

            if (assigneeChanged) {
              const nextAssignee = updates.assignee;
              const auditEvent = createTaskActivityEvent({
                taskId: task.id,
                eventType: nextAssignee ? 'assignment' : 'unassignment',
                description: nextAssignee
                  ? AuditDescriptions.assigned(nextAssignee, 'Rogerio Teixeira')
                  : AuditDescriptions.unassigned(task.assignee, 'Rogerio Teixeira'),
                fromValue: task.assignee,
                toValue: nextAssignee,
                user: { id: 'usr_default', name: 'Rogerio Teixeira' },
              });
              activityLog = [...(task.activityLog || []), auditEvent];
            }

            return {
              ...task,
              ...updates,
              activityLog,
              updatedAt: now,
            };
          });
        }

        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId]
            .filter((task) => task.id !== id)
            .map((task) => {
              if (!task.links || task.links.length === 0) return task;
              const remainingLinks = task.links.filter((l) => l.targetTaskId !== id);
              if (remainingLinks.length === task.links.length) return task;
              return { ...task, links: remainingLinks };
            });
        }

        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const discardIfEmpty = useCallback(
    (id: string) => {
      setBoard((prev) => {
        let shouldDelete = false;
        for (const colId of Object.keys(prev.tasks)) {
          const task = prev.tasks[colId].find((t) => t.id === id);
          if (task && task.title.trim() === '') {
            shouldDelete = true;
            break;
          }
        }

        if (!shouldDelete) return prev;

        const nextTasks: Record<string, TaskModel[]> = {};
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].filter((task) => task.id !== id);
        }

        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const clearTasks = useCallback(() => {
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      for (const col of prev.columns) {
        nextTasks[col.id] = [];
      }
      return {
        ...prev,
        tasks: nextTasks,
      };
    });
  }, [setBoard]);

  const resetToSeed = useCallback(() => {
    setBoard(INITIAL_SEED_TASKS);
  }, [setBoard]);

  const overwriteBoard = useCallback(
    (newState: BoardState) => {
      setBoard(newState);
    },
    [setBoard],
  );

  return {
    addTask,
    updateTask,
    deleteTask,
    discardIfEmpty,
    clearTasks,
    resetToSeed,
    overwriteBoard,
  };
}

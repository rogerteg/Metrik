import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, ColumnType, PriorityLevel, TaskModel } from '../types/kanban';
import { INITIAL_SEED_TASKS, isValidBoardState } from '../utils/seedData';
import { reorderBoard } from '../utils/taskReorder';
import { ReorderOptions } from '../types/dnd';

export const STORAGE_KEY = 'metrik_kanban_tasks';

export interface UseTaskCollectionReturn {
  board: BoardState;
  addTask: (column: ColumnType, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumn: ColumnType) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  setTaskPriority: (taskId: string, priority?: PriorityLevel) => void;
  addTaskTag: (taskId: string, tag: string) => void;
  removeTaskTag: (taskId: string, tag: string) => void;
  discardIfEmpty: (id: string) => void;
  clearTasks: () => void;
  resetToSeed: () => void;
}

const getInitialState = (): BoardState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_SEED_TASKS;
  }

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TASKS));
      return INITIAL_SEED_TASKS;
    }

    const parsed = JSON.parse(rawData);
    if (isValidBoardState(parsed)) {
      return parsed;
    }

    console.warn('[Metrik Storage] Invalid board state in localStorage. Falling back to seed data.');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TASKS));
    return INITIAL_SEED_TASKS;
  } catch (error) {
    console.error('[Metrik Storage] Failed to load board from localStorage:', error);
    return INITIAL_SEED_TASKS;
  }
};

export function useTaskCollection(): UseTaskCollectionReturn {
  const [board, setBoard] = useState<BoardState>(getInitialState);

  // Sync with localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch (error) {
      console.error('Failed to save board state to localStorage', error);
    }
  }, [board]);

  const addTask = useCallback((column: ColumnType, title: string = '') => {
    const newTask: TaskModel = {
      id: uuidv4(),
      title,
      column,
      createdAt: new Date().toISOString(),
      ...(column === ColumnType.IN_PROGRESS ? { startedAt: new Date().toISOString() } : {}),
      ...(column === ColumnType.COMPLETED ? { startedAt: new Date().toISOString(), completedAt: new Date().toISOString() } : {}),
    };

    setBoard((prev) => ({
      ...prev,
      [column]: [newTask, ...prev[column]],
    }));

    return newTask;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags'>>) => {
      setBoard((prev) => {
        const nextBoard: BoardState = {
          [ColumnType.TO_DO]: [],
          [ColumnType.IN_PROGRESS]: [],
          [ColumnType.BLOCKED]: [],
          [ColumnType.COMPLETED]: [],
        };

        const now = new Date().toISOString();

        for (const col of Object.values(ColumnType)) {
          nextBoard[col] = prev[col].map((task) => {
            if (task.id === id) {
              return {
                ...task,
                ...updates,
                updatedAt: now,
              };
            }
            return task;
          });
        }

        return nextBoard;
      });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setBoard((prev) => {
      const nextBoard: BoardState = {
        [ColumnType.TO_DO]: [],
        [ColumnType.IN_PROGRESS]: [],
        [ColumnType.BLOCKED]: [],
        [ColumnType.COMPLETED]: [],
      };

      for (const col of Object.values(ColumnType)) {
        nextBoard[col] = prev[col].filter((task) => task.id !== id);
      }

      return nextBoard;
    });
  }, []);

  const moveTask = useCallback((id: string, targetColumn: ColumnType) => {
    setBoard((prev) => {
      let targetTask: TaskModel | undefined;

      const nextBoard: BoardState = {
        [ColumnType.TO_DO]: [],
        [ColumnType.IN_PROGRESS]: [],
        [ColumnType.BLOCKED]: [],
        [ColumnType.COMPLETED]: [],
      };

      for (const col of Object.values(ColumnType)) {
        nextBoard[col] = prev[col].filter((task) => {
          if (task.id === id) {
            targetTask = task;
            return false;
          }
          return true;
        });
      }

      if (targetTask) {
        const now = new Date().toISOString();
        let startedAt = targetTask.startedAt;
        let completedAt = targetTask.completedAt;

        if (targetColumn === ColumnType.IN_PROGRESS && !startedAt) {
          startedAt = now;
        }

        // Se moveu para Completed
        if (targetColumn === ColumnType.COMPLETED) {
          completedAt = now;
          if (!startedAt) {
            startedAt = targetTask.createdAt || now;
          }
        } else {
          // Se saiu de Completed para qualquer outra coluna, limpa completedAt
          completedAt = undefined;
        }

        const updatedTask: TaskModel = {
          ...targetTask,
          column: targetColumn,
          startedAt,
          completedAt,
          updatedAt: now,
        };

        nextBoard[targetColumn] = [updatedTask, ...nextBoard[targetColumn]];
      }

      return nextBoard;
    });
  }, []);

  const reorderOrMoveTask = useCallback((options: ReorderOptions) => {
    setBoard((prev) => reorderBoard(prev, options));
  }, []);

  const setTaskPriority = useCallback((taskId: string, priority?: PriorityLevel) => {
    setBoard((prev) => {
      const nextBoard: BoardState = {
        [ColumnType.TO_DO]: [],
        [ColumnType.IN_PROGRESS]: [],
        [ColumnType.BLOCKED]: [],
        [ColumnType.COMPLETED]: [],
      };
      const now = new Date().toISOString();

      for (const col of Object.values(ColumnType)) {
        nextBoard[col] = prev[col].map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              priority,
              updatedAt: now,
            };
          }
          return task;
        });
      }
      return nextBoard;
    });
  }, []);

  const addTaskTag = useCallback((taskId: string, tag: string) => {
    const cleanTag = tag.trim().slice(0, 20);
    if (!cleanTag) return;

    setBoard((prev) => {
      const nextBoard: BoardState = {
        [ColumnType.TO_DO]: [],
        [ColumnType.IN_PROGRESS]: [],
        [ColumnType.BLOCKED]: [],
        [ColumnType.COMPLETED]: [],
      };
      const now = new Date().toISOString();

      for (const col of Object.values(ColumnType)) {
        nextBoard[col] = prev[col].map((task) => {
          if (task.id === taskId) {
            const currentTags = task.tags ?? [];
            const isDuplicate = currentTags.some(
              (t) => t.toLowerCase() === cleanTag.toLowerCase()
            );
            if (isDuplicate) return task;

            return {
              ...task,
              tags: [...currentTags, cleanTag],
              updatedAt: now,
            };
          }
          return task;
        });
      }
      return nextBoard;
    });
  }, []);

  const removeTaskTag = useCallback((taskId: string, tag: string) => {
    const targetTag = tag.trim().toLowerCase();
    setBoard((prev) => {
      const nextBoard: BoardState = {
        [ColumnType.TO_DO]: [],
        [ColumnType.IN_PROGRESS]: [],
        [ColumnType.BLOCKED]: [],
        [ColumnType.COMPLETED]: [],
      };
      const now = new Date().toISOString();

      for (const col of Object.values(ColumnType)) {
        nextBoard[col] = prev[col].map((task) => {
          if (task.id === taskId) {
            const currentTags = task.tags ?? [];
            const nextTags = currentTags.filter(
              (t) => t.trim().toLowerCase() !== targetTag
            );
            return {
              ...task,
              tags: nextTags,
              updatedAt: now,
            };
          }
          return task;
        });
      }
      return nextBoard;
    });
  }, []);

  const discardIfEmpty = useCallback(
    (id: string) => {
      setBoard((prev) => {
        let shouldDelete = false;
        for (const col of Object.values(ColumnType)) {
          const task = prev[col].find((t) => t.id === id);
          if (task && task.title.trim() === '') {
            shouldDelete = true;
            break;
          }
        }

        if (!shouldDelete) return prev;

        const nextBoard: BoardState = {
          [ColumnType.TO_DO]: [],
          [ColumnType.IN_PROGRESS]: [],
          [ColumnType.BLOCKED]: [],
          [ColumnType.COMPLETED]: [],
        };

        for (const col of Object.values(ColumnType)) {
          nextBoard[col] = prev[col].filter((task) => task.id !== id);
        }

        return nextBoard;
      });
    },
    []
  );

  const clearTasks = useCallback(() => {
    const emptyBoard: BoardState = {
      [ColumnType.TO_DO]: [],
      [ColumnType.IN_PROGRESS]: [],
      [ColumnType.BLOCKED]: [],
      [ColumnType.COMPLETED]: [],
    };
    setBoard(emptyBoard);
  }, []);

  const resetToSeed = useCallback(() => {
    setBoard(INITIAL_SEED_TASKS);
  }, []);

  return {
    board,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderOrMoveTask,
    setTaskPriority,
    addTaskTag,
    removeTaskTag,
    discardIfEmpty,
    clearTasks,
    resetToSeed,
  };
}

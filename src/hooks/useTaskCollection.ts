import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, ColumnType, TaskModel } from '../types/kanban';
import { INITIAL_SEED_TASKS, isValidBoardState } from '../utils/seedData';

export const STORAGE_KEY = 'metrik_kanban_tasks';

export interface UseTaskCollectionReturn {
  board: BoardState;
  addTask: (column: ColumnType, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumn: ColumnType) => void;
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

  // Sync with localStorage on changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch (error) {
      console.error('[Metrik Storage] Failed to persist board to localStorage:', error);
    }
  }, [board]);

  const addTask = useCallback((column: ColumnType, title = ''): TaskModel => {
    const newTask: TaskModel = {
      id: uuidv4(),
      title,
      column,
      createdAt: new Date().toISOString(),
    };

    setBoard((prev) => ({
      ...prev,
      [column]: [...prev[column], newTask],
    }));

    return newTask;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column'>>) => {
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

      // Find the task and remove from previous column
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
        const updatedTask: TaskModel = {
          ...targetTask,
          column: targetColumn,
          updatedAt: new Date().toISOString(),
        };
        nextBoard[targetColumn] = [...nextBoard[targetColumn], updatedTask];
      }

      return nextBoard;
    });
  }, []);

  const discardIfEmpty = useCallback(
    (id: string) => {
      setBoard((prev) => {
        let shouldDelete = false;

        for (const col of Object.values(ColumnType)) {
          const found = prev[col].find((task) => task.id === id);
          if (found && (!found.title || found.title.trim() === '')) {
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
    discardIfEmpty,
    clearTasks,
    resetToSeed,
  };
}

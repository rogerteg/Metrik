import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, ColumnCategory, ColumnModel, PriorityLevel, TaskModel } from '../types/kanban';
import { DEFAULT_COLUMNS, INITIAL_SEED_TASKS, isValidBoardState } from '../utils/seedData';
import { reorderBoard } from '../utils/taskReorder';
import { ReorderOptions } from '../types/dnd';

export const STORAGE_KEY = 'metrik_kanban_tasks';

export interface UseTaskCollectionReturn {
  board: BoardState;
  
  // Column Methods
  addColumn: (title: string, category: ColumnCategory, wipLimit?: number | null) => void;
  updateColumn: (id: string, updates: Partial<ColumnModel>) => void;
  deleteColumn: (id: string) => void;
  reorderColumn: (sourceIndex: number, destinationIndex: number) => void;

  // Task Methods
  addTask: (columnId: string, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags' | 'description' | 'subtasks'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumnId: string) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  setTaskPriority: (taskId: string, priority?: PriorityLevel) => void;
  addTaskTag: (taskId: string, tag: string) => void;
  removeTaskTag: (taskId: string, tag: string) => void;
  discardIfEmpty: (id: string) => void;
  clearTasks: () => void;
  resetToSeed: () => void;
  overwriteBoard: (newState: BoardState) => void;
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
    
    // Migration: Detect legacy static structure Record<ColumnType, Task[]>
    if (parsed && !parsed.columns && !parsed.tasks) {
      console.log('[Metrik Storage] Migrating old static board to dynamic board V2.');
      
      const migratedTasks: Record<string, TaskModel[]> = {};
      
      const mapLegacyToNewId = (legacyType: string) => {
        switch(legacyType) {
          case 'Todo': return 'todo';
          case 'In Progress': return 'in-progress';
          case 'Blocked': return 'blocked';
          case 'Completed': return 'completed';
          default: return 'todo';
        }
      };

      for (const legacyKey of Object.keys(parsed)) {
        const newId = mapLegacyToNewId(legacyKey);
        if (!migratedTasks[newId]) migratedTasks[newId] = [];
        
        const oldTasks = Array.isArray(parsed[legacyKey]) ? parsed[legacyKey] : [];
        migratedTasks[newId] = oldTasks.map((t: any) => ({
          ...t,
          column: newId
        }));
      }
      
      for (const col of DEFAULT_COLUMNS) {
        if (!migratedTasks[col.id]) {
          migratedTasks[col.id] = [];
        }
      }
      
      const migratedState: BoardState = {
        columns: DEFAULT_COLUMNS,
        tasks: migratedTasks
      };
      
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedState));
      return migratedState;
    }

    if (isValidBoardState(parsed)) {
      // Ensure all columns defined in board.columns exist in tasks map
      for (const col of parsed.columns) {
        if (!parsed.tasks[col.id]) {
          parsed.tasks[col.id] = [];
        }
      }
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

  // ============================================================================
  // COLUMN METHODS
  // ============================================================================

  const addColumn = useCallback((title: string, category: ColumnCategory, wipLimit: number | null = null) => {
    setBoard((prev) => {
      const newColId = uuidv4();
      
      // Inherit a default color scheme based on category
      let colorScheme: 'todo' | 'progress' | 'blocked' | 'completed' = 'todo';
      if (category === 'in_progress') colorScheme = 'progress';
      if (category === 'done') colorScheme = 'completed';

      const newColumn: ColumnModel = {
        id: newColId,
        title,
        category,
        wipLimit,
        colorScheme,
      };

      return {
        columns: [...prev.columns, newColumn],
        tasks: {
          ...prev.tasks,
          [newColId]: [],
        },
      };
    });
  }, []);

  const updateColumn = useCallback((id: string, updates: Partial<ColumnModel>) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map(col => col.id === id ? { ...col, ...updates } : col),
    }));
  }, []);

  const deleteColumn = useCallback((id: string) => {
    setBoard((prev) => {
      // Invariant: Cannot delete a column if it has tasks
      if (prev.tasks[id] && prev.tasks[id].length > 0) {
        console.warn('Cannot delete a column that contains tasks.');
        return prev;
      }
      
      const nextTasks = { ...prev.tasks };
      delete nextTasks[id];

      return {
        columns: prev.columns.filter(col => col.id !== id),
        tasks: nextTasks,
      };
    });
  }, []);

  const reorderColumn = useCallback((sourceIndex: number, destinationIndex: number) => {
    setBoard((prev) => {
      const newColumns = Array.from(prev.columns);
      const [movedCol] = newColumns.splice(sourceIndex, 1);
      newColumns.splice(destinationIndex, 0, movedCol);
      return {
        ...prev,
        columns: newColumns
      };
    });
  }, []);

  // ============================================================================
  // TASK METHODS
  // ============================================================================

  const addTask = useCallback((columnId: string, title: string = '') => {
    const newTask: TaskModel = {
      id: uuidv4(),
      title,
      column: columnId,
      createdAt: new Date().toISOString(),
    };

    setBoard((prev) => {
      // Determine if we need to set startedAt/completedAt based on column category
      const targetCol = prev.columns.find(c => c.id === columnId);
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
        }
      };
    });

    return newTask;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags' | 'description' | 'subtasks'>>) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
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

        return { ...prev, tasks: nextTasks };
      });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      
      for (const colId of Object.keys(prev.tasks)) {
        nextTasks[colId] = prev.tasks[colId].filter((task) => task.id !== id);
      }

      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const moveTask = useCallback((id: string, targetColumnId: string) => {
    setBoard((prev) => {
      let targetTask: TaskModel | undefined;
      const nextTasks: Record<string, TaskModel[]> = {};

      for (const colId of Object.keys(prev.tasks)) {
        nextTasks[colId] = prev.tasks[colId].filter((task) => {
          if (task.id === id) {
            targetTask = task;
            return false;
          }
          return true;
        });
      }

      if (targetTask) {
        const targetCol = prev.columns.find(c => c.id === targetColumnId);
        
        const now = new Date().toISOString();
        let startedAt = targetTask.startedAt;
        let completedAt = targetTask.completedAt;

        if (targetCol) {
          if ((targetCol.category === 'in_progress' || targetCol.category === 'done') && !startedAt) {
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

        const updatedTask: TaskModel = {
          ...targetTask,
          column: targetColumnId,
          startedAt,
          completedAt,
          updatedAt: now,
        };

        if (!nextTasks[targetColumnId]) nextTasks[targetColumnId] = [];
        nextTasks[targetColumnId] = [updatedTask, ...nextTasks[targetColumnId]];
      }

      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const reorderOrMoveTask = useCallback((options: ReorderOptions) => {
    setBoard((prev) => reorderBoard(prev, options));
  }, []);

  const setTaskPriority = useCallback((taskId: string, priority?: PriorityLevel) => {
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      const now = new Date().toISOString();

      for (const colId of Object.keys(prev.tasks)) {
        nextTasks[colId] = prev.tasks[colId].map((task) => {
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
      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const addTaskTag = useCallback((taskId: string, tag: string) => {
    const cleanTag = tag.trim().slice(0, 20);
    if (!cleanTag) return;

    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      const now = new Date().toISOString();

      for (const colId of Object.keys(prev.tasks)) {
        nextTasks[colId] = prev.tasks[colId].map((task) => {
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
      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const removeTaskTag = useCallback((taskId: string, tag: string) => {
    const targetTag = tag.trim().toLowerCase();
    
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      const now = new Date().toISOString();

      for (const colId of Object.keys(prev.tasks)) {
        nextTasks[colId] = prev.tasks[colId].map((task) => {
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
      return { ...prev, tasks: nextTasks };
    });
  }, []);

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
    []
  );

  const clearTasks = useCallback(() => {
    setBoard(prev => {
      const nextTasks: Record<string, TaskModel[]> = {};
      for (const col of prev.columns) {
        nextTasks[col.id] = [];
      }
      return {
        ...prev,
        tasks: nextTasks
      };
    });
  }, []);

  const resetToSeed = useCallback(() => {
    setBoard(INITIAL_SEED_TASKS);
  }, []);

  const overwriteBoard = useCallback((newState: BoardState) => {
    setBoard(newState);
  }, []);

  return {
    board,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
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
    overwriteBoard,
  };
}

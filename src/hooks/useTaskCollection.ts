import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BoardState,
  ColumnCategory,
  ColumnModel,
  PriorityLevel,
  TaskModel,
  MAX_COLUMNS,
  FLOW_REGRESSION_WARNING_MESSAGE,
} from '../types/kanban';
import { INITIAL_SEED_TASKS, isValidBoardState } from '../utils/seedData';
import { reorderBoard, isBackwardColumnMove } from '../utils/taskReorder';
import { ReorderOptions } from '../types/dnd';

export interface UseTaskCollectionReturn {
  board: BoardState;
  
  // Column Methods
  addColumn: (title: string, category: ColumnCategory, wipLimit?: number | null) => void;
  updateColumn: (id: string, updates: Partial<ColumnModel>) => void;
  deleteColumn: (id: string) => void;
  reorderColumn: (sourceIndex: number, destinationIndex: number) => void;

  // Task Methods
  addTask: (columnId: string, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags' | 'description' | 'subtasks' | 'dueDate' | 'blocked' | 'blockedReason'>>) => void;
  toggleTaskBlocked: (taskId: string, reason?: string) => void;
  updateBlockedReason: (taskId: string, reason: string) => void;
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

const getBoardStateFromStorage = (boardId: string | null): BoardState => {
  if (!boardId || typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_SEED_TASKS;
  }

  const storageKey = `metrik-tasks-${boardId}`;
  try {
    const rawData = window.localStorage.getItem(storageKey);
    if (!rawData) {
      window.localStorage.setItem(storageKey, JSON.stringify(INITIAL_SEED_TASKS));
      return INITIAL_SEED_TASKS;
    }

    const parsed = JSON.parse(rawData);
    
    if (isValidBoardState(parsed)) {
      // Ensure all columns defined in board.columns exist in tasks map
      for (const col of parsed.columns) {
        if (!parsed.tasks[col.id]) {
          parsed.tasks[col.id] = [];
        }
      }
      return parsed;
    }

    console.warn(`[Metrik Storage] Invalid board state for ${boardId}. Falling back to seed data.`);
    window.localStorage.setItem(storageKey, JSON.stringify(INITIAL_SEED_TASKS));
    return INITIAL_SEED_TASKS;
  } catch (error) {
    console.error(`[Metrik Storage] Failed to load board ${boardId}:`, error);
    return INITIAL_SEED_TASKS;
  }
};

export function useTaskCollection(activeBoardId: string | null): UseTaskCollectionReturn {
  const [board, setBoard] = useState<BoardState>(() => getBoardStateFromStorage(activeBoardId));

  // When active board changes, load its data
  useEffect(() => {
    setBoard(getBoardStateFromStorage(activeBoardId));
  }, [activeBoardId]);

  // Sync with localStorage
  useEffect(() => {
    if (!activeBoardId) return;
    const storageKey = `metrik-tasks-${activeBoardId}`;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(board));
    } catch (error) {
      console.error('Failed to save board state to localStorage', error);
    }
  }, [board, activeBoardId]);

  // ============================================================================
  // COLUMN METHODS
  // ============================================================================

  const addColumn = useCallback((title: string, category: ColumnCategory, wipLimit: number | null = null) => {
    setBoard((prev) => {
      if (prev.columns.length >= MAX_COLUMNS) {
        console.warn(`[Metrik] Limite máximo de ${MAX_COLUMNS} colunas atingido.`);
        return prev;
      }

      const newColId = uuidv4();
      
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
    (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags' | 'description' | 'subtasks' | 'dueDate'>>) => {
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
        const isBackward = isBackwardColumnMove(prev.columns, sourceColumnId, targetColumnId);
        if (isBackward) {
          if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
            try {
              const confirmed = window.confirm(FLOW_REGRESSION_WARNING_MESSAGE);
              if (!confirmed) {
                return prev; // Bloqueia o movimento!
              }
            } catch {
              // Ignore if confirm not implemented
            }
          }
        }

        const targetCol = prev.columns.find(c => c.id === targetColumnId);
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
          totalBlockedMs,
          blocked,
          blockedAt,
          blockedReason,
          updatedAt: now,
        };

        if (!nextTasks[targetColumnId]) nextTasks[targetColumnId] = [];
        nextTasks[targetColumnId] = [updatedTask, ...nextTasks[targetColumnId]];
      }

      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const reorderOrMoveTask = useCallback((options: ReorderOptions) => {
    setBoard((prev) => {
      let sourceColumnId: string | undefined;
      for (const colId of Object.keys(prev.tasks)) {
        if (prev.tasks[colId].some((t) => t.id === options.activeTaskId)) {
          sourceColumnId = colId;
          break;
        }
      }

      if (sourceColumnId && isBackwardColumnMove(prev.columns, sourceColumnId, options.targetColumn)) {
        if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
          try {
            const confirmed = window.confirm(FLOW_REGRESSION_WARNING_MESSAGE);
            if (!confirmed) {
              return prev; // Bloqueia o movimento!
            }
          } catch {
            // Ignore if confirm not implemented
          }
        }
      }

      return reorderBoard(prev, options);
    });
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

  const toggleTaskBlocked = useCallback((taskId: string, reason?: string) => {
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      let found = false;

      for (const [colId, tasks] of Object.entries(prev.tasks)) {
        nextTasks[colId] = tasks.map((task) => {
          if (task.id === taskId) {
            found = true;
            const now = new Date().toISOString();
            if (!task.blocked) {
              return {
                ...task,
                blocked: true,
                blockedReason: reason !== undefined ? reason : (task.blockedReason || ''),
                blockedAt: now,
                updatedAt: now,
              };
            } else {
              const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
              const elapsed = Math.max(0, Date.now() - startMs);
              const totalBlockedMs = (task.totalBlockedMs || 0) + elapsed;
              return {
                ...task,
                blocked: false,
                blockedAt: undefined,
                totalBlockedMs,
                updatedAt: now,
              };
            }
          }
          return task;
        });
      }

      if (!found) return prev;
      return { ...prev, tasks: nextTasks };
    });
  }, []);

  const updateBlockedReason = useCallback((taskId: string, reason: string) => {
    setBoard((prev) => {
      const nextTasks: Record<string, TaskModel[]> = {};
      let found = false;

      for (const [colId, tasks] of Object.entries(prev.tasks)) {
        nextTasks[colId] = tasks.map((task) => {
          if (task.id === taskId) {
            found = true;
            return {
              ...task,
              blockedReason: reason,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });
      }

      if (!found) return prev;
      return { ...prev, tasks: nextTasks };
    });
  }, []);

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
    toggleTaskBlocked,
    updateBlockedReason,
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

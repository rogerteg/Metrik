import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardState,
  ColumnCategory,
  ColumnModel,
  PriorityLevel,
  TaskModel,
  SprintModel,
} from '../types/kanban';
import { useTaskComments } from './useTaskComments';
import { useSprints } from './useSprints';
import { INITIAL_SEED_TASKS, isValidBoardState } from '../utils/seedData';
import { ReorderOptions } from '../types/dnd';
import { useTaskMutations } from './taskCollection/useTaskMutations';
import { useTaskTagsAndBlockers } from './taskCollection/useTaskTagsAndBlockers';
import { useTaskReorderManager } from './taskCollection/useTaskReorderManager';

export interface UseTaskCollectionReturn {
  board: BoardState;

  // Column Methods
  addColumn: (title: string, category: ColumnCategory, wipLimit?: number | null) => void;
  updateColumn: (id: string, updates: Partial<ColumnModel>) => void;
  deleteColumn: (id: string) => void;
  reorderColumn: (sourceIndex: number, destinationIndex: number) => void;

  // Task Methods
  addTask: (columnId: string, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<TaskModel>) => void;
  toggleTaskBlocked: (taskId: string, reason?: string) => void;
  updateBlockedReason: (taskId: string, reason: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumnId: string) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  setTaskPriority: (taskId: string, priority?: PriorityLevel) => void;
  addTaskTag: (taskId: string, tag: string) => void;
  removeTaskTag: (taskId: string, tag: string) => void;
  addTaskComment: (
    taskId: string,
    text: string,
    userOrDecision?: { id: string; name: string } | boolean,
    isDecision?: boolean,
  ) => void;
  deleteTaskComment: (
    taskId: string,
    commentId: string,
    user?: { id: string; name: string },
  ) => void;
  editTaskComment: (
    taskId: string,
    commentId: string,
    text: string,
    user?: { id: string; name: string },
  ) => void;
  addSubtaskComment: (
    taskId: string,
    subtaskId: string,
    text: string,
    user?: { id: string; name: string },
  ) => void;
  editSubtaskComment: (
    taskId: string,
    subtaskId: string,
    commentId: string,
    text: string,
    user?: { id: string; name: string },
  ) => void;
  deleteSubtaskComment: (
    taskId: string,
    subtaskId: string,
    commentId: string,
    user?: { id: string; name: string },
    isAdmin?: boolean,
  ) => void;
  // Sprints (Feature 038)
  addSprint: (input: { name: string; goal?: string; startDate?: string; endDate?: string }) => void;
  updateSprint: (
    id: string,
    updates: Partial<Pick<SprintModel, 'name' | 'goal' | 'startDate' | 'endDate'>>,
  ) => void;
  deleteSprint: (id: string) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  setTaskSprint: (taskId: string, sprintId: string | null) => void;
  discardIfEmpty: (id: string) => void;
  clearTasks: () => void;
  resetToSeed: () => void;
  overwriteBoard: (newState: BoardState) => void;
}

export interface UseTaskCollectionOptions {
  onNotify?: (message: string) => void;
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
      for (const col of parsed.columns) {
        if (!parsed.tasks[col.id]) {
          parsed.tasks[col.id] = [];
        }
      }
      return parsed;
    }

    console.warn(`[Metrik Storage] Invalid board state for ${boardId}. Falling back to seed data.`);
    return INITIAL_SEED_TASKS;
  } catch (error) {
    console.error(`[Metrik Storage] Failed to load board ${boardId}:`, error);
    return INITIAL_SEED_TASKS;
  }
};

export function useTaskCollection(
  activeBoardId: string | null,
  options: UseTaskCollectionOptions = {},
): UseTaskCollectionReturn {
  const [board, setBoard] = useState<BoardState>(() => getBoardStateFromStorage(activeBoardId));
  const currentBoardIdRef = useRef<string | null>(activeBoardId);

  const onNotify = options.onNotify;
  const notify = useCallback(
    (message: string) => {
      onNotify?.(message);
    },
    [onNotify],
  );

  useEffect(() => {
    currentBoardIdRef.current = activeBoardId;
    if (activeBoardId) {
      setBoard(getBoardStateFromStorage(activeBoardId));
    }
  }, [activeBoardId]);

  useEffect(() => {
    if (!activeBoardId || currentBoardIdRef.current !== activeBoardId) return;
    const storageKey = `metrik-tasks-${activeBoardId}`;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(board));
    } catch (error) {
      console.error('Failed to save board state to localStorage', error);
    }
  }, [board, activeBoardId]);

  const mutations = useTaskMutations(setBoard);
  const tagsAndBlockers = useTaskTagsAndBlockers(setBoard);
  const reorderManager = useTaskReorderManager(setBoard, notify);
  const commentsManager = useTaskComments(setBoard);
  const sprintsManager = useSprints(setBoard);

  return {
    board,
    ...mutations,
    ...tagsAndBlockers,
    ...reorderManager,
    ...commentsManager,
    ...sprintsManager,
  };
}

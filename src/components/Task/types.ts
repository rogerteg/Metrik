import React from 'react';
import { PriorityLevel, TaskModel } from '../../types/kanban';
import { ReorderOptions } from '../../types/dnd';

export interface TaskCardProps {
  task: TaskModel;
  columnColor?: string;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDiscardIfEmpty: (id: string) => void;
  onUpdatePriority?: (id: string, priority?: PriorityLevel) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onToggleBlocked?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onDropTask?: (options: ReorderOptions) => void;
  isCompleted?: boolean;
  onClick?: () => void;
  onUpdateTask?: (id: string, updates: Partial<TaskModel>) => void;
  initiativeProgress?: { total: number; completed: number; percentage: number };
  pendingBlockersCount?: number;
  autoSaveComments?: boolean;
  autoSaveDebounceMs?: number;
  onAddComment?: (taskId: string, text: string) => void;
  onEditComment?: (taskId: string, commentId: string, text: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onAddSubtaskComment?: (taskId: string, subtaskId: string, text: string) => void;
  onEditSubtaskComment?: (
    taskId: string,
    subtaskId: string,
    commentId: string,
    text: string,
  ) => void;
  onDeleteSubtaskComment?: (taskId: string, subtaskId: string, commentId: string) => void;
  currentUser?: { id: string; name: string };
  isAdmin?: boolean;
  isReadOnly?: boolean;
  sprintName?: string;
}

export type TaskProps = TaskCardProps;

export interface TaskHeaderProps {
  task: TaskModel;
  readOnly: boolean;
  isStagnant: boolean;
  isBlocked: boolean;
  isReadOnly: boolean;
  onUpdatePriority?: (id: string, priority?: PriorityLevel) => void;
  onQuickUnlock: () => void;
}

export interface TaskBadgesProps {
  task: TaskModel;
  hasCompletedAt: boolean;
  leadTimeStr: string | null;
  cycleTimeStr: string | null;
  hasDueDate: boolean;
  dueDateStatus: string | null;
}

export interface TaskBlockerChipsProps {
  task: TaskModel;
  initiativeProgress?: { total: number; completed: number; percentage: number };
  pendingBlockersCount?: number;
}

export interface TaskChecklistSummaryProps {
  task: TaskModel;
  readOnly: boolean;
  isBlocked: boolean;
  sprintName?: string;
  autoSaveComments?: boolean;
  autoSaveDebounceMs?: number;
  onUpdateTask?: (id: string, updates: Partial<TaskModel>) => void;
  onAddComment?: (taskId: string, text: string) => void;
  onEditComment?: (taskId: string, commentId: string, text: string) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onAddSubtaskComment?: (taskId: string, subtaskId: string, text: string) => void;
  onEditSubtaskComment?: (
    taskId: string,
    subtaskId: string,
    commentId: string,
    text: string,
  ) => void;
  onDeleteSubtaskComment?: (taskId: string, subtaskId: string, commentId: string) => void;
  currentUser: { id: string; name: string };
  isAdmin: boolean;
  onClick?: () => void;
  onEditingChange: (isEditingField: boolean) => void;
}

export interface TaskCardContainerProps {
  task: TaskModel;
  columnColor?: string;
  isBlocked: boolean;
  isStagnant: boolean;
  readOnly: boolean;
  isAnyEditing: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  onDelete: (id: string) => void;
  onDropTask?: (options: ReorderOptions) => void;
  onClick?: () => void;
  children: React.ReactNode;
}

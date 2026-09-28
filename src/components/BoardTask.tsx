import React from 'react';
import {
  BoardState,
  TaskModel,
  PriorityLevel,
  SprintModel,
  getDefaultColumnColor,
} from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { isTaskBlocked } from '../utils/taskReorder';
import { calculateInitiativeProgress, getPendingBlockers } from '../utils/taskRelations';
import { Task } from './Task';

export interface BoardTaskProps {
  task: TaskModel;
  columnId: string;
  board: BoardState;
  allBoardTasks: TaskModel[];
  isGuest: boolean;
  isAdmin: boolean;
  currentUser: { id: string; name: string };
  autoSaveComments: boolean;
  autoSaveDebounceMs: number;
  /** Sprints do quadro (Feature 038) */
  sprints?: SprintModel[];
  onSelect: (taskId: string) => void;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onDelete: (id: string) => void;
  onDiscardIfEmpty: (id: string) => void;
  onUpdatePriority: (id: string, priority?: PriorityLevel) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onToggleBlocked: (id: string, reason?: string) => void;
  onDropTask: (options: ReorderOptions) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  addTaskComment: (taskId: string, text: string, user?: { id: string; name: string }) => void;
  editTaskComment: (
    taskId: string,
    commentId: string,
    text: string,
    user?: { id: string; name: string },
  ) => void;
  deleteTaskComment: (
    taskId: string,
    commentId: string,
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
}

/**
 * Cartão conectado do quadro (extraído de App.tsx — P3/SRP).
 * Resolve a posição/coluna, o progresso de iniciativa, os bloqueadores pendentes e
 * os handlers (com confinamento de convidado) e renderiza `Task`.
 */
export const BoardTask: React.FC<BoardTaskProps> = ({
  task,
  columnId,
  board,
  allBoardTasks,
  isGuest,
  isAdmin,
  currentUser,
  autoSaveComments,
  autoSaveDebounceMs,
  sprints,
  onSelect,
  onUpdateTask,
  onDelete,
  onDiscardIfEmpty,
  onUpdatePriority,
  onAddTag,
  onRemoveTag,
  onToggleBlocked,
  onDropTask,
  onMoveTask,
  addTaskComment,
  editTaskComment,
  deleteTaskComment,
  addSubtaskComment,
  editSubtaskComment,
  deleteSubtaskComment,
}) => {
  const currentIndex = board.columns.findIndex((c) => c.id === columnId);
  const currentColumn = board.columns[currentIndex];
  const isBlocked = isTaskBlocked(task);
  const canMoveLeft = !isGuest && currentIndex > 0 && !isBlocked;
  const canMoveRight = !isGuest && currentIndex < board.columns.length - 1 && !isBlocked;
  const colColor = getDefaultColumnColor(currentColumn);
  const initiativeProgress =
    task.type === 'initiative'
      ? calculateInitiativeProgress(task, allBoardTasks, board.columns)
      : undefined;
  const pendingBlockers =
    task.links && task.links.length > 0
      ? getPendingBlockers(task, allBoardTasks, board.columns)
      : [];
  const sprintName = task.sprintId
    ? (sprints ?? []).find((s) => s.id === task.sprintId)?.name
    : undefined;

  return (
    <Task
      key={task.id}
      task={task}
      columnColor={colColor}
      onClick={() => onSelect(task.id)}
      onUpdateTitle={(id, title) => onUpdateTask(id, { title })}
      onDelete={onDelete}
      onDiscardIfEmpty={onDiscardIfEmpty}
      onUpdatePriority={onUpdatePriority}
      onAddTag={onAddTag}
      onRemoveTag={onRemoveTag}
      onToggleBlocked={onToggleBlocked}
      onDropTask={onDropTask}
      isCompleted={currentColumn?.category === 'done'}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      onUpdateTask={onUpdateTask}
      isReadOnly={isGuest}
      initiativeProgress={initiativeProgress}
      pendingBlockersCount={pendingBlockers.length}
      autoSaveComments={autoSaveComments}
      autoSaveDebounceMs={autoSaveDebounceMs}
      sprintName={sprintName}
      currentUser={currentUser}
      isAdmin={isAdmin}
      onAddComment={
        isGuest ? undefined : (taskId, text) => addTaskComment(taskId, text, currentUser)
      }
      onEditComment={
        isGuest
          ? undefined
          : (taskId, commentId, text) => editTaskComment(taskId, commentId, text, currentUser)
      }
      onDeleteComment={
        isGuest
          ? undefined
          : (taskId, commentId) => deleteTaskComment(taskId, commentId, currentUser)
      }
      onAddSubtaskComment={
        isGuest
          ? undefined
          : (taskId, subtaskId, text) => addSubtaskComment(taskId, subtaskId, text, currentUser)
      }
      onEditSubtaskComment={
        isGuest
          ? undefined
          : (taskId, subtaskId, commentId, text) =>
              editSubtaskComment(taskId, subtaskId, commentId, text, currentUser)
      }
      onDeleteSubtaskComment={
        isGuest
          ? undefined
          : (taskId, subtaskId, commentId) =>
              deleteSubtaskComment(taskId, subtaskId, commentId, currentUser, isAdmin)
      }
      onMoveLeft={() => {
        if (canMoveLeft) {
          onMoveTask(task.id, board.columns[currentIndex - 1].id);
        }
      }}
      onMoveRight={() => {
        if (canMoveRight) {
          onMoveTask(task.id, board.columns[currentIndex + 1].id);
        }
      }}
    />
  );
};

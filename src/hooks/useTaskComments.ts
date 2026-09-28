import { useCallback } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import { TaskComment } from '../types/taskActivity';
import { createTaskActivityEvent, AuditDescriptions } from '../utils/taskActivityLogger';
import {
  createComment,
  editCommentInList,
  addCommentToSubtask,
  editCommentInSubtask,
  removeCommentFromSubtask,
  canEditComment,
  canDeleteComment,
} from '../utils/cardComments';

type SetBoard = React.Dispatch<React.SetStateAction<BoardState>>;

export interface UseTaskCommentsReturn {
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
}

/**
 * Mutações de comentário (cartão e subtarefa) isoladas de `useTaskCollection`
 * (P3 — SRP). Recebe o `setBoard` do dono do estado; a regra de domínio vive em
 * `src/utils/cardComments.ts`. Extraído sem mudança de comportamento.
 */
export function useTaskComments(setBoard: SetBoard): UseTaskCommentsReturn {
  const addTaskComment = useCallback(
    (
      taskId: string,
      text: string,
      userOrDecision?: { id: string; name: string } | boolean,
      isDecisionParam: boolean = false,
    ) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      const user =
        typeof userOrDecision === 'object' && userOrDecision !== null ? userOrDecision : undefined;
      const isDecision =
        typeof userOrDecision === 'boolean' ? userOrDecision : Boolean(isDecisionParam);

      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        const authorName = user?.name || 'Rogerio Teixeira';
        const authorId = user?.id || 'usr_default';

        const newComment: TaskComment = {
          id: crypto.randomUUID
            ? crypto.randomUUID()
            : `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          taskId,
          userId: authorId,
          userName: authorName,
          text: cleanText,
          isDecision: Boolean(isDecision),
          createdAt: now,
        };

        const auditEvent = createTaskActivityEvent({
          taskId,
          eventType: 'comment_added',
          description: AuditDescriptions.commentAdded(authorName),
          user: { id: authorId, name: authorName },
        });

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id === taskId) {
              const comments = [...(task.comments || []), newComment];
              const activityLog = [...(task.activityLog || []), auditEvent];
              return {
                ...task,
                comments,
                activityLog,
                updatedAt: now,
              };
            }
            return task;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const deleteTaskComment = useCallback(
    (taskId: string, commentId: string, user?: { id: string; name: string }) => {
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        const actorName = user?.name || 'Rogerio Teixeira';
        const actorId = user?.id || 'usr_default';

        const auditEvent = createTaskActivityEvent({
          taskId,
          eventType: 'comment_deleted',
          description: AuditDescriptions.commentDeleted(actorName),
          user: { id: actorId, name: actorName },
        });

        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id === taskId) {
              const comments = (task.comments || []).filter((c) => c.id !== commentId);
              const activityLog = [...(task.activityLog || []), auditEvent];
              return {
                ...task,
                comments,
                activityLog,
                updatedAt: now,
              };
            }
            return task;
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  // Feature 027 (delta) — edição de comentário do cartão e comentários de subtarefa.
  const editTaskComment = useCallback(
    (taskId: string, commentId: string, text: string, user?: { id: string; name: string }) => {
      const author = user ?? { id: 'usr_default', name: 'Rogerio Teixeira' };
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id !== taskId) return task;
            const existing = task.comments?.find((c) => c.id === commentId);
            if (!existing || !canEditComment(existing, author.id)) return task;
            return {
              ...task,
              comments: editCommentInList(task.comments, commentId, text, author, now),
              updatedAt: now,
            };
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const addSubtaskComment = useCallback(
    (taskId: string, subtaskId: string, text: string, user?: { id: string; name: string }) => {
      const author = user ?? { id: 'usr_default', name: 'Rogerio Teixeira' };
      const created = createComment({ taskId, text, author });
      if (!created) return;

      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id !== taskId) return task;
            const hasSubtask = (task.subtasks ?? []).some((s) => s.id === subtaskId);
            if (!hasSubtask) return task;
            return {
              ...task,
              subtasks: addCommentToSubtask(task.subtasks, subtaskId, created),
              updatedAt: now,
            };
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const editSubtaskComment = useCallback(
    (
      taskId: string,
      subtaskId: string,
      commentId: string,
      text: string,
      user?: { id: string; name: string },
    ) => {
      const author = user ?? { id: 'usr_default', name: 'Rogerio Teixeira' };
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id !== taskId) return task;
            const subtask = (task.subtasks ?? []).find((s) => s.id === subtaskId);
            const existing = subtask?.comments?.find((c) => c.id === commentId);
            if (!existing || !canEditComment(existing, author.id)) return task;
            return {
              ...task,
              subtasks: editCommentInSubtask(
                task.subtasks,
                subtaskId,
                commentId,
                text,
                author,
                now,
              ),
              updatedAt: now,
            };
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  const deleteSubtaskComment = useCallback(
    (
      taskId: string,
      subtaskId: string,
      commentId: string,
      user?: { id: string; name: string },
      isAdmin: boolean = false,
    ) => {
      const author = user ?? { id: 'usr_default', name: 'Rogerio Teixeira' };
      setBoard((prev) => {
        const nextTasks: Record<string, TaskModel[]> = {};
        const now = new Date().toISOString();
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) => {
            if (task.id !== taskId) return task;
            const subtask = (task.subtasks ?? []).find((s) => s.id === subtaskId);
            const existing = subtask?.comments?.find((c) => c.id === commentId);
            if (!existing || !canDeleteComment(existing, author.id, isAdmin)) return task;
            return {
              ...task,
              subtasks: removeCommentFromSubtask(
                task.subtasks,
                subtaskId,
                commentId,
                author,
                isAdmin,
              ),
              updatedAt: now,
            };
          });
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  return {
    addTaskComment,
    deleteTaskComment,
    editTaskComment,
    addSubtaskComment,
    editSubtaskComment,
    deleteSubtaskComment,
  };
}

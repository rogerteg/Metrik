import { SubtaskModel } from '../types/kanban';
import { TaskComment } from '../types/taskActivity';

/**
 * Metrik Card Child Comments (Feature 027 — delta Modo 2).
 *
 * Helpers puros para comentários de cartão pai e de subtarefa, sem React, sem DOM
 * e sem efeitos colaterais. O modelo canônico é `TaskComment` (decisão D-2 do
 * `proposal.md`): não existe um `CommentModel` paralelo.
 */

export interface CommentAuthor {
  id: string;
  name: string;
}

const DEFAULT_AUTHOR: CommentAuthor = { id: 'usr_default', name: 'Rogerio Teixeira' };

const makeId = (): string =>
  typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** Apara as extremidades do texto; `undefined`/`null` viram string vazia. */
export function normalizeCommentText(text: string | undefined | null): string {
  return (text ?? '').trim();
}

/**
 * Cria um comentário normalizado. Retorna `null` para texto vazio ou só com
 * espaços (FR-011), sem produzir registro algum.
 */
export function createComment(params: {
  taskId: string;
  text: string;
  author?: CommentAuthor;
  isDecision?: boolean;
  now?: string;
}): TaskComment | null {
  const text = normalizeCommentText(params.text);
  if (!text) return null;

  const author = params.author ?? DEFAULT_AUTHOR;
  return {
    id: makeId(),
    taskId: params.taskId,
    userId: author.id,
    userName: author.name,
    text,
    isDecision: params.isDecision,
    createdAt: params.now ?? new Date().toISOString(),
  };
}

/** Ordena cronologicamente por `createdAt`, sem mutar a entrada (FR-009). */
export function sortComments(comments: TaskComment[] | undefined): TaskComment[] {
  if (!comments || comments.length === 0) return [];
  return [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/** Apenas o próprio autor pode editar (matriz de permissões do contrato §3). */
export function canEditComment(comment: TaskComment, userId: string): boolean {
  return comment.userId === userId;
}

/** O autor pode excluir o próprio comentário; administradores excluem qualquer um. */
export function canDeleteComment(comment: TaskComment, userId: string, isAdmin = false): boolean {
  return comment.userId === userId || isAdmin;
}

/**
 * Edita um comentário da lista preservando `createdAt` e atualizando `updatedAt`.
 * Retorna a mesma referência quando não há mudança (texto inválido ou sem permissão).
 */
export function editCommentInList(
  comments: TaskComment[] | undefined,
  commentId: string,
  text: string,
  author: CommentAuthor,
  now: string = new Date().toISOString()
): TaskComment[] {
  const list = comments ?? [];
  const clean = normalizeCommentText(text);
  if (!clean) return list;

  let changed = false;
  const next = list.map((comment) => {
    if (comment.id !== commentId || !canEditComment(comment, author.id)) return comment;
    changed = true;
    return { ...comment, text: clean, updatedAt: now };
  });

  return changed ? next : list;
}

/**
 * Remove um comentário respeitando a permissão. Retorna a mesma referência quando
 * o comentário não existe ou o autor não tem permissão.
 */
export function removeCommentFromList(
  comments: TaskComment[] | undefined,
  commentId: string,
  author: CommentAuthor,
  isAdmin = false
): TaskComment[] {
  const list = comments ?? [];
  const target = list.find((comment) => comment.id === commentId);
  if (!target || !canDeleteComment(target, author.id, isAdmin)) return list;
  return list.filter((comment) => comment.id !== commentId);
}

/** Indica se a subtarefa possui comentários (usado pelo aviso de cascata). */
export function subtaskHasComments(subtask: SubtaskModel | undefined | null): boolean {
  return Array.isArray(subtask?.comments) && subtask!.comments!.length > 0;
}

/** Adiciona um comentário à subtarefa indicada, preservando as demais. */
export function addCommentToSubtask(
  subtasks: SubtaskModel[] | undefined,
  subtaskId: string,
  comment: TaskComment
): SubtaskModel[] {
  return (subtasks ?? []).map((subtask) =>
    subtask.id === subtaskId
      ? { ...subtask, comments: [...(subtask.comments ?? []), comment] }
      : subtask
  );
}

/** Edita um comentário dentro de uma subtarefa. */
export function editCommentInSubtask(
  subtasks: SubtaskModel[] | undefined,
  subtaskId: string,
  commentId: string,
  text: string,
  author: CommentAuthor,
  now: string = new Date().toISOString()
): SubtaskModel[] {
  return (subtasks ?? []).map((subtask) =>
    subtask.id === subtaskId
      ? { ...subtask, comments: editCommentInList(subtask.comments, commentId, text, author, now) }
      : subtask
  );
}

/** Remove um comentário de dentro de uma subtarefa. */
export function removeCommentFromSubtask(
  subtasks: SubtaskModel[] | undefined,
  subtaskId: string,
  commentId: string,
  author: CommentAuthor,
  isAdmin = false
): SubtaskModel[] {
  return (subtasks ?? []).map((subtask) =>
    subtask.id === subtaskId
      ? { ...subtask, comments: removeCommentFromList(subtask.comments, commentId, author, isAdmin) }
      : subtask
  );
}

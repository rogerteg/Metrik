import { describe, it, expect } from 'vitest';
import {
  normalizeCommentText,
  createComment,
  sortComments,
  canEditComment,
  canDeleteComment,
  editCommentInList,
  removeCommentFromList,
  subtaskHasComments,
  addCommentToSubtask,
  editCommentInSubtask,
  removeCommentFromSubtask,
} from '../../src/utils/cardComments';
import { TaskComment } from '../../src/types/taskActivity';
import { SubtaskModel } from '../../src/types/kanban';

const author = { id: 'user-a', name: 'Ana' };
const other = { id: 'user-b', name: 'Bruno' };

const comment = (over: Partial<TaskComment> = {}): TaskComment => ({
  id: 'c1',
  taskId: 'task-1',
  userId: author.id,
  userName: author.name,
  text: 'olá',
  createdAt: '2026-09-28T10:00:00.000Z',
  ...over,
});

describe('cardComments — domínio puro (Feature 027 delta)', () => {
  describe('normalizeCommentText (FR-011)', () => {
    it('trims surrounding whitespace', () => {
      expect(normalizeCommentText('  texto  ')).toBe('texto');
    });

    it('treats null/undefined as empty', () => {
      expect(normalizeCommentText(null)).toBe('');
      expect(normalizeCommentText(undefined)).toBe('');
    });
  });

  describe('createComment (FR-008, FR-011)', () => {
    it('rejects empty or whitespace-only text', () => {
      expect(createComment({ taskId: 't', text: '' })).toBeNull();
      expect(createComment({ taskId: 't', text: '   ' })).toBeNull();
    });

    it('creates a normalized comment with author and timestamp', () => {
      const created = createComment({
        taskId: 't',
        text: '  decisão tomada  ',
        author,
        now: '2026-09-28T12:00:00.000Z',
      });

      expect(created).not.toBeNull();
      expect(created!.text).toBe('decisão tomada');
      expect(created!.userId).toBe(author.id);
      expect(created!.userName).toBe(author.name);
      expect(created!.taskId).toBe('t');
      expect(created!.createdAt).toBe('2026-09-28T12:00:00.000Z');
      expect(created!.updatedAt).toBeUndefined();
    });
  });

  describe('sortComments (FR-009)', () => {
    it('orders chronologically without mutating the input', () => {
      const list = [
        comment({ id: 'b', createdAt: '2026-09-28T12:00:00.000Z' }),
        comment({ id: 'a', createdAt: '2026-09-28T10:00:00.000Z' }),
      ];
      const sorted = sortComments(list);

      expect(sorted.map((c) => c.id)).toEqual(['a', 'b']);
      expect(list.map((c) => c.id)).toEqual(['b', 'a']);
    });

    it('returns an empty array for undefined', () => {
      expect(sortComments(undefined)).toEqual([]);
    });
  });

  describe('permissions (contract §3)', () => {
    it('only the author can edit', () => {
      expect(canEditComment(comment(), author.id)).toBe(true);
      expect(canEditComment(comment(), other.id)).toBe(false);
    });

    it('author and admin can delete; non-author member cannot', () => {
      expect(canDeleteComment(comment(), author.id, false)).toBe(true);
      expect(canDeleteComment(comment(), other.id, true)).toBe(true);
      expect(canDeleteComment(comment(), other.id, false)).toBe(false);
    });
  });

  describe('editCommentInList (FR-006a, FR-010)', () => {
    it('edits own comment, preserving createdAt and setting updatedAt', () => {
      const next = editCommentInList(
        [comment()],
        'c1',
        '  texto revisado ',
        author,
        '2026-09-28T13:00:00.000Z',
      );

      expect(next[0].text).toBe('texto revisado');
      expect(next[0].createdAt).toBe('2026-09-28T10:00:00.000Z');
      expect(next[0].updatedAt).toBe('2026-09-28T13:00:00.000Z');
    });

    it('ignores edits from a non-author', () => {
      const list = [comment()];
      expect(editCommentInList(list, 'c1', 'hack', other)).toBe(list);
    });

    it('ignores empty edits', () => {
      const list = [comment()];
      expect(editCommentInList(list, 'c1', '   ', author)).toBe(list);
    });
  });

  describe('removeCommentFromList (FR-010)', () => {
    it('removes the author own comment', () => {
      const next = removeCommentFromList([comment(), comment({ id: 'c2' })], 'c1', author);
      expect(next.map((c) => c.id)).toEqual(['c2']);
    });

    it('lets an admin remove a foreign comment', () => {
      const next = removeCommentFromList([comment()], 'c1', other, true);
      expect(next).toEqual([]);
    });

    it('refuses removal by a non-author member', () => {
      const list = [comment()];
      expect(removeCommentFromList(list, 'c1', other, false)).toBe(list);
    });
  });

  describe('subtask comments (FR-007a, cascade)', () => {
    const subtasks: SubtaskModel[] = [
      { id: 's1', title: 'Passo 1', completed: false },
      {
        id: 's2',
        title: 'Passo 2',
        completed: true,
        comments: [comment({ id: 'child', taskId: 'task-1' })],
      },
    ];

    it('detects whether a subtask has comments', () => {
      expect(subtaskHasComments(subtasks[0])).toBe(false);
      expect(subtaskHasComments(subtasks[1])).toBe(true);
      expect(subtaskHasComments(undefined)).toBe(false);
    });

    it('adds a comment to the target subtask only (parent/child isolation)', () => {
      const created = createComment({ taskId: 'task-1', text: 'nota', author })!;
      const next = addCommentToSubtask(subtasks, 's1', created);

      expect(next[0].comments).toEqual([created]);
      expect(next[1].comments).toHaveLength(1);
      expect(next[1].comments![0].id).toBe('child');
    });

    it('edits and removes comments inside a subtask', () => {
      const edited = editCommentInSubtask(
        subtasks,
        's2',
        'child',
        'revisado',
        author,
        '2026-09-28T14:00:00.000Z',
      );
      expect(edited[1].comments![0].text).toBe('revisado');
      expect(edited[1].comments![0].updatedAt).toBe('2026-09-28T14:00:00.000Z');

      const removed = removeCommentFromSubtask(subtasks, 's2', 'child', author);
      expect(removed[1].comments).toEqual([]);
      expect(removed[0].comments).toBeUndefined();
    });
  });
});

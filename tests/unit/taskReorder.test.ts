import { describe, it, expect } from 'vitest';
import { reorderBoard, isTaskBlocked } from '../../src/utils/taskReorder';
import { BoardState, ColumnModel, TaskModel } from '../../src/types/kanban';

describe('reorderBoard (Pure Reordering & Transition Function)', () => {
  const columns: ColumnModel[] = [
    { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'in-progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' },
    { id: 'blocked', title: 'Blocked', category: 'in_progress', wipLimit: null, colorScheme: 'blocked' },
    { id: 'completed', title: 'Completed', category: 'done', wipLimit: null, colorScheme: 'completed' }
  ];

  const sampleBoard: BoardState = {
    columns,
    tasks: {
      'todo': [
        {
          id: 'task-1',
          title: 'Task 1',
          column: 'todo',
          createdAt: '2026-09-08T10:00:00Z',
        },
      ],
      'in-progress': [
        {
          id: 'task-2',
          title: 'Task 2',
          column: 'in-progress',
          createdAt: '2026-09-08T09:00:00Z',
          startedAt: '2026-09-08T09:15:00Z',
        },
      ],
      'blocked': [],
      'completed': [
        {
          id: 'task-3',
          title: 'Task 3',
          column: 'completed',
          createdAt: '2026-09-07T10:00:00Z',
          startedAt: '2026-09-07T10:15:00Z',
          completedAt: '2026-09-08T10:00:00Z',
        },
      ],
    }
  };

  it('moves a task to another column appending to the end when no targetTaskId is specified', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: 'in-progress',
    });

    expect(result.tasks['todo'].length).toBe(0);
    expect(result.tasks['in-progress'].length).toBe(2);

    const movedTask = result.tasks['in-progress'][1];
    expect(movedTask.id).toBe('task-1');
    expect(movedTask.column).toBe('in-progress');
    expect(movedTask.startedAt).toBeDefined(); // First time in progress
  });

  it('records completedAt and ensures startedAt when moving to completed', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-2',
      targetColumn: 'completed',
    });

    expect(result.tasks['in-progress'].length).toBe(0);
    expect(result.tasks['completed'].length).toBe(2);

    const moved = result.tasks['completed'].find((t) => t.id === 'task-2');
    expect(moved?.completedAt).toBeDefined();
    expect(moved?.startedAt).toBe('2026-09-08T09:15:00Z');
  });

  it('clears completedAt when reopened from completed to in_progress', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-3',
      targetColumn: 'in-progress',
    });

    const reopened = result.tasks['in-progress'].find((t) => t.id === 'task-3');
    expect(reopened?.completedAt).toBeUndefined();
    expect(reopened?.startedAt).toBe('2026-09-07T10:15:00Z');
  });

  it('reorders tasks within the same column before a target task', () => {
    const localBoard: BoardState = {
      columns,
      tasks: {
        'todo': [
          { id: 'a', title: 'A', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
          { id: 'b', title: 'B', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
        ],
        'in-progress': [], 'blocked': [], 'completed': []
      }
    };

    const result = reorderBoard(localBoard, {
      activeTaskId: 'b',
      targetColumn: 'todo',
      targetTaskId: 'a',
      position: 'before',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['b', 'a']);
  });

  it('reorders tasks within the same column after a target task', () => {
    const localBoard: BoardState = {
      columns,
      tasks: {
        'todo': [
          { id: 'a', title: 'A', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
          { id: 'b', title: 'B', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
        ],
        'in-progress': [], 'blocked': [], 'completed': []
      }
    };

    const result = reorderBoard(localBoard, {
      activeTaskId: 'a',
      targetColumn: 'todo',
      targetTaskId: 'b',
      position: 'after',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['b', 'a']);
  });

  it('returns identical board when active task is not found', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'non-existent',
      targetColumn: 'todo',
    });

    expect(result).toBe(sampleBoard);
  });

  it('handles dropping a task onto itself in same column as a no-op', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: 'todo',
      targetTaskId: 'task-1',
    });

    expect(result).toBe(sampleBoard);
  });
});

describe('isTaskBlocked (Pure Predicate - Feature 025)', () => {
  it('returns false for undefined or null tasks', () => {
    expect(isTaskBlocked(undefined)).toBe(false);
    expect(isTaskBlocked(null)).toBe(false);
  });

  it('returns false for tasks that are not blocked and have no tags', () => {
    const task: TaskModel = {
      id: 't1',
      title: 'Normal task',
      column: 'todo',
      createdAt: '2026-09-14T10:00:00Z',
    };
    expect(isTaskBlocked(task)).toBe(false);
  });

  it('returns true when task.blocked is strictly true', () => {
    const task: TaskModel = {
      id: 't1',
      title: 'Blocked task',
      column: 'todo',
      createdAt: '2026-09-14T10:00:00Z',
      blocked: true,
      blockedReason: 'Waiting for vendor',
    };
    expect(isTaskBlocked(task)).toBe(true);
  });

  it('returns true when task.tags contains "bloqueado" (case-insensitive and trimmed)', () => {
    const task: TaskModel = {
      id: 't1',
      title: 'Task with tag',
      column: 'todo',
      createdAt: '2026-09-14T10:00:00Z',
      tags: ['feature', '  Bloqueado  '],
    };
    expect(isTaskBlocked(task)).toBe(true);
  });

  it('returns true when task.tags contains "bloqueada", "blocked" or "impedimento"', () => {
    expect(isTaskBlocked({ id: '1', title: 'A', column: 'c', createdAt: '2026-09-14', tags: ['bloqueada'] })).toBe(true);
    expect(isTaskBlocked({ id: '2', title: 'B', column: 'c', createdAt: '2026-09-14', tags: ['BLOCKED'] })).toBe(true);
    expect(isTaskBlocked({ id: '3', title: 'C', column: 'c', createdAt: '2026-09-14', tags: ['Impedimento'] })).toBe(true);
  });

  it('returns false when task.tags has unrelated tags', () => {
    const task: TaskModel = {
      id: 't1',
      title: 'Normal tags',
      column: 'todo',
      createdAt: '2026-09-14T10:00:00Z',
      tags: ['frontend', 'bug', 'urgente'],
    };
    expect(isTaskBlocked(task)).toBe(false);
  });
});

describe('reorderBoard - Blocked Task Movement Lock (Feature 025)', () => {
  const columns: ColumnModel[] = [
    { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'in-progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' },
    { id: 'completed', title: 'Completed', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const boardWithBlocked: BoardState = {
    columns,
    tasks: {
      'todo': [
        {
          id: 'blocked-task-1',
          title: 'Blocked Card 1',
          column: 'todo',
          createdAt: '2026-09-14T10:00:00Z',
          blocked: true,
          blockedReason: 'API dependency',
        },
        {
          id: 'blocked-task-2',
          title: 'Blocked Card by Tag',
          column: 'todo',
          createdAt: '2026-09-14T10:00:00Z',
          tags: ['bloqueado'],
        },
        {
          id: 'normal-task-3',
          title: 'Normal Card 3',
          column: 'todo',
          createdAt: '2026-09-14T10:00:00Z',
        },
      ],
      'in-progress': [],
      'completed': [],
    },
  };

  it('strictly rejects moving a blocked task (blocked=true) to another column, returning unmodified board', () => {
    const result = reorderBoard(boardWithBlocked, {
      activeTaskId: 'blocked-task-1',
      targetColumn: 'in-progress',
    });

    expect(result).toBe(boardWithBlocked);
    expect(result.tasks['todo'].find((t) => t.id === 'blocked-task-1')).toBeDefined();
    expect(result.tasks['in-progress'].length).toBe(0);
  });

  it('strictly rejects moving a blocked task (by tag) to another column, returning unmodified board', () => {
    const result = reorderBoard(boardWithBlocked, {
      activeTaskId: 'blocked-task-2',
      targetColumn: 'in-progress',
    });

    expect(result).toBe(boardWithBlocked);
    expect(result.tasks['todo'].find((t) => t.id === 'blocked-task-2')).toBeDefined();
    expect(result.tasks['in-progress'].length).toBe(0);
  });

  it('permits vertical reordering of a blocked task within the SAME column before another task', () => {
    const result = reorderBoard(boardWithBlocked, {
      activeTaskId: 'normal-task-3',
      targetColumn: 'todo',
      targetTaskId: 'blocked-task-1',
      position: 'before',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['normal-task-3', 'blocked-task-1', 'blocked-task-2']);
  });

  it('permits vertical reordering of a blocked task within the SAME column after another task', () => {
    const result = reorderBoard(boardWithBlocked, {
      activeTaskId: 'blocked-task-1',
      targetColumn: 'todo',
      targetTaskId: 'normal-task-3',
      position: 'after',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['blocked-task-2', 'normal-task-3', 'blocked-task-1']);
  });
});

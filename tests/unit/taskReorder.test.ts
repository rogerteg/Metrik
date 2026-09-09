import { describe, it, expect } from 'vitest';
import { reorderBoard } from '../../src/utils/taskReorder';
import { BoardState, ColumnModel } from '../../src/types/kanban';

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

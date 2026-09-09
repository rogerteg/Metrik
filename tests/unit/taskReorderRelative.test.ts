import { describe, it, expect } from 'vitest';
import { reorderBoard } from '../../src/utils/taskReorder';
import { BoardState } from '../../src/types/kanban';

describe('taskReorderRelative (Vertical Reordering in Same Column)', () => {
  const threeTaskBoard: BoardState = {
    columns: [
      { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' }
    ],
    tasks: {
      'todo': [
        { id: 'task-A', title: 'Task A', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
        { id: 'task-B', title: 'Task B', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
        { id: 'task-C', title: 'Task C', column: 'todo', createdAt: '2026-09-08T10:00:00Z' },
      ],
    }
  };

  it('moves task C before task A', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-C',
      targetColumn: 'todo',
      targetTaskId: 'task-A',
      position: 'before',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['task-C', 'task-A', 'task-B']);
  });

  it('moves task A after task B', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-A',
      targetColumn: 'todo',
      targetTaskId: 'task-B',
      position: 'after',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['task-B', 'task-A', 'task-C']);
  });

  it('moves task B to the end after task C', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-B',
      targetColumn: 'todo',
      targetTaskId: 'task-C',
      position: 'after',
    });

    const order = result.tasks['todo'].map((t) => t.id);
    expect(order).toEqual(['task-A', 'task-C', 'task-B']);
  });
});

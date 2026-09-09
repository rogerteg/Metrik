import { describe, it, expect } from 'vitest';
import { reorderBoard } from '../../src/utils/taskReorder';
import { BoardState, ColumnType } from '../../src/types/kanban';

describe('taskReorderRelative (Vertical Reordering in Same Column)', () => {
  const threeTaskBoard: BoardState = {
    [ColumnType.TO_DO]: [
      { id: 'task-A', title: 'Task A', column: ColumnType.TO_DO, createdAt: '2026-09-01T10:00:00Z' },
      { id: 'task-B', title: 'Task B', column: ColumnType.TO_DO, createdAt: '2026-09-01T10:01:00Z' },
      { id: 'task-C', title: 'Task C', column: ColumnType.TO_DO, createdAt: '2026-09-01T10:02:00Z' },
    ],
    [ColumnType.IN_PROGRESS]: [],
    [ColumnType.BLOCKED]: [],
    [ColumnType.COMPLETED]: [],
  };

  it('moves task C before task A', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-C',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-A',
      position: 'before',
    });

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-C', 'task-A', 'task-B']);
  });

  it('moves task A after task B', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-A',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-B',
      position: 'after',
    });

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-B', 'task-A', 'task-C']);
  });

  it('moves task B to the end after task C', () => {
    const result = reorderBoard(threeTaskBoard, {
      activeTaskId: 'task-B',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-C',
      position: 'after',
    });

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-A', 'task-C', 'task-B']);
  });
});

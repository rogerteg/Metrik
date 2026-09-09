import { describe, it, expect } from 'vitest';
import { reorderBoard } from '../../src/utils/taskReorder';
import { BoardState, ColumnType } from '../../src/types/kanban';

describe('reorderBoard (Pure Reordering & Transition Function)', () => {
  const sampleBoard: BoardState = {
    [ColumnType.TO_DO]: [
      {
        id: 'task-1',
        title: 'Task 1',
        column: ColumnType.TO_DO,
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'task-2',
        title: 'Task 2',
        column: ColumnType.TO_DO,
        createdAt: '2026-09-01T11:00:00Z',
      },
    ],
    [ColumnType.IN_PROGRESS]: [
      {
        id: 'task-3',
        title: 'Task 3',
        column: ColumnType.IN_PROGRESS,
        createdAt: '2026-09-01T09:00:00Z',
        startedAt: '2026-09-01T10:30:00Z',
      },
    ],
    [ColumnType.BLOCKED]: [],
    [ColumnType.COMPLETED]: [
      {
        id: 'task-4',
        title: 'Task 4',
        column: ColumnType.COMPLETED,
        createdAt: '2026-09-01T08:00:00Z',
        startedAt: '2026-09-01T08:30:00Z',
        completedAt: '2026-09-01T09:00:00Z',
      },
    ],
  };

  it('moves a task to another column appending to the end when no targetTaskId is specified', () => {
    const fixedNow = '2026-09-08T12:00:00Z';
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: ColumnType.IN_PROGRESS,
    }, fixedNow);

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-2']);
    expect(result[ColumnType.IN_PROGRESS].map(t => t.id)).toEqual(['task-3', 'task-1']);

    const moved = result[ColumnType.IN_PROGRESS].find(t => t.id === 'task-1');
    expect(moved?.column).toBe(ColumnType.IN_PROGRESS);
    expect(moved?.startedAt).toBe(fixedNow);
    expect(moved?.completedAt).toBeUndefined();
  });

  it('records completedAt and ensures startedAt when moving to completed', () => {
    const fixedNow = '2026-09-08T14:00:00Z';
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: ColumnType.COMPLETED,
    }, fixedNow);

    const moved = result[ColumnType.COMPLETED].find(t => t.id === 'task-1');
    expect(moved?.column).toBe(ColumnType.COMPLETED);
    expect(moved?.startedAt).toBe('2026-09-01T10:00:00Z'); // createdAt fallback
    expect(moved?.completedAt).toBe(fixedNow);
  });

  it('clears completedAt when reopened from completed to in_progress', () => {
    const fixedNow = '2026-09-08T15:00:00Z';
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-4',
      targetColumn: ColumnType.IN_PROGRESS,
    }, fixedNow);

    const moved = result[ColumnType.IN_PROGRESS].find(t => t.id === 'task-4');
    expect(moved?.column).toBe(ColumnType.IN_PROGRESS);
    expect(moved?.startedAt).toBe('2026-09-01T08:30:00Z'); // preserved
    expect(moved?.completedAt).toBeUndefined(); // cleared
  });

  it('reorders tasks within the same column before a target task', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-2',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-1',
      position: 'before',
    });

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-2', 'task-1']);
  });

  it('reorders tasks within the same column after a target task', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-2',
      position: 'after',
    });

    expect(result[ColumnType.TO_DO].map(t => t.id)).toEqual(['task-2', 'task-1']);
  });

  it('returns identical board when active task is not found', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'non-existent',
      targetColumn: ColumnType.TO_DO,
    });
    expect(result).toEqual(sampleBoard);
  });

  it('handles dropping a task onto itself in same column as a no-op', () => {
    const result = reorderBoard(sampleBoard, {
      activeTaskId: 'task-1',
      targetColumn: ColumnType.TO_DO,
      targetTaskId: 'task-1',
    });
    expect(result).toEqual(sampleBoard);
  });
});

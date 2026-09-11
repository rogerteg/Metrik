import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCfdData, calculateCfd, getLastNDays } from '../../src/hooks/useCfdData';
import { TaskModel } from '../../src/types/kanban';

describe('useCfdData & calculateCfd (Feature 011)', () => {
  it('returns empty points structure for empty task list', () => {
    const { result } = renderHook(() => useCfdData([]));

    expect(result.current.points.length).toBe(14);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.maxTotal).toBe(1);
    expect(result.current.points.every((p) => p.total === 0)).toBe(true);
  });

  it('guarantees monotonically non-decreasing cumulative counts', () => {
    const days = getLastNDays(14);
    const day0 = days[0];
    const day5 = days[5];
    const day10 = days[10];

    const tasks: TaskModel[] = [
      {
        id: 't1',
        title: 'Task 1',
        column: 'done',
        createdAt: `${day0}T08:00:00Z`,
        startedAt: `${day0}T09:00:00Z`,
        completedAt: `${day5}T10:00:00Z`,
      },
      {
        id: 't2',
        title: 'Task 2',
        column: 'in_progress',
        createdAt: `${day0}T08:00:00Z`,
        startedAt: `${day5}T09:00:00Z`,
      },
      {
        id: 't3',
        title: 'Task 3',
        column: 'todo',
        createdAt: `${day5}T08:00:00Z`,
      },
      {
        id: 't4',
        title: 'Task 4',
        column: 'done',
        createdAt: `${day5}T08:00:00Z`,
        startedAt: `${day10}T09:00:00Z`,
        completedAt: `${day10}T12:00:00Z`,
      },
    ];

    const data = calculateCfd(tasks, 14);

    expect(data.isEmpty).toBe(false);
    expect(data.points.length).toBe(14);

    // Verify monotonic property: Total, CumulativeStarted, and CumulativeDone never decrease
    for (let i = 1; i < data.points.length; i++) {
      const prev = data.points[i - 1];
      const curr = data.points[i];

      expect(curr.total).toBeGreaterThanOrEqual(prev.total);
      expect(curr.cumulativeStarted).toBeGreaterThanOrEqual(prev.cumulativeStarted);
      expect(curr.cumulativeDone).toBeGreaterThanOrEqual(prev.cumulativeDone);
    }

    // Verify invariant: total = todo + inProgress + done
    data.points.forEach((p) => {
      expect(p.total).toBe(p.todo + p.inProgress + p.done);
      expect(p.cumulativeStarted).toBe(p.done + p.inProgress);
      expect(p.cumulativeDone).toBe(p.done);
    });
  });

  it('correctly handles tasks completed on the same day as created', () => {
    const days = getLastNDays(14);
    const targetDay = days[7];

    const tasks: TaskModel[] = [
      {
        id: 'quick-task',
        title: 'Quick Task',
        column: 'done',
        createdAt: `${targetDay}T10:00:00Z`,
        completedAt: `${targetDay}T11:00:00Z`,
      },
    ];

    const data = calculateCfd(tasks, 14);
    const dayPoint = data.points.find((p) => p.date === targetDay);

    expect(dayPoint).toBeDefined();
    expect(dayPoint?.total).toBe(1);
    expect(dayPoint?.done).toBe(1);
    expect(dayPoint?.inProgress).toBe(0);
    expect(dayPoint?.todo).toBe(0);
  });

  it('correctly accounts for tasks created prior to the 14-day window', () => {
    const tasks: TaskModel[] = [
      {
        id: 'ancient-task',
        title: 'Ancient Task',
        column: 'todo',
        createdAt: '2020-01-01T00:00:00Z',
      },
    ];

    const data = calculateCfd(tasks, 14);

    // Every day in the 14-day window should see total = 1, todo = 1
    data.points.forEach((p) => {
      expect(p.total).toBe(1);
      expect(p.todo).toBe(1);
      expect(p.inProgress).toBe(0);
      expect(p.done).toBe(0);
    });
  });

  it('calculates full board stages when custom columns are provided', () => {
    const days = getLastNDays(14);
    const targetDay = days[13];

    const columns = [
      { id: 'c-todo', title: 'To Do', category: 'todo' as const, wipLimit: null, colorScheme: 'todo' as const },
      { id: 'c-dev', title: 'Development', category: 'in_progress' as const, wipLimit: null, colorScheme: 'progress' as const },
      { id: 'c-qa', title: 'QA Review', category: 'in_progress' as const, wipLimit: null, colorScheme: 'blocked' as const },
      { id: 'c-done', title: 'Concluído', category: 'done' as const, wipLimit: null, colorScheme: 'completed' as const },
    ];

    const tasks: TaskModel[] = [
      { id: 't1', title: 'Task 1', column: 'c-todo', createdAt: `${targetDay}T08:00:00Z` },
      { id: 't2', title: 'Task 2', column: 'c-dev', createdAt: `${targetDay}T08:00:00Z`, startedAt: `${targetDay}T09:00:00Z` },
      { id: 't3', title: 'Task 3', column: 'c-qa', createdAt: `${targetDay}T08:00:00Z`, startedAt: `${targetDay}T09:30:00Z` },
      { id: 't4', title: 'Task 4', column: 'c-done', createdAt: `${targetDay}T08:00:00Z`, startedAt: `${targetDay}T09:00:00Z`, completedAt: `${targetDay}T10:00:00Z` },
    ];

    const data = calculateCfd(tasks, 14, columns);
    expect(data.columns).toEqual(columns);

    const todayPoint = data.points.find((p) => p.date === targetDay);
    expect(todayPoint).toBeDefined();
    expect(todayPoint?.stageCounts?.['c-todo']).toBe(1);
    expect(todayPoint?.stageCounts?.['c-dev']).toBe(1);
    expect(todayPoint?.stageCounts?.['c-qa']).toBe(1);
    expect(todayPoint?.stageCounts?.['c-done']).toBe(1);

    // Cumulative check (from right to left)
    expect(todayPoint?.cumulativeStages?.['c-done']).toBe(1);
    expect(todayPoint?.cumulativeStages?.['c-qa']).toBe(2);
    expect(todayPoint?.cumulativeStages?.['c-dev']).toBe(3);
    expect(todayPoint?.cumulativeStages?.['c-todo']).toBe(4);
  });

  it('calculates CFD points with custom date range (startDate & endDate)', () => {
    const tasks: TaskModel[] = [
      { id: 't1', title: 'Task 1', column: 'done', createdAt: '2026-09-01T08:00:00Z', completedAt: '2026-09-03T10:00:00Z' },
    ];

    const data = calculateCfd(tasks, 14, undefined, {
      startDate: '2026-09-01',
      endDate: '2026-09-05',
    });

    expect(data.points.length).toBe(5);
    expect(data.points[0].date).toBe('2026-09-01');
    expect(data.points[4].date).toBe('2026-09-05');
  });
});

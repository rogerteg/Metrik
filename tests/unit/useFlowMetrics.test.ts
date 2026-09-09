import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowMetrics } from '../../src/hooks/useFlowMetrics';
import { TaskModel } from '../../src/types/kanban';

describe('useFlowMetrics Hook (Feature 013 - Flow Efficiency)', () => {
  it('returns default metrics with null efficiency when no tasks are completed', () => {
    const { result } = renderHook(() => useFlowMetrics([]));

    expect(result.current.throughput).toBe(0);
    expect(result.current.avgLeadTimeMs).toBeNull();
    expect(result.current.avgCycleTimeMs).toBeNull();
    expect(result.current.flowEfficiency).toBeNull();
    expect(result.current.formattedFlowEfficiency).toBe('-');
    expect(result.current.blockedCount).toBe(0);
  });

  it('calculates weighted flow efficiency correctly with blocked time', () => {
    // Task 1: started at 10:00, completed at 20:00 (10h = 36,000,000 ms), blocked for 2h (7,200,000 ms) -> Active = 8h
    // Task 2: started at 10:00, completed at 20:00 (10h = 36,000,000 ms), blocked for 0h -> Active = 10h
    // Total Cycle = 20h, Total Active = 18h -> Efficiency = 18 / 20 = 90%
    const tasks: TaskModel[] = [
      {
        id: 't1',
        title: 'Task 1',
        column: 'done',
        createdAt: '2026-09-08T09:00:00.000Z',
        startedAt: '2026-09-08T10:00:00.000Z',
        completedAt: '2026-09-08T20:00:00.000Z',
        totalBlockedMs: 2 * 3600 * 1000,
      },
      {
        id: 't2',
        title: 'Task 2',
        column: 'done',
        createdAt: '2026-09-08T09:00:00.000Z',
        startedAt: '2026-09-08T10:00:00.000Z',
        completedAt: '2026-09-08T20:00:00.000Z',
        totalBlockedMs: 0,
      },
    ];

    const { result } = renderHook(() => useFlowMetrics(tasks));

    expect(result.current.throughput).toBe(2);
    expect(result.current.flowEfficiency).toBe(90);
    expect(result.current.formattedFlowEfficiency).toBe('90%');
  });

  it('safely caps efficiency at 100% and 0% even if totalBlockedMs exceeds cycle time', () => {
    const anomalousTask: TaskModel[] = [
      {
        id: 'anomaly',
        title: 'Anomaly',
        column: 'done',
        createdAt: '2026-09-08T10:00:00.000Z',
        completedAt: '2026-09-08T11:00:00.000Z', // 1h
        totalBlockedMs: 5 * 3600 * 1000, // 5h of blocked time recorded somehow
      },
    ];

    const { result } = renderHook(() => useFlowMetrics(anomalousTask));

    expect(result.current.flowEfficiency).toBe(0);
    expect(result.current.formattedFlowEfficiency).toBe('0%');
  });

  it('counts active blocked tasks from allBoardTasks parameter', () => {
    const completedTasks: TaskModel[] = [
      { id: 'c1', title: 'Done 1', column: 'done', createdAt: '2026-09-01T00:00:00Z', completedAt: '2026-09-02T00:00:00Z' }
    ];

    const allTasks: TaskModel[] = [
      ...completedTasks,
      { id: 'b1', title: 'In Progress Blocked', column: 'in_progress', createdAt: '2026-09-01T00:00:00Z', blocked: true },
      { id: 'b2', title: 'Todo Blocked', column: 'todo', createdAt: '2026-09-01T00:00:00Z', blocked: true },
      { id: 'ok', title: 'Todo Normal', column: 'todo', createdAt: '2026-09-01T00:00:00Z', blocked: false },
    ];

    const { result } = renderHook(() => useFlowMetrics(completedTasks, allTasks));

    expect(result.current.blockedCount).toBe(2);
  });
});

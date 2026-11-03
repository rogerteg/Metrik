import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDynamicSle } from '../../src/hooks/useDynamicSle';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

describe('useDynamicSle Hook (Feature 054)', () => {
  const boardId = 'board-alpha';
  const baseTime = new Date('2026-10-01T10:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const mockColumns: ColumnModel[] = [
    { id: 'c-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'c-wip',
      title: 'Em Progresso',
      category: 'in_progress',
      wipLimit: null,
      colorScheme: 'progress',
    },
    {
      id: 'c-done',
      title: 'Concluído',
      category: 'done',
      wipLimit: null,
      colorScheme: 'completed',
    },
  ];

  const createCompletedTasks = (count: number): TaskModel[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `done-${i}`,
      title: `Done Task ${i}`,
      column: 'c-done',
      createdAt: new Date(baseTime).toISOString(),
      startedAt: new Date(baseTime).toISOString(),
      completedAt: new Date(baseTime + (i + 1) * dayMs).toISOString(),
    }));

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with default config and insufficient data when fewer than 5 completed tasks', () => {
    const tasks: TaskModel[] = [
      {
        id: 'active-1',
        title: 'Active Task 1',
        column: 'c-wip',
        createdAt: new Date(baseTime).toISOString(),
      },
    ];

    const { result } = renderHook(() => useDynamicSle(boardId, tasks, mockColumns));

    expect(result.current.config.boardId).toBe(boardId);
    expect(result.current.config.customTargetDays).toBeNull();
    expect(result.current.thresholds.isStatisticallySignificant).toBe(false);
    expect(result.current.predictions['active-1']?.riskLevel).toBe('insufficient_data');
    expect(result.current.riskCount).toBe(0);
  });

  it('computes thresholds and predicts risk for active tasks when history >= 5 items', () => {
    const completed = createCompletedTasks(6); // cycle times: 1..6 days (P50 ~ 3.5d, P85 ~ 5.3d)
    const now = new Date(baseTime + 20 * dayMs);

    const activeTasks: TaskModel[] = [
      // Normal: 1 day in progress (< P50)
      {
        id: 't-normal',
        title: 'Normal Task',
        column: 'c-wip',
        createdAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
        startedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
      },
      // Warning P50: 4 days in progress (P50 <= 4 < P85)
      {
        id: 't-warning',
        title: 'Warning Task',
        column: 'c-wip',
        createdAt: new Date(now.getTime() - 4 * dayMs).toISOString(),
        startedAt: new Date(now.getTime() - 4 * dayMs).toISOString(),
      },
    ];

    const allTasks = [...completed, ...activeTasks];
    const { result } = renderHook(() => useDynamicSle(boardId, allTasks, mockColumns, 0, now));

    expect(result.current.thresholds.isStatisticallySignificant).toBe(true);
    expect(result.current.predictions['t-normal']?.riskLevel).toBe('normal');
    expect(result.current.predictions['t-warning']?.riskLevel).toBe('warning_p50');
    expect(result.current.riskCount).toBe(1);
  });

  it('updates configuration and persists changes in localStorage', () => {
    const completed = createCompletedTasks(6);
    const { result } = renderHook(() => useDynamicSle(boardId, completed, mockColumns));

    act(() => {
      result.current.updateConfig({ customTargetDays: 3.5, enableP50Alert: false });
    });

    expect(result.current.config.customTargetDays).toBe(3.5);
    expect(result.current.config.enableP50Alert).toBe(false);

    // Verify localStorage persistence
    const saved = JSON.parse(localStorage.getItem(`metrik_sle_config_${boardId}`) || '{}');
    expect(saved.customTargetDays).toBe(3.5);
    expect(saved.enableP50Alert).toBe(false);
  });

  it('resets configuration back to defaults via resetConfig', () => {
    const completed = createCompletedTasks(6);
    const { result } = renderHook(() => useDynamicSle(boardId, completed, mockColumns));

    act(() => {
      result.current.updateConfig({ customTargetDays: 10 });
    });
    expect(result.current.config.customTargetDays).toBe(10);

    act(() => {
      result.current.resetConfig();
    });
    expect(result.current.config.customTargetDays).toBeNull();
  });
});

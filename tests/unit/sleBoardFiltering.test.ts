import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardFilters } from '../../src/hooks/useBoardFilters';
import { BoardState, TaskModel } from '../../src/types/kanban';
import { CardSlePrediction } from '../../src/types/sle';

describe('SLE Board Filtering (Feature 054 - User Story 3)', () => {
  const mockTasks: TaskModel[] = [
    { id: 't-healthy', title: 'Healthy Task', column: 'c-wip', createdAt: '2026-10-01T00:00:00Z' },
    { id: 't-warning', title: 'Warning Task', column: 'c-wip', createdAt: '2026-10-01T00:00:00Z' },
    { id: 't-risk', title: 'Risk Task', column: 'c-wip', createdAt: '2026-10-01T00:00:00Z' },
    {
      id: 't-critical',
      title: 'Critical Task',
      column: 'c-wip',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ];

  const mockBoard: BoardState = {
    columns: [
      {
        id: 'c-wip',
        title: 'Em Andamento',
        category: 'in_progress',
        wipLimit: null,
        colorScheme: 'progress',
      },
    ],
    tasks: {
      'c-wip': mockTasks,
    },
  };

  const mockPredictions: Record<string, CardSlePrediction> = {
    't-healthy': {
      taskId: 't-healthy',
      agingDays: 1.0,
      thresholds: {
        p50Days: 2,
        p85Days: 5,
        p95Days: 8,
        sampleSize: 10,
        isStatisticallySignificant: true,
      },
      effectiveTargetDays: 5,
      riskLevel: 'normal',
      daysToBreach: 4.0,
      percentageOfTarget: 20,
      label: 'No ritmo histórico',
    },
    't-warning': {
      taskId: 't-warning',
      agingDays: 3.0,
      thresholds: {
        p50Days: 2,
        p85Days: 5,
        p95Days: 8,
        sampleSize: 10,
        isStatisticallySignificant: true,
      },
      effectiveTargetDays: 5,
      riskLevel: 'warning_p50',
      daysToBreach: 2.0,
      percentageOfTarget: 60,
      label: 'Atenção (P50)',
    },
    't-risk': {
      taskId: 't-risk',
      agingDays: 6.0,
      thresholds: {
        p50Days: 2,
        p85Days: 5,
        p95Days: 8,
        sampleSize: 10,
        isStatisticallySignificant: true,
      },
      effectiveTargetDays: 5,
      riskLevel: 'risk_p85',
      daysToBreach: -1.0,
      percentageOfTarget: 120,
      label: 'Risco SLE (P85)',
    },
    't-critical': {
      taskId: 't-critical',
      agingDays: 9.0,
      thresholds: {
        p50Days: 2,
        p85Days: 5,
        p95Days: 8,
        sampleSize: 10,
        isStatisticallySignificant: true,
      },
      effectiveTargetDays: 5,
      riskLevel: 'critical_p95',
      daysToBreach: -4.0,
      percentageOfTarget: 180,
      label: 'Crítico (P95)',
    },
  };

  it('correctly calculates sleRiskCount from active predictions', () => {
    const { result } = renderHook(() => useBoardFilters(mockBoard, mockPredictions));
    // t-warning, t-risk, t-critical = 3
    expect(result.current.sleRiskCount).toBe(3);
  });

  it('filters board tasks to only show cards in SLE risk when onlySleRisk is enabled', () => {
    const { result } = renderHook(() => useBoardFilters(mockBoard, mockPredictions));

    expect(result.current.filteredBoard.tasks['c-wip']).toHaveLength(4);

    // Toggle onlySleRisk ON
    act(() => {
      result.current.toggleOnlySleRisk?.();
    });

    expect(result.current.filters.onlySleRisk).toBe(true);
    expect(result.current.hasActiveFilters).toBe(true);

    const filtered = result.current.filteredBoard.tasks['c-wip'];
    expect(filtered).toHaveLength(3);
    expect(filtered.map((t) => t.id)).toEqual(['t-warning', 't-risk', 't-critical']);
    expect(filtered.some((t) => t.id === 't-healthy')).toBe(false);

    // Toggle onlySleRisk OFF
    act(() => {
      result.current.toggleOnlySleRisk?.();
    });

    expect(result.current.filters.onlySleRisk).toBe(false);
    expect(result.current.filteredBoard.tasks['c-wip']).toHaveLength(4);
  });
});

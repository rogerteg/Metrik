import { describe, it, expect } from 'vitest';
import { calculateBlockerClusters } from '../../src/utils/blockerAnalytics';
import { TaskModel } from '../../src/types/kanban';

describe('blockerAnalytics utility (Feature 030)', () => {
  const dayMs = 24 * 60 * 60 * 1000;

  it('returns empty summary when there are no tasks or no blocked tasks', () => {
    const summary = calculateBlockerClusters([]);
    expect(summary.totalBlockedTasks).toBe(0);
    expect(summary.accumulatedBlockedMs).toBe(0);
    expect(summary.impactOnLeadTimePercentage).toBe(0);
    expect(summary.clusters).toEqual([]);
  });

  it('clusters tasks by blocker reason and calculates aggregated metrics', () => {
    const tasks: TaskModel[] = [
      {
        id: 't1',
        title: 'Task 1',
        column: 'done',
        createdAt: '2026-09-01T00:00:00Z',
        completedAt: '2026-09-05T00:00:00Z', // 4 days lead time = 345,600,000 ms
        blocked: false,
        blockedReason: 'Dependência Externa',
        totalBlockedMs: 2 * dayMs,
      },
      {
        id: 't2',
        title: 'Task 2',
        column: 'in_progress',
        createdAt: '2026-09-01T00:00:00Z',
        blocked: true,
        blockedReason: 'Dependência Externa',
        totalBlockedMs: 1 * dayMs,
      },
      {
        id: 't3',
        title: 'Task 3',
        column: 'in_progress',
        createdAt: '2026-09-01T00:00:00Z',
        blocked: true,
        blockedReason: 'Aprovação de Segurança',
        totalBlockedMs: 3 * dayMs,
      },
      {
        id: 't4',
        title: 'Task 4 (unblocked)',
        column: 'done',
        createdAt: '2026-09-01T00:00:00Z',
        completedAt: '2026-09-03T00:00:00Z',
        blocked: false,
      },
    ];

    const summary = calculateBlockerClusters(tasks);

    expect(summary.totalBlockedTasks).toBe(3);
    expect(summary.accumulatedBlockedMs).toBe(6 * dayMs);
    expect(summary.clusters.length).toBe(2);

    // Primary cluster: 'Dependência Externa' has 2 occurrences
    const topCluster = summary.clusters[0];
    expect(topCluster.reason).toBe('Dependência Externa');
    expect(topCluster.occurrenceCount).toBe(2);
    expect(topCluster.totalDurationMs).toBe(3 * dayMs);
    expect(topCluster.avgDurationDays).toBe(1.5);
    expect(topCluster.percentage).toBeCloseTo(66.7, 1);

    // Second cluster: 'Aprovação de Segurança'
    const secCluster = summary.clusters[1];
    expect(secCluster.reason).toBe('Aprovação de Segurança');
    expect(secCluster.occurrenceCount).toBe(1);
    expect(secCluster.totalDurationMs).toBe(3 * dayMs);
  });

  it('normalizes empty or missing blocker reason gracefully', () => {
    const tasks: TaskModel[] = [
      {
        id: 't1',
        title: 'Task without reason',
        column: 'in_progress',
        createdAt: '2026-09-01T00:00:00Z',
        blocked: true,
        totalBlockedMs: 1 * dayMs,
      },
    ];

    const summary = calculateBlockerClusters(tasks);
    expect(summary.clusters.length).toBe(1);
    expect(summary.clusters[0].reason).toBe('Motivo não especificado');
  });
});

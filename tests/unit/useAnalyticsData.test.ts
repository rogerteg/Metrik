import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalyticsData } from '../../src/hooks/useAnalyticsData';
import { TaskModel } from '../../src/types/kanban';

describe('useAnalyticsData Hook', () => {
  beforeEach(() => {
    // Fix system time to a known date: 2026-09-10T12:00:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates a 14-day window filled with zeros for empty tasks', () => {
    const { result } = renderHook(() => useAnalyticsData([]));
    
    expect(result.current.throughput).toHaveLength(14);
    
    // Day 0 should be 13 days ago: Aug 28 (31 days in Aug) -> 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    expect(result.current.throughput[0].date).toBe('2026-08-28');
    expect(result.current.throughput[13].date).toBe('2026-09-10');
    
    result.current.throughput.forEach(tp => {
      expect(tp.count).toBe(0);
    });

    expect(result.current.scatter).toHaveLength(0);
    expect(result.current.maxThroughput).toBe(1);
    expect(result.current.maxLeadTime).toBe(1);
  });

  it('correctly maps completed tasks to throughput and scatter series', () => {
    const completedTasks: TaskModel[] = [
      {
        id: '1',
        title: 'Task 1',
        column: 'done',
        createdAt: '2026-09-01T10:00:00Z',
        completedAt: '2026-09-05T15:00:00Z', // Lead time: ~4.2 days
      },
      {
        id: '2',
        title: 'Task 2',
        column: 'done',
        createdAt: '2026-09-04T10:00:00Z',
        completedAt: '2026-09-05T16:00:00Z', // Same day, Lead time: ~1.25 days
      },
      {
        id: '3',
        title: 'Task 3',
        column: 'done',
        createdAt: '2026-09-08T10:00:00Z',
        completedAt: '2026-09-09T10:00:00Z', // Lead time: 1 day
      },
      {
        id: '4', // Outside the 14 day window (completed in Jan)
        title: 'Task 4',
        column: 'done',
        createdAt: '2026-01-01T10:00:00Z',
        completedAt: '2026-01-05T10:00:00Z',
      }
    ];

    const { result } = renderHook(() => useAnalyticsData(completedTasks));

    // Throughput assertions
    const sep5 = result.current.throughput.find(t => t.date === '2026-09-05');
    const sep9 = result.current.throughput.find(t => t.date === '2026-09-09');
    
    expect(sep5?.count).toBe(2);
    expect(sep9?.count).toBe(1);
    
    // Scatter assertions
    expect(result.current.scatter).toHaveLength(3); // Task 4 is ignored
    
    const scatterTask1 = result.current.scatter.find(s => s.id === '1');
    expect(scatterTask1?.completedAt).toBe('2026-09-05');
    expect(scatterTask1?.leadTimeDays).toBeGreaterThan(4);
    expect(scatterTask1?.leadTimeDays).toBeLessThan(5);

    // Max values
    expect(result.current.maxThroughput).toBe(2);
    expect(result.current.maxLeadTime).toBe(scatterTask1?.leadTimeDays); 
  });
});

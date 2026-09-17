import { describe, it, expect } from 'vitest';
import { calculateSleMetrics } from '../../src/utils/sleCalculator';
import { TaskModel } from '../../src/types/kanban';

describe('sleCalculator utility (Feature 030)', () => {
  const baseDate = new Date('2026-09-01T10:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const createMockTask = (id: string, cycleDays: number): TaskModel => ({
    id,
    title: `Task ${id}`,
    column: 'done',
    createdAt: new Date(baseDate).toISOString(),
    startedAt: new Date(baseDate).toISOString(),
    completedAt: new Date(baseDate + cycleDays * dayMs).toISOString(),
  });

  it('returns safe default values when task array is empty (zero-divide guard)', () => {
    const result = calculateSleMetrics([], 85);
    expect(result.targetPercentile).toBe(85);
    expect(result.observedDays).toBe(0);
    expect(result.complianceRate).toBe(100);
    expect(result.sampleSize).toBe(0);
    expect(result.calculatedAt).toBeDefined();
  });

  it('calculates observed SLE days for target percentile (85th percentile)', () => {
    // 10 tasks with cycle times: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 days
    const tasks: TaskModel[] = Array.from({ length: 10 }, (_, i) =>
      createMockTask(`t-${i + 1}`, i + 1)
    );

    const result = calculateSleMetrics(tasks, 85);
    expect(result.sampleSize).toBe(10);
    expect(result.targetPercentile).toBe(85);
    // P85 of 1..10 is approx 8.65 -> 8.7 days
    expect(result.observedDays).toBeGreaterThanOrEqual(8);
    expect(result.observedDays).toBeLessThanOrEqual(9);
  });

  it('calculates compliance rate against targetDays when provided', () => {
    // Tasks: 2, 4, 6, 8, 10 days
    const tasks: TaskModel[] = [2, 4, 6, 8, 10].map((days, idx) =>
      createMockTask(`t-${idx}`, days)
    );

    // If target is 6 days, tasks with 2, 4, 6 are compliant (3/5 = 60%)
    const result = calculateSleMetrics(tasks, 85, 6);
    expect(result.targetDays).toBe(6);
    expect(result.complianceRate).toBe(60);
  });

  it('handles single completed task correctly', () => {
    const task = createMockTask('t-single', 3.5);
    const result = calculateSleMetrics([task], 85);

    expect(result.sampleSize).toBe(1);
    expect(result.observedDays).toBe(3.5);
    expect(result.complianceRate).toBe(100);
  });
});

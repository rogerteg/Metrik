import { describe, it, expect } from 'vitest';
import { TaskModel } from '../../src/types/kanban';
import {
  extractThroughputSeries,
  calculateThroughputPercentiles,
  calculateThroughputHistogram,
  calculateThroughputSummary,
} from '../../src/utils/throughputMetrics';

describe('Throughput Metrics & Analytics (Feature 021)', () => {
  const baseTask: TaskModel = {
    id: '1',
    title: 'Task 1',
    column: 'col-done',
    createdAt: '2026-09-01T10:00:00.000Z',
    completedAt: '2026-09-05T15:00:00.000Z',
  };

  describe('extractThroughputSeries', () => {
    it('returns empty array when tasks are empty and window is 0', () => {
      const series = extractThroughputSeries([], 0);
      expect(series).toEqual([]);
    });

    it('strictly fills empty days with count: 0 across calendar days', () => {
      const refDate = new Date('2026-09-07T12:00:00.000Z');
      const tasks: TaskModel[] = [
        { ...baseTask, id: 't1', completedAt: '2026-09-05T10:00:00.000Z' },
        { ...baseTask, id: 't2', completedAt: '2026-09-05T14:00:00.000Z' },
        { ...baseTask, id: 't3', completedAt: '2026-09-07T09:00:00.000Z' },
      ];

      // Janela de 4 dias: 04, 05, 06, 07
      const series = extractThroughputSeries(tasks, 4, refDate);
      expect(series.length).toBe(4);
      expect(series[0]).toEqual({ date: '2026-09-04', count: 0 });
      expect(series[1]).toEqual({ date: '2026-09-05', count: 2 });
      expect(series[2]).toEqual({ date: '2026-09-06', count: 0 });
      expect(series[3]).toEqual({ date: '2026-09-07', count: 1 });
    });
  });

  describe('calculateThroughputPercentiles', () => {
    it('handles empty or zero-filled data gracefully', () => {
      const res = calculateThroughputPercentiles([]);
      expect(res).toEqual({ p50: 0, p70: 0, p85: 0, p95: 0 });
    });

    it('calculates NIST percentiles for daily throughput distribution', () => {
      // 10 dias com vazões: [0, 0, 0, 1, 1, 2, 2, 3, 4, 5]
      const counts = [0, 0, 0, 1, 1, 2, 2, 3, 4, 5];
      const res = calculateThroughputPercentiles(counts);
      expect(res.p50).toBeGreaterThanOrEqual(1);
      expect(res.p85).toBeGreaterThanOrEqual(res.p50);
      expect(res.p95).toBeGreaterThanOrEqual(res.p85);
    });
  });

  describe('calculateThroughputHistogram', () => {
    it('creates continuous bins from 0 to max daily count', () => {
      const dailyPoints = [
        { date: '2026-09-01', count: 0 },
        { date: '2026-09-02', count: 0 },
        { date: '2026-09-03', count: 2 },
        { date: '2026-09-04', count: 0 },
      ];

      const { bins, maxFrequency, maxDailyThroughput } = calculateThroughputHistogram(dailyPoints);
      expect(maxDailyThroughput).toBe(2);
      expect(maxFrequency).toBe(3); // 3 dias com zero
      expect(bins.length).toBe(3); // baldes para 0, 1, 2
      expect(bins[0]).toEqual({ throughputValue: 0, frequencyDays: 3, percentage: 75 });
      expect(bins[1]).toEqual({ throughputValue: 1, frequencyDays: 0, percentage: 0 });
      expect(bins[2]).toEqual({ throughputValue: 2, frequencyDays: 1, percentage: 25 });
    });
  });

  describe('calculateThroughputSummary', () => {
    it('computes total, average, mode, and maxDaily accurately', () => {
      const dailyPoints = [
        { date: '2026-09-01', count: 0 },
        { date: '2026-09-02', count: 0 },
        { date: '2026-09-03', count: 1 },
        { date: '2026-09-04', count: 3 },
      ];

      const summary = calculateThroughputSummary(dailyPoints);
      expect(summary.totalCompleted).toBe(4);
      expect(summary.totalDays).toBe(4);
      expect(summary.averagePerDay).toBe(1.0);
      expect(summary.mode).toBe(0); // 0 é o valor mais frequente (2 dias)
      expect(summary.maxDaily).toBe(3);
      expect(summary.p50).toBeDefined();
      expect(summary.p85).toBeDefined();
    });
  });
});

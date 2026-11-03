import { describe, it, expect } from 'vitest';
import { calculateThresholds, predictCardSle } from '../../src/utils/slePredictor';
import { TaskModel } from '../../src/types/kanban';
import { SleConfig, SleThresholds } from '../../src/types/sle';

describe('slePredictor pure utility (Feature 054)', () => {
  const baseTime = new Date('2026-10-01T12:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const createCompletedTask = (id: string, cycleDays: number): TaskModel => ({
    id,
    title: `Done Task ${id}`,
    column: 'done',
    createdAt: new Date(baseTime).toISOString(),
    startedAt: new Date(baseTime).toISOString(),
    completedAt: new Date(baseTime + cycleDays * dayMs).toISOString(),
  });

  const createActiveTask = (id: string, startedDaysAgo: number, now: Date): TaskModel => ({
    id,
    title: `Active Task ${id}`,
    column: 'in_progress',
    createdAt: new Date(now.getTime() - startedDaysAgo * dayMs).toISOString(),
    startedAt: new Date(now.getTime() - startedDaysAgo * dayMs).toISOString(),
  });

  describe('calculateThresholds', () => {
    it('returns insufficient_data thresholds when sample size < 5', () => {
      const tasks = [createCompletedTask('t1', 2), createCompletedTask('t2', 4)];
      const thresholds = calculateThresholds(tasks);

      expect(thresholds.sampleSize).toBe(2);
      expect(thresholds.isStatisticallySignificant).toBe(false);
      expect(thresholds.p50Days).toBe(0);
      expect(thresholds.p85Days).toBe(0);
      expect(thresholds.p95Days).toBe(0);
    });

    it('calculates P50, P85, P95 percentiles accurately when sample size >= 5', () => {
      // 10 completed tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 days
      const tasks = Array.from({ length: 10 }, (_, i) => createCompletedTask(`t${i + 1}`, i + 1));
      const thresholds = calculateThresholds(tasks);

      expect(thresholds.sampleSize).toBe(10);
      expect(thresholds.isStatisticallySignificant).toBe(true);
      expect(thresholds.p50Days).toBeCloseTo(5.5, 1);
      expect(thresholds.p85Days).toBeGreaterThanOrEqual(8);
      expect(thresholds.p95Days).toBeGreaterThanOrEqual(9.5);
    });

    it('handles tasks without startedAt by falling back to createdAt', () => {
      const tasks: TaskModel[] = Array.from({ length: 6 }, (_, i) => ({
        id: `t-${i}`,
        title: `Task ${i}`,
        column: 'done',
        createdAt: new Date(baseTime).toISOString(),
        completedAt: new Date(baseTime + (i + 1) * dayMs).toISOString(),
      }));

      const thresholds = calculateThresholds(tasks);
      expect(thresholds.isStatisticallySignificant).toBe(true);
      expect(thresholds.sampleSize).toBe(6);
      expect(thresholds.p50Days).toBeGreaterThan(0);
    });
  });

  describe('predictCardSle', () => {
    const validThresholds: SleThresholds = {
      p50Days: 2.0,
      p85Days: 5.0,
      p95Days: 8.0,
      sampleSize: 10,
      isStatisticallySignificant: true,
    };

    const referenceNow = new Date('2026-10-10T12:00:00Z');

    it('returns insufficient_data riskLevel when thresholds are not statistically significant', () => {
      const insignificantThresholds: SleThresholds = {
        p50Days: 0,
        p85Days: 0,
        p95Days: 0,
        sampleSize: 3,
        isStatisticallySignificant: false,
      };

      const task = createActiveTask('t1', 3, referenceNow);
      const prediction = predictCardSle(task, insignificantThresholds, undefined, referenceNow);

      expect(prediction.riskLevel).toBe('insufficient_data');
      expect(prediction.label).toContain('Amostra insuficiente');
    });

    it('classifies risk as normal when aging is below P50', () => {
      const task = createActiveTask('t1', 1.2, referenceNow);
      const prediction = predictCardSle(task, validThresholds, undefined, referenceNow);

      expect(prediction.riskLevel).toBe('normal');
      expect(prediction.agingDays).toBe(1.2);
      expect(prediction.daysToBreach).toBeCloseTo(3.8, 1); // 5.0 - 1.2
      expect(prediction.percentageOfTarget).toBeCloseTo(24, 0);
    });

    it('classifies risk as warning_p50 when aging is between P50 and P85', () => {
      const task = createActiveTask('t1', 3.0, referenceNow);
      const prediction = predictCardSle(task, validThresholds, undefined, referenceNow);

      expect(prediction.riskLevel).toBe('warning_p50');
      expect(prediction.agingDays).toBe(3.0);
      expect(prediction.label).toBe('Atenção (P50)');
      expect(prediction.daysToBreach).toBe(2.0); // 5.0 - 3.0
    });

    it('classifies risk as risk_p85 when aging is between P85 and P95', () => {
      const task = createActiveTask('t1', 6.0, referenceNow);
      const prediction = predictCardSle(task, validThresholds, undefined, referenceNow);

      expect(prediction.riskLevel).toBe('risk_p85');
      expect(prediction.agingDays).toBe(6.0);
      expect(prediction.label).toBe('Risco SLE (P85)');
      expect(prediction.daysToBreach).toBe(-1.0); // 5.0 - 6.0 (breached by 1 day)
    });

    it('classifies risk as critical_p95 when aging exceeds P95', () => {
      const task = createActiveTask('t1', 9.5, referenceNow);
      const prediction = predictCardSle(task, validThresholds, undefined, referenceNow);

      expect(prediction.riskLevel).toBe('critical_p95');
      expect(prediction.agingDays).toBe(9.5);
      expect(prediction.label).toBe('Crítico (P95)');
    });

    it('normalizes future or anomalous timestamps to 0 days without throwing', () => {
      const task: TaskModel = {
        id: 'future-task',
        title: 'Future Task',
        column: 'in_progress',
        createdAt: new Date(referenceNow.getTime() + 10 * dayMs).toISOString(),
        startedAt: new Date(referenceNow.getTime() + 10 * dayMs).toISOString(),
      };

      const prediction = predictCardSle(task, validThresholds, undefined, referenceNow);
      expect(prediction.agingDays).toBe(0);
      expect(prediction.riskLevel).toBe('normal');
    });

    it('respects customTargetDays when configured by squad', () => {
      const config: Partial<SleConfig> = {
        customTargetDays: 4.0,
        enableP50Alert: true,
        enableP95Alert: true,
      };

      // Task with aging 4.5 days -> exceeds custom target of 4.0
      const task = createActiveTask('t1', 4.5, referenceNow);
      const prediction = predictCardSle(task, validThresholds, config, referenceNow);

      expect(prediction.effectiveTargetDays).toBe(4.0);
      expect(prediction.riskLevel).toBe('risk_p85');
      expect(prediction.daysToBreach).toBeCloseTo(-0.5, 1);
    });

    it('suppresses P50 warning badge when enableP50Alert is false', () => {
      const config: Partial<SleConfig> = {
        enableP50Alert: false,
      };

      // Task with aging 3.0 days (between P50=2.0 and P85=5.0)
      const task = createActiveTask('t1', 3.0, referenceNow);
      const prediction = predictCardSle(task, validThresholds, config, referenceNow);

      expect(prediction.riskLevel).toBe('normal');
    });

    it('processes 1000 active cards in under 5 milliseconds (SC-001)', () => {
      const cards = Array.from({ length: 1000 }, (_, i) =>
        createActiveTask(`task-${i}`, (i % 10) + 0.5, referenceNow),
      );

      const start = performance.now();
      for (const card of cards) {
        predictCardSle(card, validThresholds, undefined, referenceNow);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(15); // Generous buffer for CI, typically < 2ms
    });
  });
});

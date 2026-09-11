import { describe, it, expect } from 'vitest';
import {
  extractDailyThroughput,
  runMonteCarloHowMany,
  runMonteCarloWhen,
  buildHistogramBins,
  addDaysToDate,
} from '../../src/utils/monteCarlo';
import { TaskModel } from '../../src/types/kanban';

// Gerador pseudoaleatório determinístico Linear Congruential Generator (LCG)
function createSeededRng(seed: number = 42) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Feature 019: Monte Carlo Simulation Engine', () => {
  describe('extractDailyThroughput', () => {
    it('returns empty array if no tasks completed and daysWindow is 0', () => {
      const result = extractDailyThroughput([], 0);
      expect(result).toEqual([]);
    });

    it('accurately fills empty days with 0 count to prevent optimistic bias', () => {
      const refDate = new Date('2026-09-10T12:00:00Z');
      const mockTasks: TaskModel[] = [
        {
          id: '1',
          title: 'Task 1',
          column: 'done',
          tags: [],
          createdAt: '2026-09-01T00:00:00Z',
          completedAt: '2026-09-08T10:00:00Z',
        },
        {
          id: '2',
          title: 'Task 2',
          column: 'done',
          tags: [],
          createdAt: '2026-09-01T00:00:00Z',
          completedAt: '2026-09-08T15:00:00Z',
        },
        {
          id: '3',
          title: 'Task 3',
          column: 'done',
          tags: [],
          createdAt: '2026-09-01T00:00:00Z',
          completedAt: '2026-09-10T09:00:00Z',
        },
      ];

      // Janela de 4 dias: 07, 08, 09, 10
      const samples = extractDailyThroughput(mockTasks, 4, refDate);
      expect(samples.length).toBe(4);
      expect(samples.map((s) => s.count)).toEqual([0, 2, 0, 1]);
    });
  });

  describe('runMonteCarloHowMany (Quantos Itens?)', () => {
    it('handles empty or invalid inputs gracefully', () => {
      const res = runMonteCarloHowMany([], 10);
      expect(res.p50).toBe(0);
      expect(res.p85).toBe(0);
      expect(res.p95).toBe(0);
      expect(res.trials).toBe(0);
    });

    it('enforces the Lean invariant P95 <= P85 <= P50 for capacity forecast', () => {
      // Histórico realista: dias com 0, 1, 2, 3 entregas
      const throughputHistory = [0, 1, 0, 2, 0, 3, 1, 0, 2, 1];
      const rng = createSeededRng(12345);

      const result = runMonteCarloHowMany(throughputHistory, 14, 2000, rng);

      expect(result.trials).toBe(2000);
      expect(result.targetDays).toBe(14);
      // Invariante de entrega garantida
      expect(result.p95).toBeLessThanOrEqual(result.p85);
      expect(result.p85).toBeLessThanOrEqual(result.p50);
      expect(result.min).toBeLessThanOrEqual(result.p95);
      expect(result.p50).toBeLessThanOrEqual(result.max);
      expect(result.histogram.length).toBeGreaterThan(0);
    });

    it('calculates deterministic output when constant throughput history is provided', () => {
      const constantHistory = [2, 2, 2, 2]; // sempre entrega 2 itens/dia
      const res = runMonteCarloHowMany(constantHistory, 5, 100);

      // 5 dias a 2 itens/dia = 10 itens cravados em 100% dos ensaios
      expect(res.p50).toBe(10);
      expect(res.p85).toBe(10);
      expect(res.p95).toBe(10);
      expect(res.min).toBe(10);
      expect(res.max).toBe(10);
      expect(res.mean).toBe(10);
      expect(res.histogram.length).toBe(1);
      expect(res.histogram[0].value).toBe(10);
      expect(res.histogram[0].frequency).toBe(100);
    });
  });

  describe('runMonteCarloWhen (Quando Entregaremos?)', () => {
    it('returns empty result when total throughput is 0 to avoid infinite loop', () => {
      const zeroHistory = [0, 0, 0, 0];
      const res = runMonteCarloWhen(zeroHistory, 10);
      expect(res.trials).toBe(0);
      expect(res.p50.days).toBe(0);
    });

    it('enforces the Lean invariant P50 <= P85 <= P95 for completion timeline', () => {
      const throughputHistory = [0, 1, 0, 2, 1, 0, 3, 0];
      const rng = createSeededRng(999);
      const startDate = new Date('2026-09-11T00:00:00Z');

      const result = runMonteCarloWhen(throughputHistory, 15, startDate, 2000, rng);

      expect(result.trials).toBe(2000);
      expect(result.itemCount).toBe(15);
      // Invariante de tempo de entrega
      expect(result.p50.days).toBeLessThanOrEqual(result.p85.days);
      expect(result.p85.days).toBeLessThanOrEqual(result.p95.days);
      expect(result.minDays).toBeLessThanOrEqual(result.p50.days);
      expect(result.p95.days).toBeLessThanOrEqual(result.maxDays);

      // Validação de projeção de data de calendário
      expect(result.p50.projectedDate).toBe(addDaysToDate(startDate, result.p50.days));
      expect(result.p85.projectedDate).toBe(addDaysToDate(startDate, result.p85.days));
      expect(result.p95.projectedDate).toBe(addDaysToDate(startDate, result.p95.days));
    });

    it('matches exact duration with constant throughput', () => {
      const throughputHistory = [3, 3, 3]; // sempre 3 itens/dia
      const res = runMonteCarloWhen(throughputHistory, 12, new Date('2026-09-01T00:00:00Z'), 100);

      // 12 itens a 3 itens/dia = 4 dias exatos
      expect(res.p50.days).toBe(4);
      expect(res.p85.days).toBe(4);
      expect(res.p95.days).toBe(4);
      expect(res.p50.projectedDate).toBe('2026-09-05');
    });
  });

  describe('buildHistogramBins', () => {
    it('returns empty array when values array is empty', () => {
      expect(buildHistogramBins([], 100)).toEqual([]);
    });

    it('correctly aggregates frequencies and cumulative probabilities', () => {
      const values = [5, 5, 10, 10, 10, 15];
      const bins = buildHistogramBins(values, 6, true);

      expect(bins.length).toBe(3);
      expect(bins[0].value).toBe(5);
      expect(bins[0].frequency).toBe(2);
      expect(bins[1].value).toBe(10);
      expect(bins[1].frequency).toBe(3);
      expect(bins[2].value).toBe(15);
      expect(bins[2].frequency).toBe(1);
      expect(bins[2].cumulativeProbability).toBe(1);
    });
  });
});

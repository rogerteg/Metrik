import { describe, it, expect } from 'vitest';
import { calculatePercentile, calculateFlowPercentiles } from '../../src/utils/statistics';

describe('statistics utility (Feature 017 - T001 / T002)', () => {
  it('returns 0 for empty array', () => {
    expect(calculatePercentile([], 50)).toBe(0);
    expect(calculatePercentile([], 85)).toBe(0);
    expect(calculatePercentile([], 95)).toBe(0);

    const flow = calculateFlowPercentiles([]);
    expect(flow.count).toBe(0);
    expect(flow.p50).toBe(0);
  });

  it('returns exact value for single item array', () => {
    expect(calculatePercentile([7], 50)).toBe(7);
    expect(calculatePercentile([7], 85)).toBe(7);
    expect(calculatePercentile([7], 95)).toBe(7);

    const flow = calculateFlowPercentiles([7]);
    expect(flow.count).toBe(1);
    expect(flow.p50).toBe(7);
    expect(flow.min).toBe(7);
    expect(flow.max).toBe(7);
  });

  it('calculates median (50th percentile) accurately for odd and even samples', () => {
    // Odd: [1, 2, 3, 4, 5] -> Median is 3
    expect(calculatePercentile([1, 2, 3, 4, 5], 50)).toBe(3);

    // Even: [1, 2, 3, 4] -> Median is 2.5
    expect(calculatePercentile([1, 2, 3, 4], 50)).toBe(2.5);
  });

  it('calculates 85th and 95th percentiles with linear interpolation', () => {
    // Sample with 10 values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const sample = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const flow = calculateFlowPercentiles(sample);

    expect(flow.count).toBe(10);
    expect(flow.min).toBe(1);
    expect(flow.max).toBe(10);
    expect(flow.p50).toBe(5.5);
    // 85th percentile: index = 0.85 * 9 = 7.65 -> sorted[7] + 0.65 * (sorted[8] - sorted[7]) = 8 + 0.65*(9 - 8) = 8.65 -> 8.7 (or 8.6)
    expect(flow.p85).toBeGreaterThanOrEqual(8.6);
    expect(flow.p85).toBeLessThanOrEqual(8.7);

    // 95th percentile: index = 0.95 * 9 = 8.55 -> sorted[8] + 0.55 * (sorted[9] - sorted[8]) = 9 + 0.55*(10 - 9) = 9.55 -> 9.6 (or 9.5)
    expect(flow.p95).toBeGreaterThanOrEqual(9.5);
    expect(flow.p95).toBeLessThanOrEqual(9.6);
  });

  it('handles unsorted input without modifying original array', () => {
    const unsorted = [10, 2, 8, 4, 6];
    const p50 = calculatePercentile(unsorted, 50);

    expect(p50).toBe(6);
    expect(unsorted).toEqual([10, 2, 8, 4, 6]);
  });
});

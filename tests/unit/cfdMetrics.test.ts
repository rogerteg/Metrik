import { describe, it, expect } from 'vitest';
import { calculateHorizontalLeadTime, detectQueueExpansion, getPointValue } from '../../src/utils/cfdMetrics';
import { CfdDataPoint } from '../../src/types/analytics';

describe('cfdMetrics utility functions', () => {
  const samplePoints: CfdDataPoint[] = [
    {
      date: '2026-09-01',
      todo: 5,
      inProgress: 2,
      done: 0,
      total: 7,
      cumulativeStarted: 2,
      cumulativeDone: 0,
    },
    {
      date: '2026-09-05',
      todo: 3,
      inProgress: 4,
      done: 2,
      total: 9,
      cumulativeStarted: 6,
      cumulativeDone: 2, // 2 itens foram concluídos neste dia
    },
    {
      date: '2026-09-10',
      todo: 2,
      inProgress: 6,
      done: 5,
      total: 13,
      cumulativeStarted: 11,
      cumulativeDone: 5,
    },
  ];

  it('correctly calculates horizontal lead time between arrival and departure curves', () => {
    // No dia 2026-09-05, cumulativeDone é 2.
    // A curva de chegada cumulativeStarted atingiu 2 já no dia 2026-09-01 (4 dias antes).
    const leadTime = calculateHorizontalLeadTime(samplePoints, 1, 'cumulativeStarted', 'cumulativeDone');
    expect(leadTime).toBe(4);
  });

  it('returns 0 for empty data or non-positive departure', () => {
    expect(calculateHorizontalLeadTime([], 0, 'cumulativeStarted', 'cumulativeDone')).toBe(0);
    expect(calculateHorizontalLeadTime(samplePoints, 0, 'cumulativeStarted', 'cumulativeDone')).toBe(0);
  });

  it('detects queue expansion when recent thickness is significantly larger', () => {
    const expandingPoints: CfdDataPoint[] = [
      { date: '2026-09-01', todo: 1, inProgress: 1, done: 0, total: 2, cumulativeStarted: 1, cumulativeDone: 0 },
      { date: '2026-09-02', todo: 1, inProgress: 1, done: 0, total: 2, cumulativeStarted: 1, cumulativeDone: 0 },
      { date: '2026-09-03', todo: 1, inProgress: 4, done: 0, total: 5, cumulativeStarted: 4, cumulativeDone: 0 },
      { date: '2026-09-04', todo: 1, inProgress: 6, done: 0, total: 7, cumulativeStarted: 6, cumulativeDone: 0 },
    ];

    const isExpanding = detectQueueExpansion(expandingPoints, 'cumulativeStarted', 'cumulativeDone');
    expect(isExpanding).toBe(true);
  });

  it('getPointValue extracts both fixed and dynamic stage values', () => {
    const dynamicPoint: CfdDataPoint = {
      date: '2026-09-01',
      todo: 0,
      inProgress: 0,
      done: 0,
      total: 10,
      cumulativeStarted: 5,
      cumulativeDone: 2,
      cumulativeStages: {
        'col-review': 8,
      },
    };

    expect(getPointValue(dynamicPoint, 'total')).toBe(10);
    expect(getPointValue(dynamicPoint, 'cumulativeStarted')).toBe(5);
    expect(getPointValue(dynamicPoint, 'col-review')).toBe(8);
    expect(getPointValue(dynamicPoint, 'non-existent')).toBe(0);
  });
});

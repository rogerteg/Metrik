import { describe, it, expect } from 'vitest';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
} from '../../src/utils/timeFormatters';
import { ColumnType, TaskModel } from '../../src/types/kanban';

describe('timeFormatters Utility (T003 - Red-Bar First)', () => {
  const baseTask: TaskModel = {
    id: 'test-task',
    title: 'Tarefa Teste',
    column: ColumnType.COMPLETED,
    createdAt: '2026-09-08T10:00:00.000Z',
    startedAt: '2026-09-08T10:15:00.000Z',
    completedAt: '2026-09-08T11:00:00.000Z',
  };

  it('calculates lead time in milliseconds correctly', () => {
    // 10:00 to 11:00 = 60 minutes = 3,600,000 ms
    const leadTimeMs = calculateLeadTimeMs(baseTask);
    expect(leadTimeMs).toBe(3600000);
  });

  it('calculates cycle time in milliseconds correctly', () => {
    // 10:15 to 11:00 = 45 minutes = 2,700,000 ms
    const cycleTimeMs = calculateCycleTimeMs(baseTask);
    expect(cycleTimeMs).toBe(2700000);
  });

  it('falls back to createdAt when startedAt is missing for cycle time calculation', () => {
    const taskWithoutStart: TaskModel = {
      ...baseTask,
      startedAt: undefined,
    };

    const cycleTimeMs = calculateCycleTimeMs(taskWithoutStart);
    expect(cycleTimeMs).toBe(3600000);
  });

  it('returns null if completedAt is missing', () => {
    const incompleteTask: TaskModel = {
      ...baseTask,
      column: ColumnType.IN_PROGRESS,
      completedAt: undefined,
    };

    expect(calculateLeadTimeMs(incompleteTask)).toBeNull();
    expect(calculateCycleTimeMs(incompleteTask)).toBeNull();
  });

  it('formats durations correctly across minutes, hours, days', () => {
    // Under 1 minute
    expect(formatDuration(30000)).toBe('< 1m');

    // Exactly minutes
    expect(formatDuration(45 * 60 * 1000)).toBe('45m');

    // Hours and minutes
    expect(formatDuration((2 * 60 + 15) * 60 * 1000)).toBe('2h 15m');

    // Exactly hours (no extra minutes)
    expect(formatDuration(2 * 60 * 60 * 1000)).toBe('2h 00m');

    // Days and hours
    expect(formatDuration((3 * 24 + 4) * 3600 * 1000)).toBe('3d 4h');

    // Null or invalid
    expect(formatDuration(null)).toBe('-');
  });
});

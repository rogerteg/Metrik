import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
  getDueDateStatus,
  formatDateShort,
  calculateTaskBlockedTimeMs,
  formatBlockedTime
} from '../../src/utils/timeFormatters';
import { TaskModel } from '../../src/types/kanban';

describe('timeFormatters Utility (T003 - Red-Bar First)', () => {
  const baseTask: TaskModel = {
    id: 'test-task',
    title: 'Tarefa Teste',
    column: 'completed',
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
      column: 'in-progress',
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

  describe('getDueDateStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set system time to 2026-09-09T10:00:00.000Z
      vi.setSystemTime(new Date(2026, 8, 9, 10, 0, 0)); // Month is 0-indexed, so 8 = Sep
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "completed" if task is marked complete', () => {
      expect(getDueDateStatus('2026-09-08', true)).toBe('completed');
    });

    it('returns "overdue" if date is in the past', () => {
      // 2026-09-08 < 2026-09-09
      expect(getDueDateStatus('2026-09-08', false)).toBe('overdue');
    });

    it('returns "warning" if date is today', () => {
      expect(getDueDateStatus('2026-09-09', false)).toBe('warning');
    });

    it('returns "warning" if date is tomorrow', () => {
      expect(getDueDateStatus('2026-09-10', false)).toBe('warning');
    });

    it('returns "normal" if date is the day after tomorrow or later', () => {
      expect(getDueDateStatus('2026-09-11', false)).toBe('normal');
      expect(getDueDateStatus('2026-10-09', false)).toBe('normal');
    });
  });

  describe('formatDateShort', () => {
    it('formats YYYY-MM-DD into a short human-readable string', () => {
      // Because we use toLocaleDateString('pt-BR'), '2026-09-09' -> '9 de set' or similar
      const formatted = formatDateShort('2026-09-09');
      // The exact output might vary slightly depending on Node's ICU data,
      // but typically it's something like "9 de set" or "9 set".
      // We'll just verify it contains the day and part of the month name or number.
      expect(formatted).toMatch(/9/);
    });
  });

  describe('Blocked Time Calculations (Feature 012)', () => {
    it('returns accumulated blocked time when task is currently unblocked', () => {
      const task: TaskModel = {
        ...baseTask,
        blocked: false,
        totalBlockedMs: 120000, // 2 minutes
      };

      expect(calculateTaskBlockedTimeMs(task)).toBe(120000);
      expect(formatBlockedTime(120000)).toBe('2m');
    });

    it('returns 0 when task has never been blocked', () => {
      const task: TaskModel = {
        ...baseTask,
      };

      expect(calculateTaskBlockedTimeMs(task)).toBe(0);
      expect(formatBlockedTime(0)).toBe('< 1m');
    });

    it('adds currently elapsed time when task is currently blocked', () => {
      const blockedAt = new Date('2026-09-08T10:00:00.000Z').toISOString();
      const task: TaskModel = {
        ...baseTask,
        blocked: true,
        blockedAt,
        totalBlockedMs: 60000, // already had 1 min from previous block
      };

      // 15 minutes later
      const nowMs = new Date('2026-09-08T10:15:00.000Z').getTime();
      const total = calculateTaskBlockedTimeMs(task, nowMs);

      // 60000 + 15 * 60 * 1000 = 60000 + 900000 = 960000 ms (16m)
      expect(total).toBe(960000);
      expect(formatBlockedTime(total)).toBe('16m');
    });
  });
});


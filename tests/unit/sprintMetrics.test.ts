import { describe, it, expect } from 'vitest';
import {
  normalizeSprintName,
  isValidSprintName,
  isValidSprintRange,
  getSprintTasks,
  calculateSprintProgress,
  getActiveSprint,
  isSprintOverdue,
  orderSprints,
} from '../../src/utils/sprintMetrics';
import { SprintModel, TaskModel } from '../../src/types/kanban';

/**
 * Feature 038 — domínio puro do Planejamento de Sprints.
 */
const sprint = (over: Partial<SprintModel> = {}): SprintModel => ({
  id: 'sp1',
  name: 'Sprint 1',
  status: 'planned',
  createdAt: '2026-09-01T00:00:00.000Z',
  ...over,
});

const task = (over: Partial<TaskModel> = {}): TaskModel => ({
  id: 't1',
  title: 'Tarefa',
  column: 'todo',
  createdAt: '2026-09-01T00:00:00.000Z',
  ...over,
});

describe('sprintMetrics (Feature 038)', () => {
  describe('normalizeSprintName / isValidSprintName (FR-012)', () => {
    it('trims and caps the name', () => {
      expect(normalizeSprintName('  Sprint 1  ')).toBe('Sprint 1');
      expect(normalizeSprintName(undefined)).toBe('');
    });

    it('rejects empty or whitespace-only names', () => {
      expect(isValidSprintName('')).toBe(false);
      expect(isValidSprintName('   ')).toBe(false);
      expect(isValidSprintName(null)).toBe(false);
      expect(isValidSprintName('Sprint')).toBe(true);
    });
  });

  describe('isValidSprintRange (FR-012)', () => {
    it('accepts a missing window', () => {
      expect(isValidSprintRange(undefined, undefined)).toBe(true);
      expect(isValidSprintRange('2026-09-01', undefined)).toBe(true);
    });

    it('accepts end equal to or after start', () => {
      expect(isValidSprintRange('2026-09-01', '2026-09-14')).toBe(true);
      expect(isValidSprintRange('2026-09-14', '2026-09-14')).toBe(true);
    });

    it('rejects end before start', () => {
      expect(isValidSprintRange('2026-09-14', '2026-09-01')).toBe(false);
    });

    it('rejects malformed dates', () => {
      expect(isValidSprintRange('not-a-date', '2026-09-14')).toBe(false);
    });
  });

  describe('getSprintTasks / calculateSprintProgress (FR-007, FR-008)', () => {
    it('filters tasks by sprint id', () => {
      const tasks = [
        task({ id: 'a', sprintId: 'sp1' }),
        task({ id: 'b', sprintId: 'sp2' }),
        task({ id: 'c' }),
      ];
      expect(getSprintTasks('sp1', tasks).map((t) => t.id)).toEqual(['a']);
    });

    it('returns 0/0 and 0% for an empty sprint (no division by zero)', () => {
      expect(calculateSprintProgress([])).toEqual({
        total: 0,
        completed: 0,
        percentage: 0,
        velocity: 0,
      });
    });

    it('computes completed/total, percentage and velocity', () => {
      const tasks = [
        task({ id: 'a', completedAt: '2026-09-05T00:00:00.000Z' }),
        task({ id: 'b' }),
        task({ id: 'c' }),
        task({ id: 'd' }),
      ];
      expect(calculateSprintProgress(tasks)).toEqual({
        total: 4,
        completed: 1,
        percentage: 25,
        velocity: 1,
      });
    });
  });

  describe('getActiveSprint (FR-003)', () => {
    it('resolves the active sprint by id', () => {
      const sprints = [sprint({ id: 'a' }), sprint({ id: 'b', status: 'active' })];
      expect(getActiveSprint(sprints, 'b')?.id).toBe('b');
    });

    it('returns undefined for missing id, null or orphan reference', () => {
      expect(getActiveSprint([], 'b')).toBeUndefined();
      expect(getActiveSprint([sprint()], null)).toBeUndefined();
      expect(getActiveSprint([sprint({ id: 'a' })], 'ghost')).toBeUndefined();
    });
  });

  describe('isSprintOverdue', () => {
    const now = new Date('2026-09-20T00:00:00.000Z').getTime();
    it('is true when past end date and not completed', () => {
      expect(isSprintOverdue(sprint({ endDate: '2026-09-14' }), now)).toBe(true);
    });
    it('is false without end date, when completed, or before end', () => {
      expect(isSprintOverdue(sprint({ endDate: undefined }), now)).toBe(false);
      expect(isSprintOverdue(sprint({ endDate: '2026-09-14', status: 'completed' }), now)).toBe(
        false,
      );
      expect(isSprintOverdue(sprint({ endDate: '2026-09-30' }), now)).toBe(false);
    });
  });

  describe('orderSprints', () => {
    it('places active first, then planned, then completed', () => {
      const sprints = [
        sprint({ id: 'c', status: 'completed' }),
        sprint({ id: 'p', status: 'planned' }),
        sprint({ id: 'a', status: 'active' }),
      ];
      expect(orderSprints(sprints).map((s) => s.id)).toEqual(['a', 'p', 'c']);
    });
  });
});

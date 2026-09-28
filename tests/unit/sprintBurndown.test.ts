import { describe, it, expect } from 'vitest';
import { buildSprintBurndown, buildSprintBurnup } from '../../src/utils/sprintBurndown';
import { SprintModel, TaskModel } from '../../src/types/kanban';

/** Feature 039 — burndown derivado (sem snapshots). */
const sprint = (over: Partial<SprintModel> = {}): SprintModel => ({
  id: 'sp1',
  name: 'Sprint 1',
  status: 'active',
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

describe('buildSprintBurndown (Feature 039)', () => {
  it('is unavailable without a valid date window (FR-004)', () => {
    const result = buildSprintBurndown(sprint(), [task({ sprintId: 'sp1' })]);
    expect(result.available).toBe(false);
    expect(result.points).toEqual([]);
    expect(result.committed).toBe(1);
  });

  it('is unavailable when end is before start', () => {
    const result = buildSprintBurndown(
      sprint({ startDate: '2026-09-10', endDate: '2026-09-01' }),
      [],
    );
    expect(result.available).toBe(false);
  });

  it('produces a linear ideal from committed to 0 and daily remaining', () => {
    const now = new Date('2026-09-11T12:00:00').getTime();
    const tasks = [
      task({
        id: 'a',
        sprintId: 'sp1',
        createdAt: '2026-09-01T08:00:00',
        completedAt: '2026-09-03T10:00:00',
      }),
      task({ id: 'b', sprintId: 'sp1', createdAt: '2026-09-01T08:00:00' }),
    ];

    const result = buildSprintBurndown(
      sprint({ startDate: '2026-09-01', endDate: '2026-09-11' }),
      tasks,
      now,
    );

    expect(result.available).toBe(true);
    expect(result.committed).toBe(2);
    expect(result.points).toHaveLength(11); // 01..11 inclusive
    // Ideal: começa em 2 e termina em 0.
    expect(result.points[0].ideal).toBe(2);
    expect(result.points[10].ideal).toBe(0);
    // Restante: 2 antes da conclusão, 1 a partir do dia 03.
    expect(result.points[1].remaining).toBe(2);
    expect(result.points[2].remaining).toBe(1);
    expect(result.points[10].remaining).toBe(1);
  });

  it('handles an empty sprint without errors (FR-005)', () => {
    const now = new Date('2026-09-03T12:00:00').getTime();
    const result = buildSprintBurndown(
      sprint({ startDate: '2026-09-01', endDate: '2026-09-03' }),
      [],
      now,
    );
    expect(result.committed).toBe(0);
    expect(result.points.every((p) => p.ideal === 0 && p.remaining === 0)).toBe(true);
  });

  it('caps the visible window at today for an in-progress sprint', () => {
    const now = new Date('2026-09-02T12:00:00').getTime();
    const result = buildSprintBurndown(
      sprint({ startDate: '2026-09-01', endDate: '2026-09-14' }),
      [],
      now,
    );
    expect(result.points).toHaveLength(2); // 01 e 02
  });

  describe('buildSprintBurnup (Feature 042)', () => {
    it('is unavailable without a date window', () => {
      const result = buildSprintBurnup(sprint(), [task({ sprintId: 'sp1' })]);
      expect(result.available).toBe(false);
      expect(result.points).toEqual([]);
    });

    it('accumulates scope and completed per day', () => {
      const now = new Date('2026-09-04T12:00:00').getTime();
      const tasks = [
        task({
          id: 'a',
          sprintId: 'sp1',
          createdAt: '2026-09-01T08:00:00',
          completedAt: '2026-09-02T10:00:00',
        }),
        task({ id: 'b', sprintId: 'sp1', createdAt: '2026-09-03T08:00:00' }),
      ];

      const result = buildSprintBurnup(
        sprint({ startDate: '2026-09-01', endDate: '2026-09-04' }),
        tasks,
        now,
      );

      expect(result.available).toBe(true);
      expect(result.points.map((p) => p.scope)).toEqual([1, 1, 2, 2]);
      expect(result.points.map((p) => p.completed)).toEqual([0, 1, 1, 1]);
    });

    it('caps the visible window at today', () => {
      const now = new Date('2026-09-02T12:00:00').getTime();
      const result = buildSprintBurnup(
        sprint({ startDate: '2026-09-01', endDate: '2026-09-14' }),
        [],
        now,
      );
      expect(result.points).toHaveLength(2);
    });
  });
});

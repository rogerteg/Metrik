import { describe, it, expect } from 'vitest';
import {
  calculateItemAgeDays,
  getDeterministicJitter,
  calculateStagePacePercentiles,
  groupActiveTasksByColumn,
} from '../../src/utils/wipAgingMetrics';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

describe('Feature 020: WIP Aging Metrics', () => {
  const refDate = new Date('2026-09-11T12:00:00Z');

  const mockColumns: ColumnModel[] = [
    { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: 10, colorScheme: 'todo' },
    { id: 'dev', title: 'Desenvolvimento', category: 'in_progress', wipLimit: 5, colorScheme: 'progress' },
    { id: 'review', title: 'Revisão', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
    { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  describe('calculateItemAgeDays', () => {
    it('calculates exact age from startedAt when present', () => {
      const task: TaskModel = {
        id: '1',
        title: 'Task 1',
        column: 'dev',
        tags: [],
        createdAt: '2026-09-01T12:00:00Z',
        startedAt: '2026-09-05T12:00:00Z', // 6 dias até 11/09
      };

      const age = calculateItemAgeDays(task, refDate);
      expect(age).toBe(6.0);
    });

    it('falls back to createdAt when startedAt is missing', () => {
      const task: TaskModel = {
        id: '2',
        title: 'Task 2',
        column: 'todo',
        tags: [],
        createdAt: '2026-09-08T12:00:00Z', // 3 dias até 11/09
      };

      const age = calculateItemAgeDays(task, refDate);
      expect(age).toBe(3.0);
    });

    it('enforces minimum decimal age of 0.1 for newly created tasks', () => {
      const task: TaskModel = {
        id: '3',
        title: 'Brand New',
        column: 'todo',
        tags: [],
        createdAt: '2026-09-11T11:59:00Z',
      };

      const age = calculateItemAgeDays(task, refDate);
      expect(age).toBe(0.1);
    });
  });

  describe('getDeterministicJitter', () => {
    it('generates consistent, non-random offset for the same task ID', () => {
      const offset1 = getDeterministicJitter('task-abc', 15);
      const offset2 = getDeterministicJitter('task-abc', 15);
      expect(offset1).toBe(offset2);
      expect(Math.abs(offset1)).toBeLessThanOrEqual(15);
    });
  });

  describe('calculateStagePacePercentiles', () => {
    it('applies fallback when sample count is less than 3', () => {
      const percentilesMap = calculateStagePacePercentiles([], mockColumns);
      const devPercentiles = percentilesMap.get('dev');

      expect(devPercentiles).toBeDefined();
      expect(devPercentiles?.isFallback).toBe(true);
      expect(devPercentiles!.p50).toBeLessThanOrEqual(devPercentiles!.p70);
      expect(devPercentiles!.p70).toBeLessThanOrEqual(devPercentiles!.p85);
      expect(devPercentiles!.p85).toBeLessThanOrEqual(devPercentiles!.p95);
    });

    it('calculates progressive pace thresholds for sequential columns', () => {
      const completed: TaskModel[] = [
        {
          id: 'c1',
          title: 'Done 1',
          column: 'done',
          tags: [],
          createdAt: '2026-08-01T00:00:00Z',
          completedAt: '2026-08-11T00:00:00Z', // 10 dias
        },
        {
          id: 'c2',
          title: 'Done 2',
          column: 'done',
          tags: [],
          createdAt: '2026-08-01T00:00:00Z',
          completedAt: '2026-08-15T00:00:00Z', // 14 dias
        },
        {
          id: 'c3',
          title: 'Done 3',
          column: 'done',
          tags: [],
          createdAt: '2026-08-01T00:00:00Z',
          completedAt: '2026-08-21T00:00:00Z', // 20 dias
        },
      ];

      const percentilesMap = calculateStagePacePercentiles(completed, mockColumns);
      const todoPerc = percentilesMap.get('todo')!;
      const devPerc = percentilesMap.get('dev')!;
      const reviewPerc = percentilesMap.get('review')!;

      // P95 deve crescer progressivamente ao longo das etapas
      expect(todoPerc.p95).toBeLessThanOrEqual(devPerc.p95);
      expect(devPerc.p95).toBeLessThanOrEqual(reviewPerc.p95);
    });
  });

  describe('groupActiveTasksByColumn', () => {
    it('groups only active tasks and detects risk zones and blocked status', () => {
      const tasks: TaskModel[] = [
        {
          id: 'act1',
          title: 'Active in Dev',
          column: 'dev',
          tags: [],
          createdAt: '2026-09-01T12:00:00Z', // 10 dias
          blocked: true,
          blockedReason: 'Aguardando API',
        },
        {
          id: 'act2',
          title: 'Fresh in Todo',
          column: 'todo',
          tags: [],
          createdAt: '2026-09-10T12:00:00Z', // 1 dia
        },
        {
          id: 'fin1',
          title: 'Finished',
          column: 'done',
          tags: [],
          createdAt: '2026-08-01T00:00:00Z',
          completedAt: '2026-08-05T00:00:00Z',
        },
      ];

      const groups = groupActiveTasksByColumn(tasks, mockColumns, refDate);

      // Deve conter as 3 colunas ativas (excluindo 'done')
      expect(groups.length).toBe(3);

      const devGroup = groups.find((g) => g.id === 'dev')!;
      expect(devGroup.wipCount).toBe(1);
      expect(devGroup.items[0].isBlocked).toBe(true);
      expect(devGroup.items[0].blockedReason).toBe('Aguardando API');
      expect(devGroup.items[0].ageDays).toBe(10.0);

      const todoGroup = groups.find((g) => g.id === 'todo')!;
      expect(todoGroup.wipCount).toBe(1);
      expect(todoGroup.items[0].ageDays).toBe(1.0);

      const reviewGroup = groups.find((g) => g.id === 'review')!;
      expect(reviewGroup.wipCount).toBe(0);
      expect(reviewGroup.items).toEqual([]);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  resolveBacklogScope,
  validateThroughputSample,
  calculateTargetDateProbability,
} from '../../src/utils/monteCarloForecast';
import { TaskModel } from '../../src/types/kanban';

describe('Monte Carlo Backlog Forecast Utility (Feature 056)', () => {
  const mockTasks: TaskModel[] = [
    {
      id: 'init-1',
      title: 'Iniciativa Portal Web',
      column: 'in_progress',
      type: 'initiative',
      dueDate: '2026-12-01',
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'card-1',
      title: 'Implementar autenticação OAuth',
      column: 'in_progress',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
      links: [
        {
          id: 'l1',
          targetTaskId: 'init-1',
          relationType: 'relates_to',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: '2026-10-02T10:00:00Z',
        },
      ],
      tags: ['mvp', 'auth'],
      sprintId: 'sprint-1',
    },
    {
      id: 'card-2',
      title: 'Configurar banco de dados',
      column: 'done',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
      completedAt: '2026-10-15T12:00:00Z',
      links: [
        {
          id: 'l2',
          targetTaskId: 'init-1',
          relationType: 'relates_to',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: '2026-10-02T10:00:00Z',
        },
      ],
      tags: ['infra'],
      sprintId: 'sprint-1',
    },
    {
      id: 'card-3',
      title: 'Desenhar layout do dashboard',
      column: 'todo',
      type: 'card',
      createdAt: '2026-10-05T10:00:00Z',
      tags: ['mvp', 'frontend'],
      sprintId: 'sprint-2',
    },
    {
      id: 'card-4',
      title: 'Testes de integração de API',
      column: 'in_progress',
      type: 'card',
      createdAt: '2026-10-06T10:00:00Z',
      sprintId: 'sprint-1',
    },
  ];

  describe('resolveBacklogScope', () => {
    it('resolves all backlog tasks excluding initiatives when type is all', () => {
      const scope = resolveBacklogScope(mockTasks, { type: 'all' });
      expect(scope.type).toBe('all');
      // init-1 is an initiative so excluded, remaining 4 cards (3 pending, 1 completed)
      expect(scope.pendingTasks.length).toBe(3);
      expect(scope.completedTasks.length).toBe(1);
      expect(scope.selectedTaskIds).toEqual(['card-1', 'card-3', 'card-4']);
    });

    it('resolves tasks linked to an initiative and infers targetDate', () => {
      const scope = resolveBacklogScope(mockTasks, {
        type: 'initiative',
        scopeId: 'init-1',
      });
      expect(scope.type).toBe('initiative');
      expect(scope.scopeTitle).toBe('Épico: Iniciativa Portal Web');
      expect(scope.allTasks.length).toBe(2); // card-1, card-2
      expect(scope.pendingTasks.length).toBe(1);
      expect(scope.completedTasks.length).toBe(1);
      expect(scope.pendingTasks.map((t) => t.id)).toContain('card-1');
      expect(scope.completedTasks.map((t) => t.id)).toContain('card-2');
      expect(scope.inferredTargetDate).toBe('2026-12-01');
    });

    it('resolves tasks by sprintId', () => {
      const scope = resolveBacklogScope(mockTasks, {
        type: 'sprint',
        scopeId: 'sprint-1',
      });
      expect(scope.type).toBe('sprint');
      // sprint-1 tasks: card-1, card-2, card-4
      expect(scope.allTasks.length).toBe(3);
      expect(scope.pendingTasks.length).toBe(2);
      expect(scope.completedTasks.length).toBe(1);
    });

    it('resolves tasks by tag', () => {
      const scope = resolveBacklogScope(mockTasks, {
        type: 'tag',
        scopeId: 'mvp',
      });
      expect(scope.type).toBe('tag');
      // mvp tagged: card-1, card-3
      expect(scope.pendingTasks.length).toBe(2);
    });

    it('respects custom selectedTaskIds overriding default all pending', () => {
      const scope = resolveBacklogScope(mockTasks, {
        type: 'all',
        selectedTaskIds: ['card-1', 'card-3'],
      });
      expect(scope.selectedTaskIds).toEqual(['card-1', 'card-3']);
    });
  });

  describe('validateThroughputSample (NIST guidelines)', () => {
    it('returns isSampleSufficient: false when sample has fewer than 10 days of deliveries', () => {
      const smallThroughput = [0, 0, 1, 0, 2, 0, 1]; // 3 days with deliveries out of 7
      const validation = validateThroughputSample(smallThroughput);
      expect(validation.isSampleSufficient).toBe(false);
      expect(validation.warningReason).toContain('menos de 10 dias com entregas');
    });

    it('returns isSampleSufficient: false when throughput sum is 0', () => {
      const zeroThroughput = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const validation = validateThroughputSample(zeroThroughput);
      expect(validation.isSampleSufficient).toBe(false);
      expect(validation.warningReason).toContain('Nenhuma entrega registrada');
    });

    it('returns isSampleSufficient: true when sample has >= 10 days with deliveries', () => {
      const goodThroughput = [1, 2, 1, 0, 1, 1, 0, 2, 1, 0, 1, 3, 1, 2]; // 11 delivery days
      const validation = validateThroughputSample(goodThroughput);
      expect(validation.isSampleSufficient).toBe(true);
      expect(validation.warningReason).toBeUndefined();
    });
  });

  describe('calculateTargetDateProbability', () => {
    const trials = [10, 12, 15, 18, 20, 22, 25, 28, 30, 35]; // simulated completion days

    it('calculates 100% probability and low risk when available days exceeds max trial', () => {
      const refDate = new Date('2026-11-01T00:00:00Z');
      const targetDate = '2026-12-15'; // 44 days away > 35 max trial
      const result = calculateTargetDateProbability(trials, targetDate, refDate);
      expect(result.probability).toBe(100);
      expect(result.riskLevel).toBe('low');
      expect(result.successfulTrials).toBe(10);
    });

    it('calculates correct percentile probability and moderate risk based on target date', () => {
      const refDate = new Date('2026-11-01T00:00:00Z');
      // Target: 2026-11-21 -> 20 days away
      // Trials <= 20: 10, 12, 15, 18, 20 (5 out of 10 = 50%)
      const targetDate = '2026-11-21';
      const result = calculateTargetDateProbability(trials, targetDate, refDate);
      expect(result.probability).toBe(50);
      expect(result.riskLevel).toBe('moderate');
    });

    it('calculates high risk (20% <= P < 50%) when few trials succeed', () => {
      const refDate = new Date('2026-11-01T00:00:00Z');
      // Target: 2026-11-14 -> 13 days away. Trials <= 13: 10, 12 (2 out of 10 = 20%)
      const targetDate = '2026-11-14';
      const result = calculateTargetDateProbability(trials, targetDate, refDate);
      expect(result.probability).toBe(20);
      expect(result.riskLevel).toBe('high');
    });

    it('calculates critical risk (< 20%) when target date has insufficient available days', () => {
      const refDate = new Date('2026-11-01T00:00:00Z');
      // Target: 2026-11-05 -> 4 days away. Trials <= 4: none (0 out of 10 = 0%)
      const targetDate = '2026-11-05';
      const result = calculateTargetDateProbability(trials, targetDate, refDate);
      expect(result.probability).toBe(0);
      expect(result.riskLevel).toBe('critical');
    });

    it('returns 0% probability and critical risk if target date is in the past', () => {
      const refDate = new Date('2026-11-01T00:00:00Z');
      const pastDate = '2026-10-25';
      const result = calculateTargetDateProbability(trials, pastDate, refDate);
      expect(result.probability).toBe(0);
      expect(result.riskLevel).toBe('critical');
      expect(result.availableDays).toBeLessThanOrEqual(0);
    });
  });
});

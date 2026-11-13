import { describe, it, expect } from 'vitest';
import {
  calculateCascadeImpact,
  simulatePolicyScenario,
  rankTopLeverages,
} from '../../src/utils/flowLeverageEngine';
import { TaskModel, ColumnModel } from '../../src/types/kanban';
import { CardSlePrediction } from '../../src/types/sle';

describe('flowLeverageEngine', () => {
  const baseColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'col-dev',
      title: 'In Dev',
      category: 'in_progress',
      wipLimit: 6,
      colorScheme: 'progress',
    },
    {
      id: 'col-test',
      title: 'Testing',
      category: 'in_progress',
      wipLimit: 4,
      colorScheme: 'progress',
    },
    { id: 'col-done', title: 'Done', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  describe('calculateCascadeImpact', () => {
    it('returns empty impact for non-existent root task', () => {
      const result = calculateCascadeImpact([], 'non-existent');
      expect(result.dependentTaskIds).toEqual([]);
      expect(result.maxDepth).toBe(0);
      expect(result.hasCycle).toBe(false);
      expect(result.estimatedDelayDaysP85).toBe(0);
    });

    it('traverses linear chain of blockers correctly', () => {
      const tasks: TaskModel[] = [
        {
          id: 'task-1',
          title: 'Database migration',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          blocked: true,
          blockedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          links: [
            {
              id: 'link-1',
              targetTaskId: 'task-2',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'task-2',
          title: 'Backend API endpoint',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          links: [
            {
              id: 'link-2',
              targetTaskId: 'task-3',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'task-3',
          title: 'Frontend UI integration',
          column: 'col-todo',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];

      const result = calculateCascadeImpact(tasks, 'task-1');
      expect(result.rootTaskId).toBe('task-1');
      expect(result.dependentTaskIds).toEqual(['task-2', 'task-3']);
      expect(result.maxDepth).toBe(2);
      expect(result.hasCycle).toBe(false);
      expect(result.estimatedDelayDaysP85).toBeGreaterThanOrEqual(4);
    });

    it('detects circular dependencies without crashing and flags hasCycle', () => {
      const tasks: TaskModel[] = [
        {
          id: 'task-a',
          title: 'Component A',
          column: 'col-dev',
          createdAt: new Date().toISOString(),
          blocked: true,
          links: [
            {
              id: 'link-a-b',
              targetTaskId: 'task-b',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'task-b',
          title: 'Component B',
          column: 'col-dev',
          createdAt: new Date().toISOString(),
          links: [
            {
              id: 'link-b-a',
              targetTaskId: 'task-a',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      const result = calculateCascadeImpact(tasks, 'task-a');
      expect(result.hasCycle).toBe(true);
      expect(result.dependentTaskIds).toContain('task-b');
      expect(result.cycleTaskIds).toBeDefined();
    });

    it('supports reciprocal relation is_blocked_by and parent-child hierarchy', () => {
      const tasks: TaskModel[] = [
        {
          id: 'task-parent',
          title: 'Epic Parent',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          blocked: true,
          links: [
            {
              id: 'link-child',
              targetTaskId: 'task-child',
              relationType: 'child',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'task-child',
          title: 'Sub-card',
          column: 'col-todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-other',
          title: 'Other task waiting',
          column: 'col-todo',
          createdAt: new Date().toISOString(),
          links: [
            {
              id: 'link-blocked-by',
              targetTaskId: 'task-parent',
              relationType: 'is_blocked_by',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      const result = calculateCascadeImpact(tasks, 'task-parent');
      expect(result.dependentTaskIds).toContain('task-child');
      expect(result.dependentTaskIds).toContain('task-other');
      expect(result.dependentTaskIds.length).toBe(2);
    });
  });

  describe('simulatePolicyScenario', () => {
    it('calculates cycle time reduction using Littles Law when WIP limit is lowered', () => {
      const tasks: TaskModel[] = Array.from({ length: 15 }, (_, i) => ({
        id: `t-${i}`,
        title: `Task ${i}`,
        column: i < 10 ? 'col-dev' : 'col-done',
        createdAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
        completedAt: i >= 10 ? new Date(Date.now() - (i - 10) * 86400000).toISOString() : undefined,
      }));

      const scenario = simulatePolicyScenario({
        boardId: 'b1',
        tasks,
        columns: baseColumns,
        scopeType: 'all',
        simulatedLimits: { 'col-dev': 5 },
        swarmingEnabled: false,
        baselineThroughput: 1.5,
        baselineCycleTimeP50: 8,
        baselineCycleTimeP85: 14,
        deliveryDaysCount: 15,
      });

      expect(scenario.simulatedLimits['col-dev']).toBe(5);
      expect(scenario.simulatedCycleTimeP85).toBeLessThan(scenario.currentCycleTimeP85);
      expect(scenario.deltaDaysP85).toBeLessThan(0);
      expect(scenario.isSampleSufficient).toBe(true);
    });

    it('amplifies P85 reduction when swarming is enabled on aging tasks', () => {
      const tasks: TaskModel[] = Array.from({ length: 12 }, (_, i) => ({
        id: `t-${i}`,
        title: `Task ${i}`,
        column: 'col-dev',
        createdAt: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
      }));

      const withoutSwarming = simulatePolicyScenario({
        boardId: 'b1',
        tasks,
        columns: baseColumns,
        scopeType: 'all',
        simulatedLimits: { 'col-dev': 4 },
        swarmingEnabled: false,
        baselineThroughput: 1.0,
        baselineCycleTimeP50: 10,
        baselineCycleTimeP85: 20,
        deliveryDaysCount: 12,
      });

      const withSwarming = simulatePolicyScenario({
        boardId: 'b1',
        tasks,
        columns: baseColumns,
        scopeType: 'all',
        simulatedLimits: { 'col-dev': 4 },
        swarmingEnabled: true,
        baselineThroughput: 1.0,
        baselineCycleTimeP50: 10,
        baselineCycleTimeP85: 20,
        deliveryDaysCount: 12,
      });

      expect(withSwarming.deltaDaysP85).toBeLessThanOrEqual(withoutSwarming.deltaDaysP85);
      expect(withSwarming.simulatedCycleTimeP85).toBeLessThanOrEqual(
        withoutSwarming.simulatedCycleTimeP85,
      );
    });

    it('flags insufficient sample when delivery days count < 10', () => {
      const scenario = simulatePolicyScenario({
        boardId: 'b1',
        tasks: [],
        columns: baseColumns,
        scopeType: 'all',
        simulatedLimits: {},
        swarmingEnabled: false,
        baselineThroughput: 0.5,
        baselineCycleTimeP50: 5,
        baselineCycleTimeP85: 10,
        deliveryDaysCount: 6,
      });

      expect(scenario.isSampleSufficient).toBe(false);
    });
  });

  describe('rankTopLeverages', () => {
    it('ranks cascade blockers, aging swarming candidates and wip bottlenecks', () => {
      const tasks: TaskModel[] = [
        {
          id: 'task-blocker',
          title: 'Critical DB Blocker',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          blocked: true,
          blockedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          links: [
            {
              id: 'l1',
              targetTaskId: 'task-child-1',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'l2',
              targetTaskId: 'task-child-2',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'task-child-1',
          title: 'Dependent Task 1',
          column: 'col-todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-child-2',
          title: 'Dependent Task 2',
          column: 'col-todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task-aging',
          title: 'Old in-progress feature',
          column: 'col-test',
          createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
          startedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        },
      ];

      const slePredictions: Record<string, CardSlePrediction> = {
        'task-aging': {
          taskId: 'task-aging',
          agingDays: 15,
          thresholds: {
            p50Days: 5,
            p85Days: 8,
            p95Days: 12,
            sampleSize: 20,
            isStatisticallySignificant: true,
          },
          effectiveTargetDays: 8,
          riskLevel: 'critical_p95',
          daysToBreach: -7,
          percentageOfTarget: 187.5,
          label: 'Crítico',
        },
      };

      const summary = rankTopLeverages({
        boardId: 'b1',
        tasks,
        columns: baseColumns,
        slePredictions,
        deliveryDaysCount: 20,
      });

      expect(summary.items.length).toBeGreaterThan(0);
      expect(summary.items.length).toBeLessThanOrEqual(3);
      expect(summary.isSampleSufficient).toBe(true);
      expect(summary.items[0].impactDaysP85).toBeGreaterThanOrEqual(
        summary.items[summary.items.length - 1].impactDaysP85,
      );
      expect(summary.items[0].rationale).toBeTruthy();
    });

    it('breaks ties deterministically by dependentTaskCount and currentAgingDays', () => {
      const tasks: TaskModel[] = [
        {
          id: 'task-a',
          title: 'Task A with 2 dependents',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          blocked: true,
          blockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          links: [
            {
              id: 'la1',
              targetTaskId: 'dep-1',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: '',
            },
            {
              id: 'la2',
              targetTaskId: 'dep-2',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: '',
            },
          ],
        },
        {
          id: 'task-b',
          title: 'Task B with 1 dependent',
          column: 'col-dev',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          blocked: true,
          blockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          links: [
            {
              id: 'lb1',
              targetTaskId: 'dep-3',
              relationType: 'blocks',
              targetBoardId: 'b1',
              targetTeamId: 't1',
              createdAt: '',
            },
          ],
        },
        { id: 'dep-1', title: 'Dep 1', column: 'col-todo', createdAt: '' },
        { id: 'dep-2', title: 'Dep 2', column: 'col-todo', createdAt: '' },
        { id: 'dep-3', title: 'Dep 3', column: 'col-todo', createdAt: '' },
      ];

      const summary = rankTopLeverages({
        boardId: 'b1',
        tasks,
        columns: baseColumns,
        deliveryDaysCount: 15,
      });

      expect(summary.items[0].taskId).toBe('task-a');
    });
  });
});

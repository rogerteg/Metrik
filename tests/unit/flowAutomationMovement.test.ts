import { describe, it, expect } from 'vitest';
import { evaluateRulesForEvent } from '../../src/utils/flowRulesEngine';
import { FlowRule } from '../../src/types/flowRules';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

describe('flowAutomationMovement — Integração de Movimentação com Automações', () => {
  const dummyTask: TaskModel = {
    id: 'task-mov',
    title: 'Item de Teste',
    column: 'col-dev',
    type: 'card',
    priority: 'low',
    tags: ['design'],
    description: '',
    acceptanceCriteria: '',
    testScenarios: '',
    subtasks: [],
    activityLog: [],
    createdAt: '2026-11-01T00:00:00Z',
  };

  const dummyColumns: ColumnModel[] = [
    { id: 'col-dev', title: 'Dev', category: 'in_progress', wipLimit: 5, colorScheme: 'progress' },
    { id: 'col-review', title: 'Review', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
  ];

  const rule: FlowRule = {
    id: 'r-review',
    boardId: 'b1',
    name: 'Tag de QA ao Mover',
    enabled: true,
    trigger: {
      type: 'card_moved',
      config: { targetColumnId: 'col-review' },
    },
    conditions: [],
    actions: [
      { id: 'a1', type: 'add_tag', payload: { tag: 'needs-review' } },
      { id: 'a2', type: 'set_priority', payload: { priority: 'high' } },
    ],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    executionCount: 0,
  };

  it('deve disparar ações quando o cartão é movido para a coluna de destino', () => {
    const results = evaluateRulesForEvent(
      [rule],
      {
        boardId: 'b1',
        event: 'card_moved',
        fromColumnId: 'col-dev',
        toColumnId: 'col-review',
        toCategory: 'in_progress',
      },
      dummyTask,
      dummyColumns,
    );

    expect(results).toHaveLength(1);
    expect(results[0].taskUpdates.tags).toEqual(['design', 'needs-review']);
    expect(results[0].taskUpdates.priority).toBe('high');
  });
});

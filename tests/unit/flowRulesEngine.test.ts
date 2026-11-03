import { describe, it, expect } from 'vitest';
import {
  matchTrigger,
  matchConditions,
  resolveActions,
  evaluateRulesForEvent,
} from '../../src/utils/flowRulesEngine';
import { FlowRule, FlowEventContext } from '../../src/types/flowRules';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

describe('flowRulesEngine — Motor Puro de Regras de Fluxo', () => {
  const dummyTask: TaskModel = {
    id: 'task-1',
    title: 'Implementar Motor',
    column: 'col-todo',
    type: 'card',
    priority: 'medium',
    tags: ['backend', 'core'],
    description: '',
    acceptanceCriteria: '',
    testScenarios: '',
    subtasks: [],
    assignee: 'Alice',
    createdAt: '2026-10-01T10:00:00.000Z',
    startedAt: '2026-10-02T10:00:00.000Z',
    lastMovedAt: '2026-10-02T10:00:00.000Z',
    blocked: false,
    activityLog: [],
  };

  const dummyColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'col-dev',
      title: 'Desenvolvimento',
      category: 'in_progress',
      wipLimit: 5,
      colorScheme: 'progress',
    },
    {
      id: 'col-review',
      title: 'Revisão',
      category: 'in_progress',
      wipLimit: 3,
      colorScheme: 'progress',
    },
    {
      id: 'col-done',
      title: 'Concluído',
      category: 'done',
      wipLimit: null,
      colorScheme: 'completed',
    },
  ];

  describe('matchTrigger', () => {
    it('deve corresponder quando cartão é movido para uma coluna específica', () => {
      const trigger = {
        type: 'card_moved' as const,
        config: { targetColumnId: 'col-review' },
      };
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'card_moved',
        fromColumnId: 'col-dev',
        toColumnId: 'col-review',
        toCategory: 'in_progress',
      };

      expect(matchTrigger(trigger, context, dummyTask)).toBe(true);

      const mismatchContext: FlowEventContext = {
        ...context,
        toColumnId: 'col-done',
        toCategory: 'done',
      };
      expect(matchTrigger(trigger, mismatchContext, dummyTask)).toBe(false);
    });

    it('deve corresponder quando cartão é movido para qualquer coluna de uma categoria', () => {
      const trigger = {
        type: 'card_moved' as const,
        config: { targetColumnCategory: 'in_progress' as const },
      };
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'card_moved',
        fromColumnId: 'col-todo',
        toColumnId: 'col-dev',
        toCategory: 'in_progress',
      };

      expect(matchTrigger(trigger, context, dummyTask)).toBe(true);
    });

    it('deve corresponder quando o status de bloqueio for alterado', () => {
      const triggerBlocked = {
        type: 'block_status_changed' as const,
        config: { blockStatus: 'blocked' as const },
      };
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'block_status_changed',
      };

      expect(matchTrigger(triggerBlocked, context, { ...dummyTask, blocked: true })).toBe(true);
      expect(matchTrigger(triggerBlocked, context, { ...dummyTask, blocked: false })).toBe(false);
    });

    it('deve avaliar limiar de tempo para aging_threshold_exceeded', () => {
      const trigger = {
        type: 'aging_threshold_exceeded' as const,
        config: { agingThresholdDays: 3, targetColumnCategory: 'in_progress' as const },
      };
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'aging_threshold_exceeded',
        toCategory: 'in_progress',
      };

      // 4 dias atrás
      const now = new Date();
      const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const taskAging = { ...dummyTask, column: 'col-dev', lastMovedAt: fourDaysAgo };

      expect(matchTrigger(trigger, context, taskAging)).toBe(true);

      // 1 dia atrás
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const taskFresh = { ...dummyTask, column: 'col-dev', lastMovedAt: oneDayAgo };
      expect(matchTrigger(trigger, context, taskFresh)).toBe(false);
    });
  });

  describe('matchConditions', () => {
    it('deve validar condição de prioridade (equals e not_equals)', () => {
      const condEquals = [
        { id: 'c1', field: 'priority' as const, operator: 'equals' as const, value: 'medium' },
      ];
      expect(matchConditions(condEquals, dummyTask, dummyColumns)).toBe(true);

      const condNotEquals = [
        { id: 'c2', field: 'priority' as const, operator: 'not_equals' as const, value: 'urgent' },
      ];
      expect(matchConditions(condNotEquals, dummyTask, dummyColumns)).toBe(true);

      const condFail = [
        { id: 'c3', field: 'priority' as const, operator: 'equals' as const, value: 'urgent' },
      ];
      expect(matchConditions(condFail, dummyTask, dummyColumns)).toBe(false);
    });

    it('deve validar condição de tags (contains e not_contains)', () => {
      const condContains = [
        { id: 'c1', field: 'tags' as const, operator: 'contains' as const, value: 'backend' },
      ];
      expect(matchConditions(condContains, dummyTask, dummyColumns)).toBe(true);

      const condNotContains = [
        { id: 'c2', field: 'tags' as const, operator: 'not_contains' as const, value: 'frontend' },
      ];
      expect(matchConditions(condNotContains, dummyTask, dummyColumns)).toBe(true);
    });

    it('deve exigir que todas as condições sejam verdadeiras (AND lógico)', () => {
      const conditions = [
        { id: 'c1', field: 'priority' as const, operator: 'equals' as const, value: 'medium' },
        { id: 'c2', field: 'tags' as const, operator: 'contains' as const, value: 'frontend' }, // false
      ];
      expect(matchConditions(conditions, dummyTask, dummyColumns)).toBe(false);
    });
  });

  describe('resolveActions', () => {
    it('deve adicionar nova tag sem duplicar existentes', () => {
      const actions = [{ id: 'a1', type: 'add_tag' as const, payload: { tag: 'needs-qa' } }];
      const result = resolveActions(actions, dummyTask, 'Regra QA');

      expect(result.hasChanges).toBe(true);
      expect(result.updates.tags).toEqual(['backend', 'core', 'needs-qa']);

      // Se já possui a tag, hasChanges deve ser false para essa ação
      const taskWithTag = { ...dummyTask, tags: ['backend', 'core', 'needs-qa'] };
      const resultDuplicate = resolveActions(actions, taskWithTag, 'Regra QA');
      expect(resultDuplicate.hasChanges).toBe(false);
    });

    it('deve remover tag com sucesso', () => {
      const actions = [{ id: 'a1', type: 'remove_tag' as const, payload: { tag: 'backend' } }];
      const result = resolveActions(actions, dummyTask, 'Limpar Tag');

      expect(result.hasChanges).toBe(true);
      expect(result.updates.tags).toEqual(['core']);
    });

    it('deve alterar prioridade e registrar toast', () => {
      const actions = [
        { id: 'a1', type: 'set_priority' as const, payload: { priority: 'urgent' as const } },
        {
          id: 'a2',
          type: 'notify_toast' as const,
          payload: { toastMessage: 'Prioridade alterada para Urgente' },
        },
      ];
      const result = resolveActions(actions, dummyTask, 'Regra Prioridade');

      expect(result.hasChanges).toBe(true);
      expect(result.updates.priority).toBe('urgent');
      expect(result.toasts).toContain('Prioridade alterada para Urgente');
    });

    it('deve marcar cartão como bloqueado com motivo', () => {
      const actions = [
        {
          id: 'a1',
          type: 'set_blocked' as const,
          payload: { blockReason: 'Aguardando validação externa' },
        },
      ];
      const result = resolveActions(actions, dummyTask, 'Auto Bloqueio');

      expect(result.hasChanges).toBe(true);
      expect(result.updates.blocked).toBe(true);
      expect(result.updates.blockedReason).toBe('Aguardando validação externa');
    });
  });

  describe('evaluateRulesForEvent (Trava anti-loop e Execução)', () => {
    const activeRule: FlowRule = {
      id: 'rule-1',
      boardId: 'b1',
      name: 'Adicionar tag QA',
      enabled: true,
      trigger: {
        type: 'card_moved',
        config: { targetColumnId: 'col-review' },
      },
      conditions: [],
      actions: [
        { id: 'a1', type: 'add_tag', payload: { tag: 'needs-qa' } },
        { id: 'a2', type: 'notify_toast', payload: { toastMessage: 'Tag QA adicionada!' } },
      ],
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
      executionCount: 0,
    };

    it('deve ignorar eventos marcados com isAutomated (trava anti-loop depth=1)', () => {
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'card_moved',
        toColumnId: 'col-review',
        isAutomated: true, // Cascata secundária prevenida
      };

      const results = evaluateRulesForEvent([activeRule], context, dummyTask, dummyColumns);
      expect(results).toHaveLength(0);
    });

    it('deve ignorar regras desabilitadas', () => {
      const disabledRule = { ...activeRule, enabled: false };
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'card_moved',
        toColumnId: 'col-review',
      };

      const results = evaluateRulesForEvent([disabledRule], context, dummyTask, dummyColumns);
      expect(results).toHaveLength(0);
    });

    it('deve executar regra ativa correspondente e retornar atualizações e log de auditoria', () => {
      const context: FlowEventContext = {
        boardId: 'b1',
        event: 'card_moved',
        toColumnId: 'col-review',
      };

      const results = evaluateRulesForEvent([activeRule], context, dummyTask, dummyColumns);
      expect(results).toHaveLength(1);
      expect(results[0].ruleId).toBe('rule-1');
      expect(results[0].taskUpdates.tags).toEqual(['backend', 'core', 'needs-qa']);
      expect(results[0].toastMessages).toContain('Tag QA adicionada!');
    });
  });
});

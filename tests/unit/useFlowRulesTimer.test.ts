import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowRulesTimer } from '../../src/hooks/useFlowRulesTimer';
import { FlowRule } from '../../src/types/flowRules';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

describe('useFlowRulesTimer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const dummyColumns: ColumnModel[] = [
    { id: 'col-dev', title: 'Em Progresso', category: 'in_progress', wipLimit: null, colorScheme: 'progress' },
    { id: 'col-done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const dummyTask: TaskModel = {
    id: 'task-aging',
    title: 'Item Envelhecido',
    column: 'col-dev',
    type: 'card',
    priority: 'low',
    tags: [],
    description: '',
    acceptanceCriteria: '',
    testScenarios: '',
    subtasks: [],
    // 5 dias atrás
    lastMovedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-11-01T00:00:00Z',
    activityLog: [],
  };

  const agingRule: FlowRule = {
    id: 'rule-aging',
    boardId: 'b1',
    name: 'Alerta de Aging',
    enabled: true,
    trigger: {
      type: 'aging_threshold_exceeded',
      config: { agingThresholdDays: 3, targetColumnCategory: 'in_progress' },
    },
    conditions: [],
    actions: [
      { id: 'a1', type: 'set_priority', payload: { priority: 'urgent' } },
      { id: 'a2', type: 'add_tag', payload: { tag: 'aging-alert' } },
      { id: 'a3', type: 'notify_toast', payload: { toastMessage: 'Aging detectado!' } },
    ],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    executionCount: 0,
  };

  it('deve disparar ação para itens que excederam o limiar de envelhecimento', () => {
    const onApplyUpdates = vi.fn();
    const onRecordExecution = vi.fn();
    const onToast = vi.fn();

    renderHook(() =>
      useFlowRulesTimer({
        enabled: true,
        boardId: 'b1',
        rules: [agingRule],
        tasks: [dummyTask],
        columns: dummyColumns,
        onApplyUpdates,
        onRecordExecution,
        onToast,
        intervalMs: 10000,
      }),
    );

    // Executa a primeira verificação no mount
    expect(onApplyUpdates).toHaveBeenCalledWith('task-aging', {
      priority: 'urgent',
      tags: ['aging-alert'],
    });
    expect(onRecordExecution).toHaveBeenCalledWith('rule-aging');
    expect(onToast).toHaveBeenCalledWith('Aging detectado!');
  });

  it('não deve disparar se a regra estiver desabilitada', () => {
    const onApplyUpdates = vi.fn();

    renderHook(() =>
      useFlowRulesTimer({
        enabled: false,
        boardId: 'b1',
        rules: [agingRule],
        tasks: [dummyTask],
        columns: dummyColumns,
        onApplyUpdates,
        onRecordExecution: vi.fn(),
      }),
    );

    expect(onApplyUpdates).not.toHaveBeenCalled();
  });
});

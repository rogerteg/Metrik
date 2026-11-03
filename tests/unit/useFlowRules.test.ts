import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlowRules } from '../../src/hooks/useFlowRules';
import { FlowRule } from '../../src/types/flowRules';

describe('useFlowRules Hook', () => {
  const boardId = 'board-alpha';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve inicializar com array vazio quando não há regras salvas', () => {
    const { result } = renderHook(() => useFlowRules(boardId));
    expect(result.current.rules).toEqual([]);
    expect(result.current.activeRulesCount).toBe(0);
  });

  it('deve adicionar uma nova regra e persistir no localStorage', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    const newRuleInput: Omit<FlowRule, 'id' | 'boardId' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastTriggeredAt'> = {
      name: 'Regra Teste',
      description: 'Desc',
      enabled: true,
      trigger: { type: 'card_moved', config: { targetColumnCategory: 'in_progress' } },
      conditions: [],
      actions: [{ id: 'a1', type: 'add_tag', payload: { tag: 'test' } }],
    };

    act(() => {
      result.current.addRule(newRuleInput);
    });

    expect(result.current.rules).toHaveLength(1);
    expect(result.current.rules[0].name).toBe('Regra Teste');
    expect(result.current.rules[0].boardId).toBe(boardId);
    expect(result.current.activeRulesCount).toBe(1);

    // Verifica persistência no localStorage
    const saved = JSON.parse(localStorage.getItem(`metrik_flow_rules_${boardId}`) || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Regra Teste');
  });

  it('deve alternar o status ativo/inativo da regra via toggleRule', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    let ruleId = '';
    act(() => {
      const created = result.current.addRule({
        name: 'Toggle Test',
        enabled: true,
        trigger: { type: 'card_created', config: {} },
        conditions: [],
        actions: [],
      });
      ruleId = created.id;
    });

    expect(result.current.rules[0].enabled).toBe(true);

    act(() => {
      result.current.toggleRule(ruleId);
    });
    expect(result.current.rules[0].enabled).toBe(false);
    expect(result.current.activeRulesCount).toBe(0);

    act(() => {
      result.current.toggleRule(ruleId);
    });
    expect(result.current.rules[0].enabled).toBe(true);
  });

  it('deve atualizar uma regra existente', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    let ruleId = '';
    act(() => {
      const created = result.current.addRule({
        name: 'Original',
        enabled: true,
        trigger: { type: 'card_created', config: {} },
        conditions: [],
        actions: [],
      });
      ruleId = created.id;
    });

    act(() => {
      result.current.updateRule(ruleId, { name: 'Atualizado' });
    });

    expect(result.current.rules[0].name).toBe('Atualizado');
  });

  it('deve excluir uma regra via deleteRule', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    let ruleId = '';
    act(() => {
      const created = result.current.addRule({
        name: 'Para Deletar',
        enabled: true,
        trigger: { type: 'card_created', config: {} },
        conditions: [],
        actions: [],
      });
      ruleId = created.id;
    });

    expect(result.current.rules).toHaveLength(1);

    act(() => {
      result.current.deleteRule(ruleId);
    });

    expect(result.current.rules).toHaveLength(0);
  });

  it('deve duplicar uma regra existente', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    let ruleId = '';
    act(() => {
      const created = result.current.addRule({
        name: 'Regra Base',
        enabled: true,
        trigger: { type: 'card_created', config: {} },
        conditions: [],
        actions: [],
      });
      ruleId = created.id;
    });

    act(() => {
      result.current.duplicateRule(ruleId);
    });

    expect(result.current.rules).toHaveLength(2);
    expect(result.current.rules[1].name).toBe('Regra Base (Cópia)');
    expect(result.current.rules[1].id).not.toBe(ruleId);
  });

  it('deve registrar execução e incrementar executionCount', () => {
    const { result } = renderHook(() => useFlowRules(boardId));

    let ruleId = '';
    act(() => {
      const created = result.current.addRule({
        name: 'Exec Contada',
        enabled: true,
        trigger: { type: 'card_created', config: {} },
        conditions: [],
        actions: [],
      });
      ruleId = created.id;
    });

    expect(result.current.rules[0].executionCount).toBe(0);

    act(() => {
      result.current.recordExecution(ruleId);
    });

    expect(result.current.rules[0].executionCount).toBe(1);
    expect(result.current.rules[0].lastTriggeredAt).toBeTruthy();
  });
});

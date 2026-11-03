/**
 * Metrik — Hook de Gerenciamento de Regras de Fluxo (Flow Rules)
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlowRule } from '../types/flowRules';
import { loadFlowRules, saveFlowRules } from '../utils/flowRulesStorage';

export type NewFlowRuleInput = Omit<
  FlowRule,
  'id' | 'boardId' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastTriggeredAt'
>;

export interface UseFlowRulesReturn {
  rules: FlowRule[];
  activeRulesCount: number;
  addRule: (input: NewFlowRuleInput) => FlowRule;
  updateRule: (id: string, updates: Partial<FlowRule>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  duplicateRule: (id: string) => FlowRule | null;
  recordExecution: (id: string) => void;
  setRules: (rules: FlowRule[]) => void;
}

export function useFlowRules(boardId: string): UseFlowRulesReturn {
  const [rules, setRulesState] = useState<FlowRule[]>(() => loadFlowRules(boardId));

  // Sincroniza ao mudar de quadro
  useEffect(() => {
    setRulesState(loadFlowRules(boardId));
  }, [boardId]);

  // Helper para atualizar estado e salvar no storage
  const updateAndPersist = useCallback(
    (updater: (prev: FlowRule[]) => FlowRule[]) => {
      setRulesState((prev) => {
        const next = updater(prev);
        saveFlowRules(boardId, next);
        return next;
      });
    },
    [boardId],
  );

  const addRule = useCallback(
    (input: NewFlowRuleInput): FlowRule => {
      const now = new Date().toISOString();
      const newRule: FlowRule = {
        ...input,
        id: `flow_rule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        boardId,
        createdAt: now,
        updatedAt: now,
        executionCount: 0,
        lastTriggeredAt: null,
      };

      updateAndPersist((prev) => [...prev, newRule]);
      return newRule;
    },
    [boardId, updateAndPersist],
  );

  const updateRule = useCallback(
    (id: string, updates: Partial<FlowRule>) => {
      const now = new Date().toISOString();
      updateAndPersist((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r)),
      );
    },
    [updateAndPersist],
  );

  const toggleRule = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      updateAndPersist((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled, updatedAt: now } : r)),
      );
    },
    [updateAndPersist],
  );

  const deleteRule = useCallback(
    (id: string) => {
      updateAndPersist((prev) => prev.filter((r) => r.id !== id));
    },
    [updateAndPersist],
  );

  const duplicateRule = useCallback(
    (id: string): FlowRule | null => {
      let created: FlowRule | null = null;
      updateAndPersist((prev) => {
        const target = prev.find((r) => r.id === id);
        if (!target) return prev;

        const now = new Date().toISOString();
        const clone: FlowRule = {
          ...target,
          id: `flow_rule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: `${target.name} (Cópia)`,
          createdAt: now,
          updatedAt: now,
          executionCount: 0,
          lastTriggeredAt: null,
        };
        created = clone;
        return [...prev, clone];
      });
      return created;
    },
    [updateAndPersist],
  );

  const recordExecution = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      updateAndPersist((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, executionCount: (r.executionCount || 0) + 1, lastTriggeredAt: now }
            : r,
        ),
      );
    },
    [updateAndPersist],
  );

  const setRules = useCallback(
    (newRules: FlowRule[]) => {
      updateAndPersist(() => newRules);
    },
    [updateAndPersist],
  );

  const activeRulesCount = useMemo(() => rules.filter((r) => r.enabled).length, [rules]);

  return {
    rules,
    activeRulesCount,
    addRule,
    updateRule,
    toggleRule,
    deleteRule,
    duplicateRule,
    recordExecution,
    setRules,
  };
}

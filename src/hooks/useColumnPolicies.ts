/**
 * Metrik — Hook de Gerenciamento de Políticas de Coluna (Definition of Ready / Done)
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { useState, useEffect, useCallback } from 'react';
import { ColumnPolicy, ColumnPoliciesMap } from '../types/columnPolicy';
import { loadColumnPolicies, saveColumnPolicies } from '../utils/flowRulesStorage';

export interface UseColumnPoliciesReturn {
  policies: ColumnPoliciesMap;
  getPolicy: (columnId: string) => ColumnPolicy;
  hasPolicy: (columnId: string) => boolean;
  setPolicy: (columnId: string, data: { entryCriteria: string; exitCriteria: string }) => void;
  deletePolicy: (columnId: string) => void;
}

export function useColumnPolicies(boardId: string): UseColumnPoliciesReturn {
  const [policies, setPoliciesState] = useState<ColumnPoliciesMap>(() =>
    loadColumnPolicies(boardId),
  );

  useEffect(() => {
    setPoliciesState(loadColumnPolicies(boardId));
  }, [boardId]);

  const updateAndPersist = useCallback(
    (updater: (prev: ColumnPoliciesMap) => ColumnPoliciesMap) => {
      setPoliciesState((prev) => {
        const next = updater(prev);
        saveColumnPolicies(boardId, next);
        return next;
      });
    },
    [boardId],
  );

  const getPolicy = useCallback(
    (columnId: string): ColumnPolicy => {
      return (
        policies[columnId] || {
          columnId,
          entryCriteria: '',
          exitCriteria: '',
          updatedAt: '',
        }
      );
    },
    [policies],
  );

  const hasPolicy = useCallback(
    (columnId: string): boolean => {
      const p = policies[columnId];
      if (!p) return false;
      return Boolean(
        (p.entryCriteria && p.entryCriteria.trim().length > 0) ||
        (p.exitCriteria && p.exitCriteria.trim().length > 0),
      );
    },
    [policies],
  );

  const setPolicy = useCallback(
    (columnId: string, data: { entryCriteria: string; exitCriteria: string }) => {
      const now = new Date().toISOString();
      updateAndPersist((prev) => ({
        ...prev,
        [columnId]: {
          columnId,
          entryCriteria: data.entryCriteria,
          exitCriteria: data.exitCriteria,
          updatedAt: now,
        },
      }));
    },
    [updateAndPersist],
  );

  const deletePolicy = useCallback(
    (columnId: string) => {
      updateAndPersist((prev) => {
        const next = { ...prev };
        delete next[columnId];
        return next;
      });
    },
    [updateAndPersist],
  );

  return {
    policies,
    getPolicy,
    hasPolicy,
    setPolicy,
    deletePolicy,
  };
}

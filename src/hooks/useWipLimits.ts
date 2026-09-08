import { useState, useEffect, useCallback } from 'react';
import { ColumnType, WipLimitsState } from '../types/kanban';
import { INITIAL_WIP_LIMITS, isValidWipLimitsState } from '../utils/seedData';

export const WIP_LIMITS_STORAGE_KEY = 'metrik_column_wip_limits';

export interface UseWipLimitsReturn {
  wipLimits: WipLimitsState;
  setWipLimit: (column: ColumnType, limit: number | null) => void;
  resetWipLimits: () => void;
}

const getInitialWipLimits = (): WipLimitsState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_WIP_LIMITS;
  }

  try {
    const rawData = window.localStorage.getItem(WIP_LIMITS_STORAGE_KEY);
    if (!rawData) {
      window.localStorage.setItem(WIP_LIMITS_STORAGE_KEY, JSON.stringify(INITIAL_WIP_LIMITS));
      return INITIAL_WIP_LIMITS;
    }

    const parsed = JSON.parse(rawData);
    if (isValidWipLimitsState(parsed)) {
      return parsed;
    }

    console.warn('[Metrik WIP] Estado inválido de WIP limits no storage. Restaurando padrão.');
    window.localStorage.setItem(WIP_LIMITS_STORAGE_KEY, JSON.stringify(INITIAL_WIP_LIMITS));
    return INITIAL_WIP_LIMITS;
  } catch (error) {
    console.error('[Metrik WIP] Falha ao ler limites de WIP do localStorage:', error);
    return INITIAL_WIP_LIMITS;
  }
};

export function useWipLimits(): UseWipLimitsReturn {
  const [wipLimits, setWipLimits] = useState<WipLimitsState>(getInitialWipLimits);

  useEffect(() => {
    try {
      window.localStorage.setItem(WIP_LIMITS_STORAGE_KEY, JSON.stringify(wipLimits));
    } catch (error) {
      console.error('[Metrik WIP] Falha ao persistir limites de WIP no localStorage:', error);
    }
  }, [wipLimits]);

  const setWipLimit = useCallback((column: ColumnType, limit: number | null) => {
    if (limit !== null) {
      if (typeof limit !== 'number' || isNaN(limit) || limit < 1 || !Number.isInteger(limit)) {
        return;
      }
    }

    setWipLimits((prev) => ({
      ...prev,
      [column]: limit,
    }));
  }, []);

  const resetWipLimits = useCallback(() => {
    setWipLimits(INITIAL_WIP_LIMITS);
  }, []);

  return {
    wipLimits,
    setWipLimit,
    resetWipLimits,
  };
}

/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE
 * Hook reativo e memoizado para projeção de SLE e níveis de risco por cartão no quadro Kanban.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnModel, TaskModel } from '../types/kanban';
import { CardSlePrediction, SleConfig, SleThresholds } from '../types/sle';
import { calculateThresholds, predictCardSle } from '../utils/slePredictor';
import {
  loadSleConfig,
  saveSleConfig,
  resetSleConfig as clearStoredSleConfig,
  getDefaultSleConfig,
} from '../utils/sleStorage';

export interface UseDynamicSleReturn {
  thresholds: SleThresholds;
  predictions: Record<string, CardSlePrediction>;
  config: SleConfig;
  updateConfig: (updates: Partial<Omit<SleConfig, 'boardId'>>) => void;
  resetConfig: () => void;
  riskCount: number;
}

export function useDynamicSle(
  boardId: string,
  tasks: TaskModel[] = [],
  columns: ColumnModel[] = [],
  tick: number = 0,
  referenceDate?: Date,
): UseDynamicSleReturn {
  const [config, setConfig] = useState<SleConfig>(() => loadSleConfig(boardId));

  // Sincroniza configuração quando o boardId muda
  useEffect(() => {
    setConfig(loadSleConfig(boardId));
  }, [boardId]);

  // Mapa de categorias de colunas para identificação de tarefas ativas
  const columnCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const col of columns) {
      map.set(col.id, col.category);
    }
    return map;
  }, [columns]);

  // 1. Isola tarefas concluídas para base histórica
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.completedAt) return true;
      const category = columnCategoryMap.get(task.column);
      return category === 'done';
    });
  }, [tasks, columnCategoryMap]);

  // 2. Calcula percentis históricos (P50, P85, P95)
  const thresholds = useMemo(() => {
    return calculateThresholds(completedTasks);
  }, [completedTasks]);

  // 3. Avalia o risco preditivo para cartões ativos em andamento
  const predictions = useMemo(() => {
    const map: Record<string, CardSlePrediction> = {};

    for (const task of tasks) {
      const category = columnCategoryMap.get(task.column);

      // Exclui colunas 'done' (já finalizadas) e 'todo' (ainda não iniciadas)
      if (category === 'done' || category === 'todo' || task.completedAt) {
        continue;
      }

      map[task.id] = predictCardSle(task, thresholds, config, referenceDate);
    }

    return map;
    // tick e referenceDate adicionados para reavaliar periodicamente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, thresholds, config, columnCategoryMap, tick, referenceDate]);

  // 4. Quantidade de itens em risco ativo no quadro
  const riskCount = useMemo(() => {
    let count = 0;
    for (const id in predictions) {
      const level = predictions[id].riskLevel;
      if (level === 'warning_p50' || level === 'risk_p85' || level === 'critical_p95') {
        count++;
      }
    }
    return count;
  }, [predictions]);

  // 5. Atualiza configurações de forma persistente
  const updateConfig = useCallback((updates: Partial<Omit<SleConfig, 'boardId'>>) => {
    setConfig((prev) => {
      const updated: SleConfig = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveSleConfig(updated);
      return updated;
    });
  }, []);

  // 6. Restaura configurações para o padrão
  const resetConfig = useCallback(() => {
    clearStoredSleConfig(boardId);
    setConfig(getDefaultSleConfig(boardId));
  }, [boardId]);

  return {
    thresholds,
    predictions,
    config,
    updateConfig,
    resetConfig,
    riskCount,
  };
}

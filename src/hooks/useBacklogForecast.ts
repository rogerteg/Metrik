/**
 * Metrik — Hook de Previsão de Backlog & Épicos com Monte Carlo
 * Feature: 056-monte-carlo-backlog-forecast
 *
 * Gerencia o estado de escopo, seleção fina de tarefas,
 * extração de throughput e execução reativa da simulação estocástica.
 */

import { useState, useMemo, useCallback } from 'react';
import { TaskModel } from '../types/kanban';
import {
  BacklogScopeType,
  BacklogForecastScope,
  BacklogMonteCarloForecastResult,
  ScopeSelectionOption,
} from '../../specs/056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
import { resolveBacklogScope, runBacklogMonteCarloForecast } from '../utils/monteCarloForecast';
import { extractDailyThroughput } from '../utils/monteCarlo';

export interface UseBacklogForecastOptions {
  tasks: TaskModel[];
  initialScopeType?: BacklogScopeType;
  initialScopeId?: string;
  referenceDate?: Date;
  windowDays?: number;
  trials?: number;
}

export interface AvailableScopes {
  initiatives: ScopeSelectionOption[];
  sprints: ScopeSelectionOption[];
  tags: ScopeSelectionOption[];
}

export interface UseBacklogForecastReturn {
  scopeType: BacklogScopeType;
  setScopeType: (type: BacklogScopeType) => void;
  scopeId: string | undefined;
  setScopeId: (id: string | undefined) => void;
  targetDate: string | undefined;
  setTargetDate: (date: string | undefined) => void;
  scope: BacklogForecastScope;
  toggleTaskSelection: (taskId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  windowDays: number;
  setWindowDays: (days: number) => void;
  isSampleSufficient: boolean;
  warningReason: string | undefined;
  forecastResult: BacklogMonteCarloForecastResult | null;
  availableScopes: AvailableScopes;
}

export function useBacklogForecast(options: UseBacklogForecastOptions): UseBacklogForecastReturn {
  const {
    tasks,
    initialScopeType = 'all',
    initialScopeId,
    referenceDate = new Date(),
    windowDays: initialWindowDays = 30,
    trials = 10000,
  } = options;

  const [scopeType, setScopeTypeState] = useState<BacklogScopeType>(initialScopeType);
  const [scopeId, setScopeIdState] = useState<string | undefined>(initialScopeId);
  const [customSelectedTaskIds, setCustomSelectedTaskIds] = useState<string[] | null>(null);
  const [customTargetDate, setCustomTargetDate] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState<number>(initialWindowDays);

  const handleSetScopeType = useCallback((newType: BacklogScopeType) => {
    setScopeTypeState(newType);
    setScopeIdState(undefined);
    setCustomSelectedTaskIds(null);
    setCustomTargetDate(null);
  }, []);

  const handleSetScopeId = useCallback((newId: string | undefined) => {
    setScopeIdState(newId);
    setCustomSelectedTaskIds(null);
    setCustomTargetDate(null);
  }, []);

  // Catálogo de agrupadores disponíveis para seleção na UI
  const availableScopes = useMemo<AvailableScopes>(() => {
    const initiatives: ScopeSelectionOption[] = tasks
      .filter((t) => t.type === 'initiative')
      .map((init) => {
        const linkedPending = tasks.filter(
          (t) =>
            !t.completedAt &&
            (t.links?.some((l) => l.targetTaskId === init.id) ||
              (t as unknown as { initiativeId?: string }).initiativeId === init.id),
        ).length;
        return {
          type: 'initiative',
          id: init.id,
          label: init.title,
          count: linkedPending,
          targetDate: init.dueDate || init.endDate,
        };
      });

    const sprintMap = new Map<string, { count: number; targetDate?: string }>();
    tasks.forEach((t) => {
      if (t.sprintId) {
        const current = sprintMap.get(t.sprintId) || { count: 0 };
        if (!t.completedAt) current.count++;
        if (t.dueDate && !current.targetDate) current.targetDate = t.dueDate;
        sprintMap.set(t.sprintId, current);
      }
    });
    const sprints: ScopeSelectionOption[] = Array.from(sprintMap.entries()).map(([id, data]) => ({
      type: 'sprint',
      id,
      label: `Sprint: ${id}`,
      count: data.count,
      targetDate: data.targetDate,
    }));

    const tagMap = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.completedAt && t.tags) {
        t.tags.forEach((tag) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });
    const tags: ScopeSelectionOption[] = Array.from(tagMap.entries()).map(([tag, count]) => ({
      type: 'tag',
      id: tag,
      label: `#${tag}`,
      count,
    }));

    return { initiatives, sprints, tags };
  }, [tasks]);

  // Resolução do escopo com as tarefas pendentes e selecionadas
  const scope = useMemo<BacklogForecastScope>(() => {
    return resolveBacklogScope(tasks, {
      type: scopeType,
      scopeId,
      selectedTaskIds: customSelectedTaskIds ?? undefined,
    });
  }, [tasks, scopeType, scopeId, customSelectedTaskIds]);

  const targetDate =
    customTargetDate !== null ? customTargetDate || undefined : scope.inferredTargetDate;

  const toggleTaskSelection = useCallback(
    (taskId: string) => {
      setCustomSelectedTaskIds((prev) => {
        const current = prev !== null ? prev : scope.pendingTasks.map((t) => t.id);
        if (current.includes(taskId)) {
          return current.filter((id) => id !== taskId);
        } else {
          return [...current, taskId];
        }
      });
    },
    [scope.pendingTasks],
  );

  const selectAll = useCallback(() => {
    setCustomSelectedTaskIds(scope.pendingTasks.map((t) => t.id));
  }, [scope.pendingTasks]);

  const clearSelection = useCallback(() => {
    setCustomSelectedTaskIds([]);
  }, []);

  const throughputHistory = useMemo(() => {
    const daily = extractDailyThroughput(tasks, windowDays, referenceDate);
    return daily.map((d) => d.count);
  }, [tasks, windowDays, referenceDate]);

  const forecastResult = useMemo(() => {
    return runBacklogMonteCarloForecast({
      scope,
      throughputHistory,
      targetDate,
      referenceDate,
      trials,
    });
  }, [scope, throughputHistory, targetDate, referenceDate, trials]);

  return {
    scopeType,
    setScopeType: handleSetScopeType,
    scopeId,
    setScopeId: handleSetScopeId,
    targetDate,
    setTargetDate: (date: string | undefined) => setCustomTargetDate(date || ''),
    scope,
    toggleTaskSelection,
    selectAll,
    clearSelection,
    windowDays,
    setWindowDays,
    isSampleSufficient: forecastResult.isSampleSufficient,
    warningReason: forecastResult.warningReason,
    forecastResult,
    availableScopes,
  };
}

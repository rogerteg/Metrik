/**
 * Hook customizado useMika - Ponto de integração central do copiloto de IA (Feature 048)
 * Conecta preferências, cache, chamadas de serviço, estado da gaveta e diagnósticos de fluxo.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-001, FR-006, FR-007, FR-009)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnModel, TaskModel } from '../types/kanban';
import { MikaDecomposition, MikaInsight, MikaPreferences } from '../types/mika';
import { mikaService } from '../services/ai/mikaService';

export interface UseMikaOptions {
  boardId?: string;
  columns?: ColumnModel[];
  tasks?: TaskModel[];
  autoDiagnose?: boolean;
}

export function useMika(options: UseMikaOptions = {}) {
  const { boardId = 'default-board', columns = [], tasks = [], autoDiagnose = true } = options;

  const [insights, setInsights] = useState<MikaInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<MikaPreferences>(() =>
    mikaService.getPreferences(),
  );

  const stableColumns = useMemo(() => columns, [columns]);

  // Carrega insights reativos se autoDiagnose estiver ativo
  const loadInsights = useCallback(
    async (forceRefresh = false) => {
      if (!boardId) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await mikaService.getBoardInsights(
          boardId,
          stableColumns,
          tasks,
          forceRefresh,
        );
        setInsights(result);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [boardId, stableColumns, tasks],
  );

  useEffect(() => {
    if (autoDiagnose && preferences.enabled) {
      loadInsights(false);
    }
  }, [loadInsights, autoDiagnose, preferences.enabled]);

  const refreshInsights = useCallback(async () => {
    await loadInsights(true);
  }, [loadInsights]);

  const updatePreferences = useCallback((updates: Partial<MikaPreferences>) => {
    const updated = mikaService.savePreferences(updates);
    setPreferences(updated);
  }, []);

  const clearApiKey = useCallback(() => {
    const updated = mikaService.clearApiKey();
    setPreferences(updated);
  }, []);

  const decomposeTask = useCallback(async (task: TaskModel): Promise<MikaDecomposition> => {
    return mikaService.decomposeTask(task);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  return {
    insights,
    isLoading,
    error,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    refreshInsights,
    preferences,
    updatePreferences,
    clearApiKey,
    decomposeTask,
  };
}

import { DatasetFilterConfig } from '../types/analytics';
import { TaskModel } from '../types/kanban';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Filtra a coleção de tarefas do quadro com base na configuração do conjunto de dados
 * (janela temporal de amostragem e tipos de cartões).
 *
 * @param tasks Tarefas brutas do quadro
 * @param config Configuração do filtro (DatasetFilterConfig)
 * @param referenceNowMs Timestamp de referência para janelas temporais (padrão: Date.now())
 */
export function filterTasksByDatasetConfig(
  tasks: TaskModel[],
  config: DatasetFilterConfig,
  referenceNowMs: number = Date.now()
): TaskModel[] {
  if (!tasks || tasks.length === 0) return [];
  if (!config) return tasks;

  let filtered = [...tasks];

  // 1. Filtro por tipo de item ('card' | 'subtask' | 'initiative')
  if (config.selectedTypes && config.selectedTypes.length > 0) {
    const typeSet = new Set(config.selectedTypes);
    filtered = filtered.filter((t) => {
      const type = t.type || 'card';
      return typeSet.has(type);
    });
  }

  // 2. Filtro temporal
  if (config.timeWindow === 'all') {
    return filtered;
  }

  if (config.timeWindow === 'custom') {
    const startMs = config.customStartDate ? new Date(config.customStartDate).getTime() : 0;
    const endMs = config.customEndDate ? new Date(config.customEndDate).getTime() : Infinity;

    return filtered.filter((t) => {
      const taskDateStr = t.completedAt || t.createdAt;
      if (!taskDateStr) return false;
      const taskTime = new Date(taskDateStr).getTime();
      return !isNaN(taskTime) && taskTime >= startMs && taskTime <= endMs;
    });
  }

  // Janelas numéricas predefinidas: 14, 30, 90, 180 dias
  const windowDays = Number(config.timeWindow);
  if (!isNaN(windowDays) && windowDays > 0) {
    const cutoffMs = referenceNowMs - windowDays * MS_PER_DAY;
    return filtered.filter((t) => {
      const taskDateStr = t.completedAt || t.createdAt;
      if (!taskDateStr) return false;
      const taskTime = new Date(taskDateStr).getTime();
      return !isNaN(taskTime) && taskTime >= cutoffMs;
    });
  }

  return filtered;
}

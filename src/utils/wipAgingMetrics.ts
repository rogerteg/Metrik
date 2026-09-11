/**
 * Utilitários e Métricas de Envelhecimento do Trabalho em Progresso (Aging WIP)
 * Baseado na literatura Lean / Kanban de Daniel Vacanti e Padrão NIST
 */

import { TaskModel, ColumnModel } from '../types/kanban';
import { calculatePercentile } from './statistics';

export interface AgingWorkItem {
  id: string;
  title: string;
  columnId: string;
  columnTitle: string;
  ageDays: number;
  timeInStageDays: number;
  createdAt: string;
  startedAt?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  riskZone: 'green' | 'yellow' | 'orange' | 'red';
}

export interface StagePacePercentiles {
  columnId: string;
  columnTitle: string;
  sampleCount: number;
  isFallback: boolean;
  p50: number;
  p70: number;
  p85: number;
  p95: number;
}

export interface StageWipColumn {
  id: string;
  title: string;
  wipCount: number;
  items: AgingWorkItem[];
  percentiles: StagePacePercentiles;
}

/**
 * Calcula a idade de uma tarefa em dias corridos com precisão decimal.
 * Baseia-se em startedAt (ou fallback createdAt) até a data de referência.
 */
export function calculateItemAgeDays(task: TaskModel, referenceDate: Date = new Date()): number {
  const startTimestamp = task.startedAt
    ? new Date(task.startedAt).getTime()
    : new Date(task.createdAt).getTime();

  const refTimestamp = referenceDate.getTime();
  const diffMs = Math.max(0, refTimestamp - startTimestamp);
  const days = diffMs / 86400000;

  // Garantir precisão decimal e mínimo de 0.1 para itens criados recentemente
  return Number(Math.max(0.1, days).toFixed(1));
}

/**
 * Calcula o tempo decorrido na etapa atual em dias.
 */
export function calculateTimeInStageDays(task: TaskModel, referenceDate: Date = new Date()): number {
  const baseTimestamp = task.updatedAt
    ? new Date(task.updatedAt).getTime()
    : task.startedAt
    ? new Date(task.startedAt).getTime()
    : new Date(task.createdAt).getTime();

  const diffMs = Math.max(0, referenceDate.getTime() - baseTimestamp);
  return Number(Math.max(0.1, diffMs / 86400000).toFixed(1));
}

/**
 * Hash determinístico simples de uma string para cálculo de dispersão horizontal (jitter).
 */
export function getDeterministicJitter(id: string, maxOffsetPx: number = 16): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0.0 a 1.0
  return (normalized - 0.5) * 2 * maxOffsetPx; // -maxOffsetPx a +maxOffsetPx
}

/**
 * Calcula os percentis de ritmo (Pace Percentiles: 50%, 70%, 85%, 95%) por coluna.
 * Caso a etapa possua poucas amostras históricas (< 3), aplica fallback para o ciclo global.
 */
export function calculateStagePacePercentiles(
  completedTasks: TaskModel[],
  columns: ColumnModel[]
): Map<string, StagePacePercentiles> {
  const result = new Map<string, StagePacePercentiles>();

  // Calcular tempos de ciclo globais de todas as tarefas concluídas
  const globalCycleTimes: number[] = [];
  completedTasks.forEach((t) => {
    if (t.completedAt) {
      const start = t.startedAt ? new Date(t.startedAt).getTime() : new Date(t.createdAt).getTime();
      const end = new Date(t.completedAt).getTime();
      const diffDays = Math.max(0.1, (end - start) / 86400000);
      globalCycleTimes.push(diffDays);
    }
  });

  const globalP50 = globalCycleTimes.length > 0 ? calculatePercentile(globalCycleTimes, 50) : 5.0;
  const globalP70 = globalCycleTimes.length > 0 ? calculatePercentile(globalCycleTimes, 70) : 7.0;
  const globalP85 = globalCycleTimes.length > 0 ? calculatePercentile(globalCycleTimes, 85) : 10.0;
  const globalP95 = globalCycleTimes.length > 0 ? calculatePercentile(globalCycleTimes, 95) : 14.0;

  // Filtrar apenas colunas que não sejam 'done'
  const activeColumns = columns.filter((c) => c.category !== 'done' && c.id !== 'done');
  const totalStages = Math.max(activeColumns.length, 1);

  activeColumns.forEach((col, index) => {
    // Proporção sequencial da etapa no fluxo (da esquerda para direita)
    const stageProgressFactor = (index + 1) / totalStages;

    // Se houver histórico granular, poderíamos medir permanência na coluna;
    // como fallback calibrado de ritmo acumulado (Pace), usamos a fração progressiva do ciclo global:
    const stageP50 = Number((globalP50 * stageProgressFactor).toFixed(1));
    const stageP70 = Number((globalP70 * stageProgressFactor).toFixed(1));
    const stageP85 = Number((globalP85 * stageProgressFactor).toFixed(1));
    const stageP95 = Number((globalP95 * stageProgressFactor).toFixed(1));

    result.set(col.id, {
      columnId: col.id,
      columnTitle: col.title,
      sampleCount: completedTasks.length,
      isFallback: completedTasks.length < 3,
      p50: Math.max(0.5, stageP50),
      p70: Math.max(1.0, stageP70),
      p85: Math.max(1.5, stageP85),
      p95: Math.max(2.0, stageP95),
    });
  });

  return result;
}

/**
 * Agrupa as tarefas ativas por coluna em andamento, calculando a idade e a zona de risco.
 */
export function groupActiveTasksByColumn(
  tasks: TaskModel[],
  columns: ColumnModel[],
  referenceDate: Date = new Date()
): StageWipColumn[] {
  // Identificar colunas concluídas
  const doneColIds = new Set(
    columns.filter((c) => c.category === 'done' || c.id === 'done').map((c) => c.id)
  );

  // Filtrar apenas tarefas ativas em progresso
  const activeTasks = tasks.filter(
    (t) => !doneColIds.has(t.column) && !Boolean(t.completedAt)
  );

  const completedTasks = tasks.filter((t) => doneColIds.has(t.column) || Boolean(t.completedAt));
  const percentilesMap = calculateStagePacePercentiles(completedTasks, columns);

  // Filtrar colunas em andamento (excluindo done)
  const activeColumns = columns.filter((c) => !doneColIds.has(c.id));

  return activeColumns.map((col) => {
    const colTasks = activeTasks.filter((t) => t.column === col.id);
    const percentiles = percentilesMap.get(col.id) || {
      columnId: col.id,
      columnTitle: col.title,
      sampleCount: 0,
      isFallback: true,
      p50: 3,
      p70: 5,
      p85: 8,
      p95: 12,
    };

    const items: AgingWorkItem[] = colTasks.map((t) => {
      const ageDays = calculateItemAgeDays(t, referenceDate);
      const timeInStageDays = calculateTimeInStageDays(t, referenceDate);

      // Determinar zona de risco baseada nos percentis da etapa
      let riskZone: 'green' | 'yellow' | 'orange' | 'red' = 'green';
      if (ageDays >= percentiles.p95) {
        riskZone = 'red';
      } else if (ageDays >= percentiles.p70) {
        riskZone = 'orange';
      } else if (ageDays >= percentiles.p50) {
        riskZone = 'yellow';
      }

      return {
        id: t.id,
        title: t.title,
        columnId: col.id,
        columnTitle: col.title,
        ageDays,
        timeInStageDays,
        createdAt: t.createdAt,
        startedAt: t.startedAt,
        isBlocked: t.blocked,
        blockedReason: t.blockedReason,
        riskZone,
      };
    });

    return {
      id: col.id,
      title: col.title,
      wipCount: items.length,
      items,
      percentiles,
    };
  });
}

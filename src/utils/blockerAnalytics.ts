import { BlockerClusterItem, BlockerDynamicsSummary } from '../types/analytics';
import { TaskModel } from '../types/kanban';
import { calculateLeadTimeMs } from './timeFormatters';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Agrupa tarefas que sofreram impedimentos por motivo/causa raiz (Blocker Clustering)
 * e mensura a retenção temporal acumulada no fluxo de trabalho (Blocker Dynamics).
 *
 * @param tasks Tarefas do quadro
 */
export function calculateBlockerClusters(tasks: TaskModel[]): BlockerDynamicsSummary {
  if (!tasks || tasks.length === 0) {
    return {
      totalBlockedTasks: 0,
      accumulatedBlockedMs: 0,
      impactOnLeadTimePercentage: 0,
      clusters: [],
    };
  }

  const blockedTasks = tasks.filter(
    (t) => t.blocked || (t.totalBlockedMs && t.totalBlockedMs > 0) || Boolean(t.blockedReason)
  );

  if (blockedTasks.length === 0) {
    return {
      totalBlockedTasks: 0,
      accumulatedBlockedMs: 0,
      impactOnLeadTimePercentage: 0,
      clusters: [],
    };
  }

  let accumulatedBlockedMs = 0;
  const reasonMap = new Map<string, { count: number; totalDurationMs: number }>();

  for (const task of blockedTasks) {
    const rawReason = task.blockedReason?.trim();
    const reason = rawReason && rawReason.length > 0 ? rawReason : 'Motivo não especificado';
    const duration = task.totalBlockedMs && task.totalBlockedMs > 0 ? task.totalBlockedMs : 0;

    accumulatedBlockedMs += duration;

    const existing = reasonMap.get(reason) || { count: 0, totalDurationMs: 0 };
    existing.count += 1;
    existing.totalDurationMs += duration;
    reasonMap.set(reason, existing);
  }

  let totalOccurrences = 0;
  for (const item of reasonMap.values()) {
    totalOccurrences += item.count;
  }

  const clusters: BlockerClusterItem[] = [];
  for (const [reason, stats] of reasonMap.entries()) {
    const percentage =
      totalOccurrences > 0
        ? Number(((stats.count / totalOccurrences) * 100).toFixed(1))
        : 0;
    const avgDurationDays =
      stats.count > 0
        ? Number((stats.totalDurationMs / stats.count / MS_PER_DAY).toFixed(1))
        : 0;

    clusters.push({
      reason,
      occurrenceCount: stats.count,
      percentage,
      totalDurationMs: stats.totalDurationMs,
      avgDurationDays,
    });
  }

  // Ordenar por número de ocorrências e depois por duração total
  clusters.sort((a, b) => {
    if (b.occurrenceCount !== a.occurrenceCount) {
      return b.occurrenceCount - a.occurrenceCount;
    }
    return b.totalDurationMs - a.totalDurationMs;
  });

  // Impacto em relação ao Lead Time total das tarefas
  let totalLeadTimeMs = 0;
  for (const task of tasks) {
    const lead = calculateLeadTimeMs(task);
    if (lead !== null && lead > 0) {
      totalLeadTimeMs += lead;
    }
  }

  const impactOnLeadTimePercentage =
    totalLeadTimeMs > 0
      ? Number(Math.min(100, (accumulatedBlockedMs / totalLeadTimeMs) * 100).toFixed(1))
      : 0;

  return {
    totalBlockedTasks: blockedTasks.length,
    accumulatedBlockedMs,
    impactOnLeadTimePercentage,
    clusters,
  };
}

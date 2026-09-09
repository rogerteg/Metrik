import { useMemo } from 'react';
import { FlowMetricsSummary, TaskModel } from '../types/kanban';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
} from '../utils/timeFormatters';

export function useFlowMetrics(
  completedTasks: TaskModel[],
  allBoardTasks?: TaskModel[]
): FlowMetricsSummary {
  return useMemo(() => {
    const throughput = completedTasks.length;
    const taskPoolForBlocked = allBoardTasks || completedTasks;
    const blockedCount = taskPoolForBlocked.filter((t) => t.blocked).length;

    if (throughput === 0) {
      return {
        throughput: 0,
        avgLeadTimeMs: null,
        avgCycleTimeMs: null,
        formattedAvgLeadTime: '-',
        formattedAvgCycleTime: '-',
        blockedCount,
        flowEfficiency: null,
        formattedFlowEfficiency: '-',
      };
    }

    let totalLeadTimeMs = 0;
    let validLeadTimeCount = 0;

    let totalCycleTimeMs = 0;
    let validCycleTimeCount = 0;
    let totalActiveTimeMs = 0;

    for (const task of completedTasks) {
      const leadMs = calculateLeadTimeMs(task);
      if (leadMs !== null) {
        totalLeadTimeMs += leadMs;
        validLeadTimeCount += 1;
      }

      const cycleMs = calculateCycleTimeMs(task);
      if (cycleMs !== null) {
        totalCycleTimeMs += cycleMs;
        validCycleTimeCount += 1;

        const blockedMs = task.totalBlockedMs || 0;
        const activeMs = Math.max(0, cycleMs - blockedMs);
        totalActiveTimeMs += activeMs;
      }
    }

    const avgLeadTimeMs =
      validLeadTimeCount > 0 ? Math.round(totalLeadTimeMs / validLeadTimeCount) : null;
    const avgCycleTimeMs =
      validCycleTimeCount > 0 ? Math.round(totalCycleTimeMs / validCycleTimeCount) : null;

    let flowEfficiency: number | null = null;
    let formattedFlowEfficiency = '-';

    if (totalCycleTimeMs > 0) {
      flowEfficiency = Math.min(100, Math.max(0, Math.round((totalActiveTimeMs / totalCycleTimeMs) * 100)));
      formattedFlowEfficiency = `${flowEfficiency}%`;
    }

    return {
      throughput,
      avgLeadTimeMs,
      avgCycleTimeMs,
      formattedAvgLeadTime: formatDuration(avgLeadTimeMs),
      formattedAvgCycleTime: formatDuration(avgCycleTimeMs),
      blockedCount,
      flowEfficiency,
      formattedFlowEfficiency,
    };
  }, [completedTasks, allBoardTasks]);
}

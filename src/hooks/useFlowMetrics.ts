import { useMemo } from 'react';
import { FlowMetricsSummary, TaskModel } from '../types/kanban';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
} from '../utils/timeFormatters';

export function useFlowMetrics(completedTasks: TaskModel[]): FlowMetricsSummary {
  return useMemo(() => {
    const throughput = completedTasks.length;

    if (throughput === 0) {
      return {
        throughput: 0,
        avgLeadTimeMs: null,
        avgCycleTimeMs: null,
        formattedAvgLeadTime: '-',
        formattedAvgCycleTime: '-',
      };
    }

    let totalLeadTimeMs = 0;
    let validLeadTimeCount = 0;

    let totalCycleTimeMs = 0;
    let validCycleTimeCount = 0;

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
      }
    }

    const avgLeadTimeMs =
      validLeadTimeCount > 0 ? Math.round(totalLeadTimeMs / validLeadTimeCount) : null;
    const avgCycleTimeMs =
      validCycleTimeCount > 0 ? Math.round(totalCycleTimeMs / validCycleTimeCount) : null;

    return {
      throughput,
      avgLeadTimeMs,
      avgCycleTimeMs,
      formattedAvgLeadTime: formatDuration(avgLeadTimeMs),
      formattedAvgCycleTime: formatDuration(avgCycleTimeMs),
    };
  }, [completedTasks]);
}

import { ServiceLevelExpectation } from '../types/analytics';
import { TaskModel } from '../types/kanban';
import { calculatePercentile } from './statistics';
import { calculateCycleTimeMs } from './timeFormatters';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calcula a Expectativa de Nível de Serviço (SLE) e conformidade histórica.
 * Adota percentis NIST Nearest Rank / Linear Interpolation via calculatePercentile.
 *
 * @param completedTasks Tarefas concluídas no período analisado
 * @param targetPercentile Percentil de referência da equipe (padrão: 85)
 * @param targetDays Meta estipulada em dias (opcional)
 */
export function calculateSleMetrics(
  completedTasks: TaskModel[],
  targetPercentile: number = 85,
  targetDays?: number | null
): ServiceLevelExpectation {
  const calculatedAt = new Date().toISOString();

  if (!completedTasks || completedTasks.length === 0) {
    return {
      targetPercentile,
      observedDays: 0,
      targetDays: targetDays ?? null,
      complianceRate: 100,
      sampleSize: 0,
      calculatedAt,
    };
  }

  const cycleTimesDays: number[] = [];
  for (const task of completedTasks) {
    const ms = calculateCycleTimeMs(task);
    if (ms !== null && !isNaN(ms) && ms >= 0) {
      const days = Number((ms / MS_PER_DAY).toFixed(1));
      cycleTimesDays.push(days);
    }
  }

  if (cycleTimesDays.length === 0) {
    return {
      targetPercentile,
      observedDays: 0,
      targetDays: targetDays ?? null,
      complianceRate: 100,
      sampleSize: 0,
      calculatedAt,
    };
  }

  const observedDays = calculatePercentile(cycleTimesDays, targetPercentile);

  // Determinar limite de conformidade (meta configurada ou percentil observado)
  const threshold = targetDays && targetDays > 0 ? targetDays : observedDays;
  const compliantCount = cycleTimesDays.filter((d) => d <= threshold).length;
  const complianceRate = Math.round((compliantCount / cycleTimesDays.length) * 100);

  return {
    targetPercentile,
    observedDays,
    targetDays: targetDays ?? null,
    complianceRate,
    sampleSize: cycleTimesDays.length,
    calculatedAt,
  };
}
